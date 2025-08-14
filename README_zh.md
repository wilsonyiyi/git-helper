# Git Helper - Git 分支清理工具

一个强大的 Git 分支清理命令行工具，支持 glob 模式匹配和白名单功能。

## ✨ 功能特性

- 🔍 **Glob 模式匹配** - 支持使用通配符模式匹配分支名称
- 🛡️ **白名单保护** - 保护重要分支不被误删
- 🌍 **本地/远程支持** - 同时支持本地和远程分支清理
- 🔒 **安全预览** - 干运行模式，预览将要删除的分支
- ⚙️ **灵活配置** - 全局和项目级配置管理
- 🎨 **美观界面** - 彩色输出和清晰的操作反馈

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone <repository-url>
cd git-helper

# 运行安装脚本
./install.sh

# 或手动安装
npm install
npm link
```

### 基本用法

```bash
# 1. 初始化配置
git-helper config --init

# 2. 预览要删除的分支
git-helper preview --patterns "feature/*" --local

# 3. 删除本地 feature 分支（预览模式）
git-helper clean --patterns "feature/*" --local --dry-run

# 4. 确认无误后实际删除
git-helper clean --patterns "feature/*" --local
```

## 📖 详细使用指南

### 清理命令 (clean)

```bash
git-helper clean [选项]
```

#### 常用选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `-p, --patterns` | Glob 模式匹配 | `-p "feature/*" "hotfix/*"` |
| `-w, --whitelist` | 白名单保护 | `-w "main" "develop"` |
| `-l, --local` | 清理本地分支 | |
| `-r, --remote` | 清理远程分支 | |
| `--dry-run` | 预览模式 | |
| `-y, --yes` | 自动确认 | |

### 预览命令 (preview)

```bash
git-helper preview --patterns "feature/*" --local --remote
```

### 配置管理 (config)

```bash
# 初始化配置文件
git-helper config --init

# 设置默认模式
git-helper config --set defaultPatterns "feature/*,hotfix/*"

# 查看所有配置
git-helper config --list
```

## 💡 使用场景

### 场景 1: 清理已完成的功能分支

```bash
# 预览
git-helper clean -p "feature/*" -l -r --dry-run

# 执行
git-helper clean -p "feature/*" -l -r
```

### 场景 2: 批量清理多种类型分支

```bash
git-helper clean -p "feature/*" "hotfix/*" "bugfix/*" \
  -w "main" "develop" -l
```

### 场景 3: 清理个人测试分支

```bash
git-helper clean -p "test-*" "*-wip" "*-backup" -l -f
```

### 场景 4: 安全清理（推荐）

```bash
# 使用白名单保护重要分支
git-helper clean -p "*" \
  -w "main" "master" "develop" "staging" "production" \
  -l --dry-run
```

## 🔧 Glob 模式示例

| 模式 | 匹配 | 说明 |
|------|------|------|
| `feature/*` | `feature/login`, `feature/payment` | 匹配 feature/ 下所有分支 |
| `*fix*` | `bugfix/123`, `hotfix/critical` | 包含 "fix" 的分支 |
| `test-*` | `test-ui`, `test-api` | 以 "test-" 开头的分支 |
| `*-temp` | `feature-temp`, `hotfix-temp` | 以 "-temp" 结尾的分支 |
| `user-*/temp` | `user-john/temp` | 特定格式的临时分支 |

## ⚙️ 配置文件

### 全局配置 (~/.git-helper/config.json)

```json
{
  "defaultPatterns": ["feature/*", "hotfix/*"],
  "defaultWhitelist": ["main", "master", "develop", "dev"],
  "defaultRemote": "origin",
  "autoConfirm": false,
  "forceDelete": false
}
```

### 项目配置 (.git-helper.json)

```json
{
  "defaultPatterns": ["story/*", "task/*"],
  "defaultWhitelist": ["main", "staging", "production"],
  "defaultRemote": "upstream"
}
```

## 🛡️ 安全特性

1. **当前分支保护** - 无法删除当前所在分支
2. **白名单机制** - 重要分支默认受保护
3. **预览确认** - 删除前显示详细列表
4. **交互确认** - 需要用户明确确认
5. **错误处理** - 详细的错误信息和恢复建议

## 🚨 注意事项

- ⚠️ 删除远程分支操作不可逆，请谨慎使用
- 🔍 建议先使用 `--dry-run` 预览
- 🛡️ 重要分支请加入白名单保护
- 📝 删除前确保代码已备份或合并

## 🛠️ 开发

```bash
# 安装开发依赖
npm install

# 运行测试
npm test

# 本地开发
npm run start
```

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**⭐ 如果这个工具对你有帮助，请给个 Star！**