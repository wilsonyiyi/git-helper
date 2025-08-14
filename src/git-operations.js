const { simpleGit } = require('simple-git');
const { minimatch } = require('minimatch');
const chalk = require('chalk');

class GitOperations {
  constructor() {
    this.git = simpleGit();
  }

  /**
   * 获取所有本地分支
   */
  async getLocalBranches() {
    try {
      const summary = await this.git.branchLocal();
      return Object.keys(summary.branches).filter(branch => branch !== 'HEAD');
    } catch (error) {
      throw new Error(`获取本地分支失败: ${error.message}`);
    }
  }

  /**
   * 获取所有远程分支
   */
  async getRemoteBranches() {
    try {
      const summary = await this.git.branch(['--remote']);
      return Object.keys(summary.branches)
        .filter(branch => branch !== 'HEAD')
        .map(branch => branch.replace(/^origin\//, ''));
    } catch (error) {
      throw new Error(`获取远程分支失败: ${error.message}`);
    }
  }

  /**
   * 根据 glob 模式和白名单过滤分支
   */
  filterBranches(branches, patterns, whitelist = []) {
    if (!patterns || patterns.length === 0) {
      return [];
    }

    let matchedBranches = [];

    // 应用 glob 模式匹配
    for (const pattern of patterns) {
      const matched = branches.filter(branch => minimatch(branch, pattern));
      matchedBranches = [...new Set([...matchedBranches, ...matched])];
    }

    // 应用白名单过滤
    if (whitelist && whitelist.length > 0) {
      matchedBranches = matchedBranches.filter(branch => {
        return !whitelist.some(whitePattern => minimatch(branch, whitePattern));
      });
    }

    return matchedBranches;
  }

  /**
   * 删除本地分支
   */
  async deleteLocalBranches(branches, force = false) {
    const results = [];
    const currentBranch = await this.getCurrentBranch();

    for (const branch of branches) {
      try {
        // 不能删除当前分支
        if (branch === currentBranch) {
          results.push({
            branch,
            success: false,
            error: '不能删除当前分支'
          });
          continue;
        }

        await this.git.deleteLocalBranch(branch, force);
        results.push({
          branch,
          success: true
        });
      } catch (error) {
        results.push({
          branch,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 删除远程分支
   */
  async deleteRemoteBranches(branches, remote = 'origin') {
    const results = [];

    // 检查远程仓库是否存在
    const remotes = await this.getRemotes();
    if (!remotes.includes(remote)) {
      throw new Error(`远程仓库 '${remote}' 不存在`);
    }

    for (const branch of branches) {
      try {
        await this.git.push(remote, `:${branch}`);
        results.push({
          branch,
          success: true
        });
      } catch (error) {
        let errorMessage = error.message;
        
        // 提供更友好的错误信息
        if (error.message.includes('does not exist')) {
          errorMessage = '分支不存在';
        } else if (error.message.includes('permission denied') || error.message.includes('forbidden')) {
          errorMessage = '权限不足';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = '网络连接失败';
        }
        
        results.push({
          branch,
          success: false,
          error: errorMessage
        });
      }
    }

    return results;
  }

  /**
   * 获取当前分支
   */
  async getCurrentBranch() {
    try {
      const summary = await this.git.branchLocal();
      return summary.current;
    } catch (error) {
      throw new Error(`获取当前分支失败: ${error.message}`);
    }
  }

  /**
   * 检查是否在 git 仓库中
   */
  async isGitRepository() {
    try {
      await this.git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取所有远程仓库
   */
  async getRemotes() {
    try {
      const remotes = await this.git.getRemotes(true);
      return remotes.map(remote => remote.name);
    } catch (error) {
      throw new Error(`获取远程仓库失败: ${error.message}`);
    }
  }

  /**
   * 预览将要删除的分支
   */
  async previewDeletion(config) {
    const {
      patterns,
      whitelist,
      includeLocal,
      includeRemote,
      remote
    } = config;

    const preview = {
      local: [],
      remote: []
    };

    if (includeLocal) {
      const localBranches = await this.getLocalBranches();
      preview.local = this.filterBranches(localBranches, patterns, whitelist);
    }

    if (includeRemote) {
      const remoteBranches = await this.getRemoteBranches();
      preview.remote = this.filterBranches(remoteBranches, patterns, whitelist);
    }

    return preview;
  }
}

module.exports = GitOperations;