const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.git-cleaner');
    this.configFile = path.join(this.configDir, 'config.json');
    this.defaultConfig = {
      defaultPatterns: [],
      defaultWhitelist: ['main', 'master', 'develop', 'dev'],
      defaultRemote: 'origin',
      autoConfirm: false,
      forceDelete: false
    };
  }

  /**
   * Ensure configuration directory exists
   */
  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * Initialize configuration file
   */
  initConfig() {
    this.ensureConfigDir();
    
    if (fs.existsSync(this.configFile)) {
      console.log(chalk.yellow('Configuration file already exists'));
      return;
    }

    fs.writeFileSync(this.configFile, JSON.stringify(this.defaultConfig, null, 2));
    console.log(chalk.green(`✅ Configuration file created: ${this.configFile}`));
  }

  /**
   * Read configuration
   */
  readConfig() {
    if (!fs.existsSync(this.configFile)) {
      return this.defaultConfig;
    }

    try {
      const configContent = fs.readFileSync(this.configFile, 'utf8');
      const config = JSON.parse(configContent);
      return { ...this.defaultConfig, ...config };
    } catch (error) {
      console.log(chalk.yellow(`Configuration file parsing failed, using default configuration: ${error.message}`));
      return this.defaultConfig;
    }
  }

  /**
   * Write configuration
   */
  writeConfig(config) {
    this.ensureConfigDir();
    
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.log(chalk.red(`Failed to write configuration file: ${error.message}`));
      return false;
    }
  }

  /**
   * Set configuration item
   */
  setConfig(key, value) {
    const config = this.readConfig();
    
    // Handle array type configuration
    if (key === 'defaultPatterns' || key === 'defaultWhitelist') {
      if (typeof value === 'string') {
        value = value.split(',').map(item => item.trim());
      }
    }

    // Handle boolean type configuration
    if (key === 'autoConfirm' || key === 'forceDelete') {
      if (typeof value === 'string') {
        value = value.toLowerCase() === 'true';
      }
    }

    config[key] = value;
    
    if (this.writeConfig(config)) {
      console.log(chalk.green(`✅ Configuration updated: ${key} = ${JSON.stringify(value)}`));
    }
  }

  /**
   * Get configuration item
   */
  getConfig(key) {
    const config = this.readConfig();
    
    if (key) {
      const value = config[key];
      console.log(chalk.blue(`${key}: ${JSON.stringify(value)}`));
      return value;
    }
    
    return config;
  }

  /**
   * List all configuration
   */
  listConfig() {
    const config = this.readConfig();
    
    console.log(chalk.bold('📋 Current configuration:'));
    Object.entries(config).forEach(([key, value]) => {
      console.log(chalk.blue(`  ${key}: ${JSON.stringify(value)}`));
    });
  }

  /**
   * Get project-level configuration
   */
  getProjectConfig() {
    const projectConfigFile = path.join(process.cwd(), '.git-cleaner.json');
    
    if (fs.existsSync(projectConfigFile)) {
      try {
        const configContent = fs.readFileSync(projectConfigFile, 'utf8');
        return JSON.parse(configContent);
      } catch (error) {
        console.log(chalk.yellow(`Project configuration file parsing failed: ${error.message}`));
        return {};
      }
    }
    
    return {};
  }

  /**
   * Merge global and project configuration
   */
  getMergedConfig() {
    const globalConfig = this.readConfig();
    const projectConfig = this.getProjectConfig();
    
    return { ...globalConfig, ...projectConfig };
  }
}

module.exports = ConfigManager;