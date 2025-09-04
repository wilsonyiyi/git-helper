const { Command } = require('commander');
const chalk = require('chalk');
const { Confirm } = require('enquirer');
const path = require('path');
const fs = require('fs');
const GitOperations = require('./git-operations');
const ConfigManager = require('./config-manager');

class CLI {
  constructor() {
    this.program = new Command();
    this.gitOps = new GitOperations();
    this.configManager = new ConfigManager();
    this.setupCommands();
  }

  /**
   * Get version from package.json
   */
  getVersion() {
    try {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Failed to read version number: ${error.message}`));
      return 'Unknown version';
    }
  }

  setupCommands() {
    this.program
      .name('git-cleaner')
      .description('Git branch cleanup tool with glob patterns and whitelist support')
      .version(this.getVersion());

    // Clean branches command
    this.program
      .command('clean')
      .description('Clean matching Git branches')
      .option('-p, --patterns <patterns...>', 'Glob patterns for branch names (e.g., "feature/*" "hotfix/*")')
      .option('-w, --whitelist <whitelist...>', 'Whitelist patterns, matching branches won\'t be deleted')
      .option('-l, --local', 'Clean local branches', false)
      .option('-r, --remote', 'Clean remote branches', false)
      .option('--remote-name <name>', 'Remote repository name', 'origin')
      .option('-f, --force', 'Force delete branches (local only)', false)
      .option('--dry-run', 'Preview mode, show branches to be deleted without actually deleting', false)
      .option('-y, --yes', 'Auto-confirm, don\'t show interactive prompts', false)
      .action(async (options) => {
        await this.handleCleanCommand(options);
      });

    // Config command
    this.program
      .command('config')
      .description('Manage configuration')
      .option('--set <items...>', 'Set configuration items (format: key value)')
      .option('--get <key>', 'Get configuration item')
      .option('--list', 'List all configuration')
      .option('--init', 'Initialize configuration file')
      .action(async (options) => {
        await this.handleConfigCommand(options);
      });

    // Preview command
    this.program
      .command('preview')
      .description('Preview branches to be deleted')
      .option('-p, --patterns <patterns...>', 'Glob patterns for branch names')
      .option('-w, --whitelist <whitelist...>', 'Whitelist patterns')
      .option('-l, --local', 'Include local branches', false)
      .option('-r, --remote', 'Include remote branches', false)
      .action(async (options) => {
        await this.handlePreviewCommand(options);
      });
  }

  async handleCleanCommand(options) {
    try {
      // Check if in git repository
      if (!(await this.gitOps.isGitRepository())) {
        console.log(chalk.red('❌ Current directory is not a Git repository'));
        process.exit(1);
      }

      // Get merged configuration
      const config = this.configManager.getMergedConfig();
      
      // Merge command line arguments with configuration defaults
      const finalOptions = this.mergeOptionsWithConfig(options, config);

      // Validate parameters
      if (!finalOptions.patterns || finalOptions.patterns.length === 0) {
        console.log(chalk.yellow('⚠️  Please provide at least one glob pattern or configure defaultPatterns'));
        console.log(chalk.gray('Example: git-cleaner clean -p "feature/*" -l'));
        console.log(chalk.gray('Or: git-cleaner config --set defaultPatterns "feature/*,hotfix/*"'));
        process.exit(1);
      }

      if (!finalOptions.local && !finalOptions.remote) {
        console.log(chalk.yellow('⚠️  Please specify to clean local branches (-l) or remote branches (-r)'));
        process.exit(1);
      }

      // Preview branches to be deleted
      const preview = await this.gitOps.previewDeletion({
        patterns: finalOptions.patterns,
        whitelist: finalOptions.whitelist,
        includeLocal: finalOptions.local,
        includeRemote: finalOptions.remote,
        remote: finalOptions.remoteName
      });

      // Show preview
      this.displayPreview(preview, finalOptions);

      if (preview.local.length === 0 && preview.remote.length === 0) {
        console.log(chalk.green('✅ No matching branches to delete'));
        return;
      }

      // If preview mode, return directly
      if (finalOptions.dryRun) {
        console.log(chalk.blue('\n🔍 This is preview mode, no branches were actually deleted'));
        return;
      }

      // Confirm deletion
      if (!finalOptions.yes) {
        const prompt = new Confirm({
          name: 'confirmed',
          message: 'Are you sure you want to delete these branches?',
          initial: false
        });

        const confirmed = await prompt.run();

        if (!confirmed) {
          console.log(chalk.yellow('Operation cancelled'));
          return;
        }
      }

      // Execute deletion
      await this.executeDeletion(preview, finalOptions);

    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  }

  async handlePreviewCommand(options) {
    try {
      if (!(await this.gitOps.isGitRepository())) {
        console.log(chalk.red('❌ Current directory is not a Git repository'));
        process.exit(1);
      }

      // Get merged configuration
      const config = this.configManager.getMergedConfig();
      
      // Merge command line arguments with configuration defaults
      const finalOptions = this.mergeOptionsWithConfig(options, config);

      if (!finalOptions.patterns || finalOptions.patterns.length === 0) {
        console.log(chalk.yellow('⚠️  Please provide at least one glob pattern or configure defaultPatterns'));
        console.log(chalk.gray('Example: git-cleaner preview -p "feature/*" -l'));
        console.log(chalk.gray('Or: git-cleaner config --set defaultPatterns "feature/*,hotfix/*"'));
        process.exit(1);
      }

      const preview = await this.gitOps.previewDeletion({
        patterns: finalOptions.patterns,
        whitelist: finalOptions.whitelist,
        includeLocal: finalOptions.local,
        includeRemote: finalOptions.remote
      });

      this.displayPreview(preview, finalOptions);
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
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

      // If no specific operation is specified, show help
      console.log(chalk.yellow('Please specify configuration operation:'));
      console.log(chalk.gray('  --init          Initialize configuration file'));
      console.log(chalk.gray('  --set <key> <value>  Set configuration item'));
      console.log(chalk.gray('  --get <key>     Get configuration item'));
      console.log(chalk.gray('  --list          List all configuration'));
    } catch (error) {
      console.log(chalk.red(`❌ Configuration operation failed: ${error.message}`));
    }
  }

  displayPreview(preview, options) {
    console.log(chalk.bold('\n📋 Matching branches preview:'));
    
    if (options.local && preview.local.length > 0) {
      console.log(chalk.blue('\n🔹 Local branches:'));
      preview.local.forEach(branch => {
        console.log(chalk.gray(`  - ${branch}`));
      });
    }

    if (options.remote && preview.remote.length > 0) {
      console.log(chalk.blue('\n🔹 Remote branches:'));
      preview.remote.forEach(branch => {
        console.log(chalk.gray(`  - ${branch}`));
      });
    }

    const totalCount = preview.local.length + preview.remote.length;
    console.log(chalk.bold(`\n📊 Total: ${totalCount} branches`));
  }

  async executeDeletion(preview, options) {
    console.log(chalk.blue('\n🗑️  Starting branch deletion...'));

    // Delete local branches
    if (options.local && preview.local.length > 0) {
      console.log(chalk.blue('\nDeleting local branches:'));
      const results = await this.gitOps.deleteLocalBranches(preview.local, options.force);
      
      results.forEach(result => {
        if (result.success) {
          console.log(chalk.green(`  ✅ ${result.branch}`));
        } else {
          console.log(chalk.red(`  ❌ ${result.branch}: ${result.error}`));
        }
      });
    }

    // Delete remote branches
    if (options.remote && preview.remote.length > 0) {
      console.log(chalk.blue('\nDeleting remote branches:'));
      const results = await this.gitOps.deleteRemoteBranches(preview.remote, options.remoteName);
      
      results.forEach(result => {
        if (result.success) {
          console.log(chalk.green(`  ✅ ${result.branch}`));
        } else {
          console.log(chalk.red(`  ❌ ${result.branch}: ${result.error}`));
        }
      });
    }

    console.log(chalk.green('\n✅ Branch cleanup completed!'));
  }

  /**
   * Merge command line options with configuration file defaults
   */
  mergeOptionsWithConfig(options, config) {
    const finalOptions = { ...options };

    // If command line doesn't provide patterns, use defaultPatterns from config
    if (!finalOptions.patterns || finalOptions.patterns.length === 0) {
      finalOptions.patterns = config.defaultPatterns || [];
    }

    // If command line doesn't provide whitelist, use defaultWhitelist from config
    if (!finalOptions.whitelist || finalOptions.whitelist.length === 0) {
      finalOptions.whitelist = config.defaultWhitelist || [];
    }

    // If command line doesn't provide remoteName, use defaultRemote from config
    if (!finalOptions.remoteName) {
      finalOptions.remoteName = config.defaultRemote || 'origin';
    }

    // If command line doesn't provide yes, use autoConfirm from config
    if (!finalOptions.yes && config.autoConfirm) {
      finalOptions.yes = config.autoConfirm;
    }

    // If command line doesn't provide force, use forceDelete from config
    if (!finalOptions.force && config.forceDelete) {
      finalOptions.force = config.forceDelete;
    }

    return finalOptions;
  }

  run() {
    this.program.parse();
  }
}

module.exports = CLI;