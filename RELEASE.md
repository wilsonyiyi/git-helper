# Git Helper 发布指南

本文档说明如何发布 Git Helper 到 NPM。

## 🚀 快速发布

### 方式 1: 使用快速脚本（推荐）

```bash
# 补丁版本发布 (1.0.0 -> 1.0.1)
npm run release:patch

# 小版本发布 (1.0.0 -> 1.1.0) 
npm run release:minor

# 大版本发布 (1.0.0 -> 2.0.0)
npm run release:major

# 测试版本发布 (1.0.0 -> 1.0.1-beta.0)
npm run release:beta
```

### 方式 2: 交互式发布

```bash
# 启动交互式发布流程
npm run release
# 或
npm run release:interactive
```

### 方式 3: 手动发布

```bash
# 1. 更新版本号
npm version patch  # 或 minor/major

# 2. 推送代码和标签
git push && git push --tags

# 3. 发布到 NPM
npm publish
```

## 📋 发布前检查清单

在发布前，请确保：

- [ ] ✅ 代码已提交并推送到远程仓库
- [ ] 🧪 所有测试通过 (`npm test`)
- [ ] 📝 代码符合规范 (`npm run lint`) 
- [ ] 📚 文档已更新
- [ ] 🔍 功能已验证
- [ ] 🏷️ 版本号合理

## 🔧 版本控制规范

我们遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)：

- **PATCH** (1.0.1): Bug 修复，向后兼容
- **MINOR** (1.1.0): 新功能，向后兼容  
- **MAJOR** (2.0.0): 破坏性更改，不向后兼容
- **PRERELEASE** (1.0.1-beta.0): 预发布版本

### 示例

```bash
# 修复了一个 bug
npm run release:patch

# 添加了新的 --force 选项
npm run release:minor  

# 更改了命令行接口，不兼容旧版本
npm run release:major

# 发布测试版本供用户试用
npm run release:beta
```

## 📦 NPM 包配置

### 包名
- 完整包名: `@wilson_janet/git-helper`
- 全局命令: `git-helper`

### 发布配置
- 公开访问: `"access": "public"`
- 注册表: `https://registry.npmjs.org/`
- 偏好全局安装: `"preferGlobal": true`

### 包含的文件
只有以下文件会被发布到 NPM：

- `src/` - 源代码
- `bin/` - 可执行文件
- `README.md` - 主要文档
- `README_zh.md` - 中文文档  
- `.git-helper.example.json` - 示例配置

## 🛠️ 发布脚本说明

### quick-release.sh
快速发布脚本，执行基本的发布流程：

1. 检查工作区状态
2. 拉取最新代码
3. 运行测试
4. 更新版本号
5. 推送代码和标签
6. 发布到 NPM

### release.js
交互式发布脚本，提供完整的发布体验：

1. 全面的发布前检查
2. 交互式版本选择
3. 自动生成更新日志
4. 发布确认
5. 发布后操作建议

## 🔍 发布验证

发布后请验证：

```bash
# 检查 NPM 包页面
open https://www.npmjs.com/package/@wilson_janet/git-helper

# 测试全局安装
npm install -g @wilson_janet/git-helper
git-helper --version
git-helper --help

# 测试功能
cd /path/to/git/repo
git-helper preview --patterns "feature/*" --local
```

## 🚨 发布故障排除

### 常见问题

1. **NPM 登录问题**
   ```bash
   npm login
   npm whoami  # 确认登录状态
   ```

2. **权限问题**
   ```bash
   npm access list packages @wilsontech
   ```

3. **版本冲突**
   ```bash
   npm view @wilson_janet/git-helper versions --json
   ```

4. **网络问题**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

### 回滚发布

如果需要撤销发布：

```bash
# 仅在发布后 72 小时内有效
npm unpublish @wilson_janet/git-helper@1.0.1 --force

# 推荐：发布修复版本
npm run release:patch
```

## 📱 持续集成 (未来)

计划集成 GitHub Actions 自动发布：

- 当推送 tag 时自动发布
- 自动运行测试
- 自动生成 Release Notes
- 多平台测试

## 📞 联系方式

如有发布相关问题，请：

1. 查看 [NPM 包页面](https://www.npmjs.com/package/@wilson_janet/git-helper)
2. 提交 [GitHub Issue](https://github.com/wilson/git-helper/issues)
3. 联系维护者

---

**注意**: 发布是不可逆操作，请谨慎执行！