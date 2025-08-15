#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const packagePath = path.join(__dirname, '..', 'package.json');
const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return result?.trim();
  } catch (error) {
    colorLog('red', `❌ 命令执行失败: ${command}`);
    colorLog('red', error.message);
    process.exit(1);
  }
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function preReleaseChecks() {
  colorLog('cyan', '🔍 执行发布前检查...');

  // 检查是否在 git 仓库中
  try {
    execCommand('git status', { silent: true });
  } catch {
    colorLog('red', '❌ 当前目录不是 Git 仓库');
    process.exit(1);
  }

  // 检查工作区是否干净
  const status = execCommand('git status --porcelain', { silent: true });
  if (status) {
    colorLog('red', '❌ 工作区有未提交的更改，请先提交或暂存');
    console.log(status);
    process.exit(1);
  }

  // 检查是否在主分支
  const currentBranch = execCommand('git branch --show-current', { silent: true });
  if (currentBranch !== 'master' && currentBranch !== 'main') {
    const answer = await prompt(`⚠️  当前在分支 "${currentBranch}"，建议在主分支发布。是否继续？ (y/N): `);
    if (answer.toLowerCase() !== 'y') {
      colorLog('yellow', '已取消发布');
      process.exit(0);
    }
  }

  // 检查远程仓库连接
  try {
    execCommand('git fetch --dry-run', { silent: true });
  } catch {
    colorLog('red', '❌ 无法连接到远程仓库');
    process.exit(1);
  }

  // 检查是否有未推送的提交
  try {
    const unpushed = execCommand('git log @{u}..HEAD --oneline', { silent: true });
    if (unpushed) {
      colorLog('yellow', '⚠️  有未推送的提交：');
      console.log(unpushed);
      const answer = await prompt('是否先推送这些提交？ (Y/n): ');
      if (answer.toLowerCase() !== 'n') {
        execCommand('git push');
      }
    }
  } catch {
    colorLog('yellow', '⚠️  无法检查远程分支状态');
  }

  colorLog('green', '✅ 发布前检查通过');
}

async function selectReleaseType() {
  colorLog('cyan', '\n📋 请选择发布类型:');
  console.log('1. patch (1.0.0 -> 1.0.1) - 修复bug');
  console.log('2. minor (1.0.0 -> 1.1.0) - 新功能');
  console.log('3. major (1.0.0 -> 2.0.0) - 破坏性更改');
  console.log('4. beta  (1.0.0 -> 1.0.1-beta.0) - 测试版本');
  console.log('5. 自定义版本号');

  const choice = await prompt('\n请输入选择 (1-5): ');

  switch (choice) {
    case '1':
      return 'patch';
    case '2':
      return 'minor';
    case '3':
      return 'major';
    case '4':
      return 'prerelease';
    case '5':
      const customVersion = await prompt('请输入版本号 (例如: 1.2.3): ');
      return customVersion;
    default:
      colorLog('red', '❌ 无效选择');
      process.exit(1);
  }
}

function updateVersion(releaseType) {
  colorLog('cyan', `\n📝 更新版本号 (${releaseType})...`);
  
  if (['patch', 'minor', 'major', 'prerelease'].includes(releaseType)) {
    const versionCommand = releaseType === 'prerelease' 
      ? 'npm version prerelease --preid=beta'
      : `npm version ${releaseType}`;
    
    const newVersion = execCommand(versionCommand, { silent: true });
    colorLog('green', `✅ 版本已更新为: ${newVersion}`);
    return newVersion;
  } else {
    // 自定义版本号
    execCommand(`npm version ${releaseType}`);
    colorLog('green', `✅ 版本已更新为: ${releaseType}`);
    return releaseType;
  }
}

async function generateChangelog() {
  colorLog('cyan', '\n📋 生成更新日志...');
  
  try {
    // 获取最新的 tag
    const latestTag = execCommand('git describe --tags --abbrev=0', { silent: true });
    const commits = execCommand(`git log ${latestTag}..HEAD --oneline`, { silent: true });
    
    if (commits) {
      colorLog('blue', '\n📄 本次发布包含的更改:');
      console.log(commits);
      
      const addToChangelog = await prompt('\n是否添加到 CHANGELOG.md？ (Y/n): ');
      if (addToChangelog.toLowerCase() !== 'n') {
        // 这里可以实现自动生成 CHANGELOG 的逻辑
        colorLog('blue', '💡 提示: 您可以手动更新 CHANGELOG.md');
      }
    }
  } catch {
    colorLog('yellow', '⚠️  无法生成更新日志（可能是首次发布）');
  }
}

