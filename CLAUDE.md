# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Git Helper is a command-line tool for cleaning up Git branches using glob patterns and whitelist functionality. It supports both local and remote branch management with safety features like dry-run mode and interactive confirmation.

## Development Commands

```bash
# Development
npm run start              # Run the application
npm test                   # Run tests (placeholder)
npm run lint               # Run linter (placeholder)
npm run build              # Build project (placeholder)

# Release management
npm run release:patch      # Release patch version
npm run release:minor      # Release minor version
npm run release:major      # Release major version
npm run release:beta       # Release beta version
npm run release            # Interactive release

# Configuration
npm run clean              # Clean and reinstall dependencies
```

## Architecture

### Core Components

- **CLI (`src/cli.js`)**: Command-line interface using Commander.js, handles user interactions and command parsing
- **GitOperations (`src/git-operations.js`)**: Git operations using simple-git, handles branch filtering, deletion, and preview
- **ConfigManager (`src/config-manager.js`)**: Configuration management with global (`~/.git-cleaner/config.json`) and project-level (`.git-cleaner.json`) support

### Entry Points

- `bin/git-cleaner.js`: Main CLI entry point
- `src/index.js`: Application bootstrap that creates and runs CLI instance

### Configuration System

The tool supports hierarchical configuration:

1. **Global config**: `~/.git-cleaner/config.json`
2. **Project config**: `.git-cleaner.json` in project root
3. **Command-line args**: Override config file settings

Default configuration includes:

```json
{
  "defaultPatterns": [],
  "defaultWhitelist": ["main", "master", "develop", "dev"],
  "defaultRemote": "origin",
  "autoConfirm": false,
  "forceDelete": false
}
```

### Key Features

- **Glob pattern matching**: Uses minimatch for flexible branch name filtering
- **Whitelist protection**: Prevents deletion of important branches
- **Safety mechanisms**: Current branch protection, dry-run mode, interactive confirmation
- **Error handling**: Graceful handling of network issues, permissions, and Git errors
- **Internationalization**: Primary language is Chinese with English support

### Dependencies

- **chalk**: Colored terminal output
- **commander**: Command-line argument parsing
- **enquirer**: Interactive prompts
- **minimatch**: Glob pattern matching
- **simple-git**: Git operations wrapper

## Development Notes

- The tool is designed for Node.js >=14.0.0
- Uses semantic-release for automated versioning
- Supports both local and remote branch operations
- Extensive error handling for network and permission issues
- Configuration values are merged from global → project → command-line args
