#!/bin/bash

# Git Helper 使用示例脚本

echo "=== Git Helper 使用示例 ==="

echo ""
echo "1. 预览要删除的 feature 分支:"
node ../src/index.js preview --patterns "feature/*" --local

echo ""
echo "2. 预览要删除的 hotfix 和 bugfix 分支:"
node ../src/index.js preview --patterns "*fix/*" --local

echo ""
echo "3. 预览所有分支但保护重要分支:"
node ../src/index.js preview --patterns "*" --whitelist "master" "main" "develop" --local

echo ""
echo "4. 干运行模式 - 预览删除临时分支:"
node ../src/index.js clean --patterns "temp-*" --local --dry-run

echo ""
echo "5. 查看配置:"
node ../src/index.js config --list

echo ""
echo "6. 显示帮助:"
node ../src/index.js --help