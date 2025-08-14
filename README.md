# Git Helper

一个强大的 Git 分支清理命令行工具，支持 glob 模式匹配和白名单功能。

## 功能特性

- 🔍 支持 glob 模式匹配分支名称
- 🛡️ 白名单保护重要分支
- 🌍 支持本地和远程分支清理
- 🔒 安全预览模式
- ⚙️ 灵活的配置管理
- 🎨 美观的命令行界面

## 安装

### 全局安装

```bash
npm install -g git-helper
```

### 本地开发

```bash
git clone <repository>
cd git-helper
npm install
npm link  # 创建全局链接
```

## 快速开始

### 基本用法

```bash
# 预览要删除的分支
git-helper clean --patterns "feature/*" --local --dry-run

# 删除本地的 feature 分支
git-helper clean --patterns "feature/*" --local

# 删除远程的 feature 和 hotfix 分支
git-helper clean --patterns "feature/*" "hotfix/*" --remote

# 使用白名单保护重要分支
git-helper clean --patterns "*" --whitelist "main" "develop" --local
```

## 命令详解

### clean 命令

清理匹配的 Git 分支

```bash
git-helper clean [选项]
```

#### 选项

| 选项 | 描述 | 示例 |
|------|------|------|
| `-p, --patterns <patterns...>` | 分支名称的 glob 模式 | `-p "feature/*" "hotfix/*"` |
| `-w, --whitelist <whitelist...>` | 白名单模式，匹配的分支不会被删除 | `-w "main" "develop"` |
| `-l, --local` | 清理本地分支 | `-l` |
| `-r, --remote` | 清理远程分支 | `-r` |
| `--remote-name <name>` | 远程仓库名称，默认为 origin | `--remote-name upstream` |
| `-f, --force` | 强制删除分支（仅本地分支） | `-f` |
| `--dry-run` | 预览模式，不实际删除 | `--dry-run` |
| `-y, --yes` | 自动确认，不显示交互提示 | `-y` |

### preview 命令

预览将要删除的分支

```bash
git-helper preview --patterns "feature/*" --local --remote
```

### config 命令

管理配置文件

```bash
# 初始化配置文件
git-helper config --init

# 设置默认模式
git-helper config --set defaultPatterns "feature/*,hotfix/*"
git-helper config --set defaultWhitelist "main,develop"

# 查看配置
git-helper config --list
git-helper config --get defaultPatterns
```

## Glob 模式示例

| 模式 | 匹配示例 | 说明 |
|------|----------|------|
| `feature/*` | feature/login, feature/payment | 匹配 feature/ 下的所有分支 |
| `*fix*` | bugfix/123, hotfix/login | 匹配包含 fix 的分支 |
| `release-*` | release-1.0, release-2.0 | 匹配以 release- 开头的分支 |
| `user-*-temp` | user-john-temp, user-jane-temp | 匹配特定格式的临时分支 |
| `*/cleanup` | feature/cleanup, bugfix/cleanup | 匹配以 /cleanup 结尾的分支 |

## 配置文件

### 全局配置

位置：`~/.git-helper/config.json`

```json
{
  "defaultPatterns": ["feature/*", "hotfix/*"],
  "defaultWhitelist": ["main", "master", "develop", "dev"],
  "defaultRemote": "origin",
  "autoConfirm": false,
  "forceDelete": false
}
```

### 项目配置

在项目根目录创建 `.git-helper.json`：

```json
{
  "defaultPatterns": ["story/*", "task/*"],
  "defaultWhitelist": ["main", "staging", "production"],
  "defaultRemote": "upstream"
}
```

项目配置会覆盖全局配置。

## 使用场景

### 场景 1：清理功能分支

开发完成后清理本地和远程的功能分支：

```bash
git-helper clean -p "feature/*" -l -r --dry-run  # 先预览
git-helper clean -p "feature/*" -l -r -y         # 确认后执行
```

### 场景 2：批量清理多种类型分支

```bash
git-helper clean -p "feature/*" "hotfix/*" "bugfix/*" -w "main" "develop" -l
```

### 场景 3：清理个人临时分支

```bash
git-helper clean -p "temp-*" "*-wip" "*-backup" -l -f
```

### 场景 4：定期清理

结合 cron 或 GitHub Actions 定期清理：

```bash
# 每周清理已合并的功能分支
git-helper clean -p "feature/*" -r -y
```

## 安全特性

1. **当前分支保护**：不能删除当前所在分支
2. **白名单保护**：重要分支（如 main、develop）默认受保护
3. **预览模式**：`--dry-run` 让你安全地查看将要删除的分支
4. **交互确认**：默认需要用户确认才会执行删除操作
5. **详细反馈**：显示每个分支的删除结果和错误信息

## 错误处理

- 非 Git 仓库检测
- 网络连接问题（远程分支操作）
- 权限问题
- 分支不存在
- 未推送的本地更改警告

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run start

# 运行测试
npm test
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License