[简体中文](./README_zh.md)

# Git Cleaner

A powerful command-line tool for cleaning up Git branches with glob pattern matching and whitelist functionality.

## Features

- 🔍 Support glob pattern matching for branch names
- 🛡️ Whitelist protection for important branches
- 🌍 Support both local and remote branch cleanup
- 🔒 Safe preview mode
- ⚙️ Flexible configuration management
- 🎨 Beautiful command-line interface

## Installation

### Global Installation

```bash
npm install -g @wilson_janet/git-cleaner
```

### Local Development

```bash
git clone https://github.com/wilson/git-cleaner.git
cd git-cleaner
npm install
npm link  # Create global symlink
```

### Install from Source

```bash
git clone https://github.com/wilson/git-cleaner.git
cd git-cleaner
./install.sh
```

## Quick Start

### Basic Usage

```bash
# Preview branches to be deleted
git-cleaner clean --patterns "feature/*" --local --dry-run

# Delete local feature branches
git-cleaner clean --patterns "feature/*" --local

# Delete remote feature and hotfix branches
git-cleaner clean --patterns "feature/*" "hotfix/*" --remote

# Use whitelist to protect important branches
git-cleaner clean --patterns "*" --whitelist "main" "develop" --local
```

## Commands

### clean command

Clean matching Git branches

```bash
git-cleaner clean [options]
```

#### Options

| Option                           | Description                                                         | Example                     |
| -------------------------------- | ------------------------------------------------------------------- | --------------------------- |
| `-p, --patterns <patterns...>`   | Glob patterns for branch names                                      | `-p "feature/*" "hotfix/*"` |
| `-w, --whitelist <whitelist...>` | Whitelist patterns, matching branches won't be deleted              | `-w "main" "develop"`       |
| `-l, --local`                    | Clean local branches                                                | `-l`                        |
| `-r, --remote`                   | Clean remote branches                                               | `-r`                        |
| `--remote-name <name>`           | Remote repository name, default is origin                           | `--remote-name upstream`    |
| `-f, --force`                    | Force delete branches (local only)                                  | `-f`                        |
| `--dry-run`                      | Preview mode, show branches to be deleted without actually deleting | `--dry-run`                 |
| `-y, --yes`                      | Auto-confirm, don't show interactive prompts                        | `-y`                        |

### preview command

Preview branches that will be deleted

```bash
git-cleaner preview --patterns "feature/*" --local --remote
```

### config command

Manage configuration

```bash
# Initialize configuration file
git-cleaner config --init

# Set default patterns
git-cleaner config --set defaultPatterns "feature/*,hotfix/*"
git-cleaner config --set defaultWhitelist "main,develop"

# View configuration
git-cleaner config --list
git-cleaner config --get defaultPatterns
```

## Glob Pattern Examples

| Pattern       | Match Examples                  | Description                                 |
| ------------- | ------------------------------- | ------------------------------------------- |
| `feature/*`   | feature/login, feature/payment  | Match all branches under feature/           |
| `*fix*`       | bugfix/123, hotfix/login        | Match branches containing fix               |
| `release-*`   | release-1.0, release-2.0        | Match branches starting with release-       |
| `user-*-temp` | user-john-temp, user-jane-temp  | Match temporary branches in specific format |
| `*/cleanup`   | feature/cleanup, bugfix/cleanup | Match branches ending with /cleanup         |

## Configuration

### Global Configuration

Location: `~/.git-cleaner/config.json`

```json
{
  "defaultPatterns": ["feature/*", "hotfix/*"],
  "defaultWhitelist": ["main", "master", "develop", "dev"],
  "defaultRemote": "origin",
  "autoConfirm": false,
  "forceDelete": false
}
```

### Project Configuration

Create `.git-cleaner.json` in project root:

```json
{
  "defaultPatterns": ["story/*", "task/*"],
  "defaultWhitelist": ["main", "staging", "production"],
  "defaultRemote": "upstream"
}
```

Project configuration overrides global configuration.

## Use Cases

### Scenario 1: Clean feature branches

Clean up local and remote feature branches after development:

```bash
git-cleaner clean -p "feature/*" -l -r --dry-run  # Preview first
git-cleaner clean -p "feature/*" -l -r -y         # Execute after confirmation
```

### Scenario 2: Batch clean multiple branch types

```bash
git-cleaner clean -p "feature/*" "hotfix/*" "bugfix/*" -w "main" "develop" -l
```

### Scenario 3: Clean personal temporary branches

```bash
git-cleaner clean -p "temp-*" "*-wip" "*-backup" -l -f
```

### Scenario 4: Regular cleanup

Combine with cron or GitHub Actions for regular cleanup:

```bash
# Weekly cleanup of merged feature branches
git-cleaner clean -p "feature/*" -r -y
```

## Safety Features

1. **Current branch protection**: Cannot delete the current branch
2. **Whitelist protection**: Important branches (main, develop) are protected by default
3. **Preview mode**: `--dry-run` lets you safely preview branches to be deleted
4. **Interactive confirmation**: Default requires user confirmation before deletion
5. **Detailed feedback**: Shows deletion results and error information for each branch

## Error Handling

- Non-Git repository detection
- Network connection issues (remote branch operations)
- Permission issues
- Branch doesn't exist
- Unpushed local changes warning

## Development

```bash
# Install dependencies
npm install

# Development mode
npm run start

# Run tests
npm test

# Lint code
npm run lint

# Build project
npm run build
```

## Publishing

### Quick Release

```bash
# Patch version (bug fixes)
npm run release:patch

# Minor version (new features)
npm run release:minor

# Major version (breaking changes)
npm run release:major

# Beta version
npm run release:beta
```

### Interactive Release

```bash
npm run release
```

For more release information, see [RELEASE.md](./RELEASE.md)

## Chinese Documentation

For Chinese documentation, please see [README_zh.md](./README_zh.md)

## Contributing

Issues and Pull Requests are welcome!

### Contribution Process

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License

## Links

- [NPM Package](https://www.npmjs.com/package/@wilson_janet/git-cleaner)
- [GitHub Repository](https://github.com/wilson/git-cleaner)
- [Issues](https://github.com/wilson/git-cleaner/issues)
- [Release Notes](https://github.com/wilson/git-cleaner/releases)