async function publishToNpm(isPrerelease = false) {
  colorLog('cyan', '\n📦 发布到 NPM...');
  
  // 检查是否已登录 npm
  try {
    const whoami = execCommand('npm whoami', { silent: true });
    colorLog('blue', `📝 当前 NPM 用户: ${whoami}`);
  } catch {
    colorLog('red', '❌ 请先登录 NPM: npm login');
    process.exit(1);
  }

  // 确认发布
  const currentVersion = package.version;
  const publishCommand = isPrerelease ? 'npm publish --tag beta' : 'npm publish';
  
  const confirm = await prompt(`\n确认发布版本 ${currentVersion} 到 NPM？ (y/N): `);
  if (confirm.toLowerCase() !== 'y') {
    colorLog('yellow', '已取消发布');
    process.exit(0);
  }

  // 执行发布
  execCommand(publishCommand);
  colorLog('green', `✅ 成功发布到 NPM: ${package.name}@${currentVersion}`);
}

async function postReleaseActions(version, isPrerelease) {
  colorLog('cyan', '\n🎉 执行发布后操作...');

  // 推送 tags
  execCommand('git push --tags');
  
  if (!isPrerelease) {
    colorLog('blue', '\n📋 发布后建议:');
    console.log('1. 检查 NPM 包页面: https://www.npmjs.com/package/' + package.name);
    console.log('2. 更新项目文档');
    console.log('3. 在 GitHub 创建 Release');
    console.log('4. 通知团队成员新版本发布');
    
    const createGitHubRelease = await prompt('\n是否在 GitHub 创建 Release？ (y/N): ');
    if (createGitHubRelease.toLowerCase() === 'y') {
      colorLog('blue', '💡 请访问: ' + (package.repository?.url || 'GitHub仓库') + '/releases/new');
    }
  }

  colorLog('green', '\n🎊 发布完成！');
  colorLog('blue', `📦 版本: ${version}`);
  colorLog('blue', `🔗 NPM: https://www.npmjs.com/package/${package.name}`);
}

async function main() {
  try {
    colorLog('magenta', '🚀 开始发布流程...\n');
    
    // 发布前检查
    await preReleaseChecks();
    
    // 选择发布类型
    const releaseType = await selectReleaseType();
    const isPrerelease = releaseType === 'prerelease' || releaseType.includes('beta');
    
    // 更新版本号
    const newVersion = updateVersion(releaseType);
    
    // 生成更新日志
    await generateChangelog();
    
    // 发布到 NPM
    await publishToNpm(isPrerelease);
    
    // 发布后操作
    await postReleaseActions(newVersion, isPrerelease);
    
  } catch (error) {
    colorLog('red', `❌ 发布失败: ${error.message}`);
    process.exit(1);
  }
}

// 处理命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Git Helper Release Script

用法:
  node scripts/release.js [选项]

选项:
  --help, -h     显示帮助信息
  --patch        直接发布 patch 版本
  --minor        直接发布 minor 版本  
  --major        直接发布 major 版本
  --beta         直接发布 beta 版本

示例:
  node scripts/release.js           # 交互式发布
  node scripts/release.js --patch   # 直接发布补丁版本
  node scripts/release.js --beta    # 直接发布测试版本
  `);
  process.exit(0);
}

// 处理快捷命令
if (args.includes('--patch')) {
  (async () => {
    await preReleaseChecks();
    updateVersion('patch');
    await publishToNpm();
    await postReleaseActions('patch', false);
  })();
} else if (args.includes('--minor')) {
  (async () => {
    await preReleaseChecks();
    updateVersion('minor');
    await publishToNpm();
    await postReleaseActions('minor', false);
  })();
} else if (args.includes('--major')) {
  (async () => {
    await preReleaseChecks();
    updateVersion('major');
    await publishToNpm();
    await postReleaseActions('major', false);
  })();
} else if (args.includes('--beta')) {
  (async () => {
    await preReleaseChecks();
    updateVersion('prerelease');
    await publishToNpm(true);
    await postReleaseActions('prerelease', true);
  })();
} else {
  // 交互式模式
  main();
}