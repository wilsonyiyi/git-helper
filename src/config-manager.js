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
   * 确保配置目录存在
   */
  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * 初始化配置文件
   */
  initConfig() {
    this.ensureConfigDir();
    
    if (fs.existsSync(this.configFile)) {
      console.log(chalk.yellow('配置文件已存在'));
      return;
    }

    fs.writeFileSync(this.configFile, JSON.stringify(this.defaultConfig, null, 2));
    console.log(chalk.green(`✅ 配置文件已创建: ${this.configFile}`));
  }

  /**
   * 读取配置
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
      console.log(chalk.yellow(`配置文件解析失败，使用默认配置: ${error.message}`));
      return this.defaultConfig;
    }
  }

  /**
   * 写入配置
   */
  writeConfig(config) {
    this.ensureConfigDir();
    
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.log(chalk.red(`配置文件写入失败: ${error.message}`));
      return false;
    }
  }

  /**
   * 设置配置项
   */
  setConfig(key, value) {
    const config = this.readConfig();
    
    // 处理数组类型的配置
    if (key === 'defaultPatterns' || key === 'defaultWhitelist') {
      if (typeof value === 'string') {
        value = value.split(',').map(item => item.trim());
      }
    }

    // 处理布尔类型的配置
    if (key === 'autoConfirm' || key === 'forceDelete') {
      if (typeof value === 'string') {
        value = value.toLowerCase() === 'true';
      }
    }

    config[key] = value;
    
    if (this.writeConfig(config)) {
      console.log(chalk.green(`✅ 配置已更新: ${key} = ${JSON.stringify(value)}`));
    }
  }

  /**
   * 获取配置项
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
   * 列出所有配置
   */
  listConfig() {
    const config = this.readConfig();
    
    console.log(chalk.bold('📋 当前配置:'));
    Object.entries(config).forEach(([key, value]) => {
      console.log(chalk.blue(`  ${key}: ${JSON.stringify(value)}`));
    });
  }

  /**
   * 获取项目级配置
   */
  getProjectConfig() {
    const projectConfigFile = path.join(process.cwd(), '.git-cleaner.json');
    
    if (fs.existsSync(projectConfigFile)) {
      try {
        const configContent = fs.readFileSync(projectConfigFile, 'utf8');
        return JSON.parse(configContent);
      } catch (error) {
        console.log(chalk.yellow(`项目配置文件解析失败: ${error.message}`));
        return {};
      }
    }
    
    return {};
  }

  /**
   * 合并全局和项目配置
   */
  getMergedConfig() {
    const globalConfig = this.readConfig();
    const projectConfig = this.getProjectConfig();
    
    return { ...globalConfig, ...projectConfig };
  }
}

module.exports = ConfigManager;