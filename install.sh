#!/bin/bash

# Git Helper 安装脚本

echo "🚀 安装 Git Helper..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js (版本 >= 14.0.0)"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="14.0.0"

if ! [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "❌ 错误: Node.js 版本需要 >= $REQUIRED_VERSION, 当前版本: $NODE_VERSION"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 创建全局链接
echo "🔗 创建全局链接..."
npm link

echo "✅ 安装完成！"
echo ""
echo "使用方法:"
echo "  git-cleaner --help                 # 查看帮助"
echo "  git-cleaner config --init          # 初始化配置"
echo "  git-cleaner preview -p 'feature/*' -l  # 预览分支"
echo ""
echo "更多使用示例请查看 README.md"