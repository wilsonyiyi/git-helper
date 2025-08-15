# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- 即将发布的新功能

### Changed

- 即将发布的更改

### Fixed

- 即将发布的修复

## [1.0.0] - 2025-08-14

### Added

- 🎉 首次发布 Git Helper CLI 工具
- ✨ 支持 glob 模式匹配分支名称
- 🛡️ 白名单保护重要分支功能
- 🌍 本地和远程分支清理支持
- 🔒 安全预览模式 (`--dry-run`)
- ⚙️ 全局和项目级配置管理
- 🎨 美观的彩色命令行界面
- 📋 交互式确认机制
- 🚀 完整的发布工作流和脚本

### Features

- **命令行接口**:
  - `clean` - 清理匹配的分支
  - `preview` - 预览将要删除的分支
  - `config` - 配置管理
- **安全特性**:
  - 当前分支保护
  - 白名单机制
  - 交互式确认
  - 详细错误处理
- **配置支持**:
  - 全局配置文件 (`~/.git-helper/config.json`)
  - 项目配置文件 (`.git-helper.json`)
  - 默认白名单保护
- **发布工具**:
  - 自动化发布脚本
  - 语义化版本控制
  - NPM 包优化
  - GitHub Actions 集成

### Documentation

- 📚 完整的英文和中文文档
- 🎯 详细的使用示例和场景
- 🔧 安装和配置指南
- 📋 发布和贡献指南

---

## 版本说明

- **Major**: 破坏性更改，需要更新使用方式
- **Minor**: 新功能，向后兼容
- **Patch**: Bug 修复，向后兼容

## 链接

- [NPM Package](https://www.npmjs.com/package/@wilson_janet/git-helper)
- [GitHub Repository](https://github.com/wilsonyiyi/git-helper)
- [Issues](https://github.com/wilsonyiyi/git-helper/issues)
