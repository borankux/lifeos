# Development Setup

<cite>
**Referenced Files in This Document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [configs/vite.config.ts](file://configs/vite.config.ts)
- [configs/tsup.config.ts](file://configs/tsup.config.ts)
- [src/main/index.ts](file://src/main/index.ts)
- [src/main/devRunner.ts](file://src/main/devRunner.ts)
- [src/database/init.ts](file://src/database/init.ts)
- [tsconfig.json](file://tsconfig.json)
- [scripts/build-icons.js](file://scripts/build-icons.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [System Requirements](#system-requirements)
4. [Installation Steps](#installation-steps)
5. [Platform-Specific Considerations](#platform-specific-considerations)
6. [Common Setup Issues](#common-setup-issues)
7. [Verification and Testing](#verification-and-testing)
8. [Development Workflow](#development-workflow)
9. [Troubleshooting Guide](#troubleshooting-guide)

## Introduction

LifeOS is a powerful local-first productivity suite built with Electron and React, providing a comprehensive desktop application for task management, note-taking, habit tracking, and knowledge management. This guide covers the complete development environment setup process, ensuring you have everything needed to contribute to or modify the LifeOS project effectively.

The development setup involves configuring Node.js 18+, npm, Git, and understanding the project's architecture and build system. LifeOS uses modern web technologies with Electron for cross-platform desktop applications, requiring specific toolchain configurations for optimal development experience.

## Prerequisites

### Essential Software Requirements

Before setting up the LifeOS development environment, ensure you have the following software installed on your system:

#### Node.js 18+
- **Minimum Version**: Node.js 18.0.0 or higher
- **Recommended**: Latest LTS version (currently 18.x)
- **Purpose**: JavaScript runtime for building and running the application
- **Verification Command**: `node --version`

#### npm (Node Package Manager)
- **Minimum Version**: npm 8.0.0 or higher
- **Purpose**: Package manager for installing dependencies
- **Verification Command**: `npm --version`

#### Git
- **Purpose**: Version control system for cloning and managing the repository
- **Verification Command**: `git --version`

### Additional Platform-Specific Dependencies

Depending on your operating system, you may need additional tools for successful compilation and building:

#### Windows
- **Python 3.8+**: Required for native module compilation
- **Visual Studio Build Tools**: C++ compiler and Windows SDK
- **Windows SDK**: For native module building

#### macOS
- **Xcode Command Line Tools**: Required for native module compilation
- **Python 3.8+**: For certain native dependencies

#### Linux
- **Build Essentials**: GCC/G++, make, and other build tools
- **Python 3.8+**: For native module compilation
- **GTK+ Development Libraries**: For native UI components

**Section sources**
- [README.md](file://README.md#L100-L110)
- [package.json](file://package.json#L1-L10)

## System Requirements

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 8 GB | 16 GB+ |
| Storage | 2 GB free space | 5 GB+ free space |
| CPU | 2 cores | 4+ cores |

### Software Compatibility Matrix

| Platform | Node.js | npm | Git | Electron |
|----------|---------|-----|-----|----------|
| Windows 10/11 | 18.0+ | 8.0+ | Latest | 28.0+ |
| macOS 10.15+ | 18.0+ | 8.0+ | Latest | 28.0+ |
| Ubuntu 18.04+ | 18.0+ | 8.0+ | Latest | 28.0+ |
| Fedora 32+ | 18.0+ | 8.0+ | Latest | 28.0+ |

### Environment Variables

Ensure the following environment variables are properly configured:

- **NODE_ENV**: Should be set to `development` during development
- **VITE_DEV_SERVER_URL**: Points to the development server (defaults to `http://localhost:5173`)
- **PATH**: Must include Node.js and npm binaries

## Installation Steps

### Step 1: Clone the Repository

Begin by cloning the LifeOS repository from GitHub:

```bash
# Using HTTPS
git clone https://github.com/yourusername/lifeos.git

# Using SSH (recommended for contributors)
git clone git@github.com:yourusername/lifeos.git
```

Navigate to the project directory:

```bash
cd lifeos
```

### Step 2: Install Dependencies

Install all project dependencies using npm:

```bash
npm install
```

This command performs several important actions:
- Downloads and installs all dependencies listed in `package.json`
- Runs the `postinstall` script which executes `electron-builder install-app-deps`
- Compiles native modules for the current platform

### Step 3: Verify Installation

Verify that the installation completed successfully:

```bash
# Check Node.js version
node --version

# Check npm version  
npm --version

# Verify project dependencies
npm ls --depth=0
```

### Step 4: Build Icon Resources

Before running the development server, ensure all icon resources are properly generated:

```bash
# This step is automated in the build process
npm run build:icons
```

**Section sources**
- [README.md](file://README.md#L100-L115)
- [package.json](file://package.json#L8-L20)

## Platform-Specific Considerations

### Windows Setup

#### Prerequisites
- **Python 3.8+**: Download from python.org
- **Visual Studio Build Tools**: Install via Visual Studio Installer
- **Windows SDK**: Included with Visual Studio Build Tools

#### Environment Configuration
```cmd
# Set Python path if needed
set PYTHON=C:\Path\To\Python\python.exe

# Configure npm to use Python
npm config set python C:\Path\To\Python\python.exe
```

#### Common Windows Issues
- **Permission Errors**: Run PowerShell as Administrator
- **Antivirus Interference**: Add project directory to antivirus exclusions
- **Path Length Limitations**: Enable long path support in Windows Registry

### macOS Setup

#### Prerequisites
- **Xcode Command Line Tools**: Install via `xcode-select --install`
- **Homebrew**: Optional, for managing dependencies
- **Python 3.8+**: Install via Homebrew or official installer

#### Environment Configuration
```bash
# Install Xcode command line tools
xcode-select --install

# Set Python path
export PYTHON=/usr/local/bin/python3

# Configure npm
npm config set python /usr/local/bin/python3
```

#### macOS Specific Considerations
- **Gatekeeper**: May require allowing unsigned applications
- **Code Signing**: Required for distribution (not needed for development)
- **Rosetta 2**: Needed for Intel-based apps on Apple Silicon

### Linux Setup

#### Ubuntu/Debian
```bash
# Update package lists
sudo apt update

# Install build essentials
sudo apt install build-essential python3 python3-pip

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Fedora/RHEL
```bash
# Install development tools
sudo dnf groupinstall "Development Tools"
sudo dnf install python3 python3-pip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
```

#### Arch Linux
```bash
# Install dependencies
sudo pacman -S base-devel python nodejs npm

# Install from AUR if needed
yay -S electron
```

## Common Setup Issues

### Permission Errors

#### Problem
```
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

#### Solution
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Missing Dependencies

#### Problem
Native module compilation failures

#### Solution
```bash
# Rebuild native modules
npm rebuild

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Network-Related Installation Failures

#### Problem
Timeouts or connection issues during npm install

#### Solutions
```bash
# Use a different registry
npm config set registry https://registry.npmjs.org/

# Set proxy settings
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Increase timeout
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
```

### Node.js Version Conflicts

#### Problem
Using incompatible Node.js version

#### Solution
```bash
# Use nvm (Node Version Manager)
nvm install 18
nvm use 18

# Or use volta for version management
volta install node@18
```

### Electron Builder Issues

#### Problem
Platform-specific build failures

#### Solution
```bash
# Clean build artifacts
rm -rf dist/ build/

# Reinstall platform-specific dependencies
npm run postinstall
```

**Section sources**
- [AI/ELECTRON-MIRRORS.md](file://AI/ELECTRON-MIRRORS.md#L56-L64)

## Verification and Testing

### Basic Functionality Test

After completing the setup, verify that the development environment works correctly:

```bash
# Start development server
npm run dev
```

Expected behavior:
- Development server starts on port 5173
- Electron application launches with the main window
- Hot reloading works for React components
- Main process changes require application restart

### Database Initialization Test

Verify that the database initializes correctly:

```bash
# Check database file creation
ls -la ~/.config/lifeos/lifeos.db  # macOS/Linux
dir %APPDATA%\lifeos\lifeos.db    # Windows
```

### Build Verification

Test the build process:

```bash
# Build all components
npm run build

# Verify build artifacts
ls -la dist/  # Check for renderer, main, preload, and server builds
```

### TypeScript Compilation Test

Verify TypeScript configuration:

```bash
# Run type checking
npm run typecheck

# Expected: No type errors reported
```

**Section sources**
- [src/main/index.ts](file://src/main/index.ts#L60-L85)
- [src/database/init.ts](file://src/database/init.ts#L15-L35)

## Development Workflow

### Starting Development

1. **Launch Development Server**
   ```bash
   npm run dev
   ```

2. **Monitor Changes**
   - React components update automatically with hot reloading
   - Main process changes require application restart
   - Database migrations run automatically on startup

3. **Development Tools**
   - Chrome DevTools accessible via `Ctrl+Shift+I` or `Cmd+Opt+I`
   - React Developer Tools recommended for component inspection
   - Redux DevTools for state management debugging

### Making Changes

#### Frontend Development
- Modify files in `src/renderer/`
- Hot reloading updates React components immediately
- Use TypeScript for type safety and better IDE support

#### Backend Development
- Modify files in `src/main/` or `src/server/`
- Restart application for changes to take effect
- Use IPC channels for communication between processes

#### Database Changes
- Modify schemas in `src/database/`
- Run migrations manually if needed
- Test database operations thoroughly

### Testing Changes

```bash
# Run tests (if available)
npm test

# Lint code
npm run lint

# Type check
npm run typecheck
```

### Building for Production

```bash
# Build all components
npm run build

# Package for current platform
npm run package

# Platform-specific packaging
npm run package:win    # Windows
npm run package:mac    # macOS  
npm run package:linux  # Linux
```

**Section sources**
- [src/main/devRunner.ts](file://src/main/devRunner.ts#L8-L25)
- [package.json](file://package.json#L8-L20)

## Troubleshooting Guide

### Application Won't Start

#### Symptoms
- Electron application fails to launch
- Blank white screen appears
- Console errors appear

#### Diagnosis Steps
1. **Check Console Output**: Look for error messages in terminal
2. **Verify Dependencies**: Ensure all npm packages are installed
3. **Check Database**: Verify database initialization succeeds
4. **Review Configuration**: Check `vite.config.ts` and `tsup.config.ts`

#### Solutions
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Reset database
rm -rf ~/.config/lifeos/lifeos.db  # macOS/Linux
del %APPDATA%\lifeos\lifeos.db    # Windows

# Start fresh
npm run dev
```

### Hot Reload Not Working

#### Symptoms
- Changes to React components don't update in browser
- Need to restart development server frequently

#### Solutions
```bash
# Restart development server
npm run dev

# Clear Vite cache
rm -rf node_modules/.vite

# Check file watchers
npm config set maxsockets 100
```

### Database Connection Issues

#### Symptoms
- Database initialization errors
- "Database not initialized" errors
- Migration failures

#### Solutions
```bash
# Check database permissions
chmod 755 ~/.config/lifeos  # macOS/Linux
icacls "%APPDATA%\lifeos" /grant "%USERNAME%:(OI)(CI)F"  # Windows

# Reset database
rm ~/.config/lifeos/lifeos.db  # macOS/Linux
del %APPDATA%\lifeos\lifeos.db  # Windows

# Restart application
npm run dev
```

### Build Failures

#### Symptoms
- `npm run build` fails
- Packaging errors
- Missing build artifacts

#### Solutions
```bash
# Clean build artifacts
npm run clean

# Rebuild all components
npm run build

# Check platform-specific requirements
npm run postinstall
```

### Performance Issues

#### Symptoms
- Slow application startup
- Memory leaks
- High CPU usage

#### Solutions
```bash
# Monitor memory usage
npm run dev -- --inspect

# Optimize bundle size
npm run build -- --analyze

# Check for memory leaks
chrome://inspect
```

### Network and Proxy Issues

#### Corporate Networks
```bash
# Configure npm for corporate proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# Use environment variables
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

#### Mirror Configuration
```bash
# Use npm mirror for China
npm config set registry https://registry.npmmirror.com/

# Use yarn mirror
yarn config set registry https://registry.npmmirror.com/
```

**Section sources**
- [src/main/index.ts](file://src/main/index.ts#L75-L95)
- [src/database/init.ts](file://src/database/init.ts#L15-L35)

## Conclusion

Setting up the LifeOS development environment requires careful attention to system requirements, dependency management, and platform-specific configurations. By following this comprehensive guide, you should have a fully functional development environment capable of building, testing, and contributing to the LifeOS project.

Key success factors:
- **Proper Node.js version**: Ensure Node.js 18+ is installed and configured
- **Complete dependency installation**: Allow npm install to complete fully
- **Platform awareness**: Address platform-specific requirements
- **Environment verification**: Test each component individually
- **Troubleshooting readiness**: Have solutions for common issues

For ongoing development, maintain your environment by regularly updating dependencies, monitoring for compatibility issues, and keeping your system tools current. The modular architecture of LifeOS allows for incremental development, making it easier to isolate and resolve issues as they arise.

If you encounter issues not covered in this guide, consult the project's GitHub issues, review the build configuration files, and leverage the community support available through the project's contribution guidelines.