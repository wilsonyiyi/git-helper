#!/bin/bash

# Git Helper 快速发布脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Git Helper 快速发布脚本${NC}"

# 检查参数
RELEASE_TYPE=${1:-patch}

case $RELEASE_TYPE in
  patch|minor|major|beta)
    echo -e "${GREEN}📝 发布类型: $RELEASE_TYPE${NC}"
    ;;
  *)
    echo -e "${RED}❌ 无效的发布类型: $RELEASE_TYPE${NC}"
    echo "使用方法: ./scripts/quick-release.sh [patch|minor|major|beta]"
    exit 1
    ;;
esac

# 检查工作区状态
if ! git diff --quiet; then
  echo -e "${RED}❌ 工作区有未提交的更改${NC}"
  exit 1
fi

# 检查是否有暂存的更改
if ! git diff --cached --quiet; then
  echo -e "${RED}❌ 有已暂存但未提交的更改${NC}"
  exit 1
fi

# 拉取最新代码
echo -e "${BLUE}📥 拉取最新代码...${NC}"
git pull

# 运行测试（如果有）
echo -e "${BLUE}🧪 运行测试...${NC}"
npm run test || true

# 更新版本
echo -e "${BLUE}📝 更新版本号...${NC}"
if [ "$RELEASE_TYPE" = "beta" ]; then
  NEW_VERSION=$(npm version prerelease --preid=beta)
else
  NEW_VERSION=$(npm version $RELEASE_TYPE)
fi

echo -e "${GREEN}✅ 版本已更新为: $NEW_VERSION${NC}"

# 推送代码和标签
echo -e "${BLUE}📤 推送代码和标签...${NC}"
git push && git push --tags

# 发布到 NPM
echo -e "${BLUE}📦 发布到 NPM...${NC}"
if [ "$RELEASE_TYPE" = "beta" ]; then
  npm publish --tag beta
else
  npm publish
fi

echo -e "${GREEN}🎉 发布完成！${NC}"
echo -e "${BLUE}📦 版本: $NEW_VERSION${NC}"
echo -e "${BLUE}🔗 NPM: https://www.npmjs.com/package/@wilson_janet/git-helper${NC}"