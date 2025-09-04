const simpleGit = require('simple-git');
const minimatch = require('minimatch');
const chalk = require('chalk');

class GitOperations {
  constructor() {
    this.git = simpleGit();
  }

  /**
   * Get all local branches
   */
  async getLocalBranches() {
    try {
      const summary = await this.git.branchLocal();
      return summary.all.filter(branch => branch !== 'HEAD');
    } catch (error) {
      throw new Error(`Failed to get local branches: ${error.message}`);
    }
  }

  /**
   * Get all remote branches
   */
  async getRemoteBranches() {
    try {
      const summary = await this.git.branch(['-r']);
      return summary.all
        .filter(branch => branch !== 'HEAD')
        .map(branch => branch.replace(/^origin\//, ''));
    } catch (error) {
      throw new Error(`Failed to get remote branches: ${error.message}`);
    }
  }

  /**
   * Filter branches by glob patterns and whitelist
   */
  filterBranches(branches, patterns, whitelist = []) {
    if (!patterns || patterns.length === 0) {
      return [];
    }

    let matchedBranches = [];

    // Apply glob pattern matching
    for (const pattern of patterns) {
      const matched = branches.filter(branch => minimatch(branch, pattern));
      matchedBranches = [...new Set([...matchedBranches, ...matched])];
    }

    // Apply whitelist filtering
    if (whitelist && whitelist.length > 0) {
      matchedBranches = matchedBranches.filter(branch => {
        return !whitelist.some(whitePattern => minimatch(branch, whitePattern));
      });
    }

    return matchedBranches;
  }

  /**
   * Delete local branches
   */
  async deleteLocalBranches(branches, force = false) {
    const results = [];
    const currentBranch = await this.getCurrentBranch();

    for (const branch of branches) {
      try {
        // Cannot delete current branch
        if (branch === currentBranch) {
          results.push({
            branch,
            success: false,
            error: 'Cannot delete current branch'
          });
          continue;
        }

        if (force) {
          await this.git.branch(['-D', branch]);
        } else {
          await this.git.branch(['-d', branch]);
        }
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
   * Delete remote branches
   */
  async deleteRemoteBranches(branches, remote = 'origin') {
    const results = [];

    // Check if remote repository exists
    const remotes = await this.getRemotes();
    if (!remotes.includes(remote)) {
      throw new Error(`Remote repository '${remote}' does not exist`);
    }

    for (const branch of branches) {
      try {
        await this.git.push(remote, branch, ['--delete']);
        results.push({
          branch,
          success: true
        });
      } catch (error) {
        let errorMessage = error.message;
        
        // Provide more friendly error messages
        if (error.message.includes('does not exist')) {
          errorMessage = 'Branch does not exist';
        } else if (error.message.includes('permission denied') || error.message.includes('forbidden')) {
          errorMessage = 'Insufficient permissions';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = 'Network connection failed';
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
   * Get current branch
   */
  async getCurrentBranch() {
    try {
      const summary = await this.git.branchLocal();
      return summary.current;
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error.message}`);
    }
  }

  /**
   * Check if in git repository
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
   * Get all remote repositories
   */
  async getRemotes() {
    try {
      const remotes = await this.git.getRemotes(true);
      return remotes.map(remote => remote.name);
    } catch (error) {
      throw new Error(`Failed to get remote repositories: ${error.message}`);
    }
  }

  /**
   * Preview branches to be deleted
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