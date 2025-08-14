const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const GitOperations = require('./git-operations');
const ConfigManager = require('./config-manager');

class CLI {
  constructor() {
    this.program = new Command();
    this.gitOps = new GitOperations();
    this.configManager = new ConfigManager();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('git-helper')
      .description('Git 分支清理工具 - 支持 glob 模式和白名单')
      .version('1.0.0');

    // 清理分支命令
    this.program
      .command('clean')
      .description('清理匹配的 Git 分支')
      .option('-p, --patterns <patterns...>', '分支名称的 glob 模式 (例如: "feature/*" "hotfix/*")')
      .option('-w, --whitelist <whitelist...>', '白名单模式，匹配的分支不会被删除')
      .option('-l, --local', '清理本地分支', false)
      .option('-r, --remote', '清理远程分支', false)
      .option('--remote-name <name>', '远程仓库名称', 'origin')
      .option('-f, --force', '强制删除分支（本地分支）', false)
      .option('--dry-run', '预览模式，显示将要删除的分支但不实际删除', false)
      .option('-y, --yes', '自动确认，不显示交互式提示', false)
      .action(async (options) => {
        await this.handleCleanCommand(options);
      });

    // 配置命令
    this.program
      .command('config')
      .description('管理配置')
      .option('--set <items...>', '设置配置项 (格式: key value)')
      .option('--get <key>', '获取配置项')
      .option('--list', '列出所有配置')
      .option('--init', '初始化配置文件')
      .action(async (options) => {
        await this.handleConfigCommand(options);
      });

    // 预览命令
    this.program
      .command('preview')
      .description('预览将要删除的分支')
      .option('-p, --patterns <patterns...>', '分支名称的 glob 模式')
      .option('-w, --whitelist <whitelist...>', '白名单模式')
      .option('-l, --local', '包含本地分支', false)
      .option('-r, --remote', '包含远程分支', false)
      .action(async (options) => {
        await this.handlePreviewCommand(options);
      });
  }

  async handleCleanCommand(options) {
    try {
      // 检查是否在 git 仓库中
      if (!(await this.gitOps.isGitRepository())) {
        console.log(chalk.red('❌ 当前目录不是 Git 仓库'));
        process.exit(1);
      }

      // 验证参数
      if (!options.patterns || options.patterns.length === 0) {
        console.log(chalk.yellow('⚠️  请提供至少一个 glob 模式'));
        console.log(chalk.gray('例如: git-helper clean -p "feature/*" -l'));
        process.exit(1);
      }

      if (!options.local && !options.remote) {
        console.log(chalk.yellow('⚠️  请指定要清理本地分支 (-l) 或远程分支 (-r)'));
        process.exit(1);
      }

      // 预览将要删除的分支
      const preview = await this.gitOps.previewDeletion({
        patterns: options.patterns,
        whitelist: options.whitelist || [],
        includeLocal: options.local,
        includeRemote: options.remote,
        remote: options.remoteName
      });

      // 显示预览
      this.displayPreview(preview, options);

      if (preview.local.length === 0 && preview.remote.length === 0) {
        console.log(chalk.green('✅ 没有匹配的分支需要删除'));
        return;
      }

      // 如果是预览模式，直接返回
      if (options.dryRun) {
        console.log(chalk.blue('\n🔍 这是预览模式，没有实际删除任何分支'));
        return;
      }

      // 确认删除
      if (!options.yes) {
        const { confirmed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmed',
            message: '确定要删除这些分支吗？',
            default: false
          }
        ]);

        if (!confirmed) {
          console.log(chalk.yellow('已取消操作'));
          return;
        }
      }

      // 执行删除
      await this.executeDeletion(preview, options);

    } catch (error) {
      console.log(chalk.red(`❌ 错误: ${error.message}`));
      process.exit(1);
    }
  }

  async handlePreviewCommand(options) {
    try {
      if (!(await this.gitOps.isGitRepository())) {
        console.log(chalk.red('❌ 当前目录不是 Git 仓库'));
        process.exit(1);
      }

      if (!options.patterns || options.patterns.length === 0) {
        console.log(chalk.yellow('⚠️  请提供至少一个 glob 模式'));
        process.exit(1);
      }

      const preview = await this.gitOps.previewDeletion({
        patterns: options.patterns,
        whitelist: options.whitelist || [],
        includeLocal: options.local,
        includeRemote: options.remote
      });

      this.displayPreview(preview, options);
    } catch (error) {
      console.log(chalk.red(`❌ 错误: ${error.message}`));
      process.exit(1);
    }
  }

  async handleConfigCommand(options) {
    try {
      if (options.init) {
        this.configManager.initConfig();
        return;
      }

      if (options.set && options.set.length >= 2) {
        const [key, ...valueParts] = options.set;
        const value = valueParts.join(' ');
        this.configManager.setConfig(key, value);
        return;
      }

      if (options.get) {
        this.configManager.getConfig(options.get);
        return;
      }

      if (options.list) {
        this.configManager.listConfig();
        return;
      }

      // 如果没有指定具体操作，显示帮助
      console.log(chalk.yellow('请指定配置操作:'));
      console.log(chalk.gray('  --init          初始化配置文件'));
      console.log(chalk.gray('  --set <key> <value>  设置配置项'));
      console.log(chalk.gray('  --get <key>     获取配置项'));
      console.log(chalk.gray('  --list          列出所有配置'));
    } catch (error) {
      console.log(chalk.red(`❌ 配置操作失败: ${error.message}`));
    }
  }

  displayPreview(preview, options) {
    console.log(chalk.bold('\n📋 匹配的分支预览:'));
    
    if (options.local && preview.local.length > 0) {
      console.log(chalk.blue('\n🔹 本地分支:'));
      preview.local.forEach(branch => {
        console.log(chalk.gray(`  - ${branch}`));
      });
    }

    if (options.remote && preview.remote.length > 0) {
      console.log(chalk.blue('\n🔹 远程分支:'));
      preview.remote.forEach(branch => {
        console.log(chalk.gray(`  - ${branch}`));
      });
    }

    const totalCount = preview.local.length + preview.remote.length;
    console.log(chalk.bold(`\n📊 总计: ${totalCount} 个分支`));
  }

  async executeDeletion(preview, options) {
    console.log(chalk.blue('\n🗑️  开始删除分支...'));

    // 删除本地分支
    if (options.local && preview.local.length > 0) {
      console.log(chalk.blue('\n删除本地分支:'));
      const results = await this.gitOps.deleteLocalBranches(preview.local, options.force);
      
      results.forEach(result => {
        if (result.success) {
          console.log(chalk.green(`  ✅ ${result.branch}`));
        } else {
          console.log(chalk.red(`  ❌ ${result.branch}: ${result.error}`));
        }
      });
    }

    // 删除远程分支
    if (options.remote && preview.remote.length > 0) {
      console.log(chalk.blue('\n删除远程分支:'));
      const results = await this.gitOps.deleteRemoteBranches(preview.remote, options.remoteName);
      
      results.forEach(result => {
        if (result.success) {
          console.log(chalk.green(`  ✅ ${result.branch}`));
        } else {
          console.log(chalk.red(`  ❌ ${result.branch}: ${result.error}`));
        }
      });
    }

    console.log(chalk.green('\n✅ 分支清理完成！'));
  }

  run() {
    this.program.parse();
  }
}

module.exports = CLI;