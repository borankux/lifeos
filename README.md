# LifeOS

<p align="center">
  <em>Your Personal Productivity Operating System</em>
</p>

## 🚀 Overview

LifeOS is a powerful, local-first productivity suite that helps you organize your life with integrated tools for task management, journaling, habit tracking, and knowledge management. Built with Electron and React, it provides a seamless desktop experience for Windows, macOS, and Linux.

### ✨ Key Features

- **📋 Kanban Board**: Flexible project management with customizable columns
- **📔 Digital Diary**: Rich markdown editing with media attachments
- **🎯 Habit Tracker**: Build and maintain streaks for your daily routines
- **⏰ Smart Alarms**: Reliable notification system that works even when minimized
- **📚 Notebook**: Organize and search through your knowledge base
- **❓ Q&A System**: Link questions to your notes and tasks

### 🔐 Privacy First

Your data stays on your computer. LifeOS is completely local-first, storing everything in SQLite and local files.

## 🖥️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lifeos.git

# Navigate to project directory
cd lifeos

# Install dependencies
npm install

# Start development
npm run dev
```

## 🛠️ Tech Stack

- **Framework**: Electron 28+, React, TypeScript
- **State Management**: Zustand
- **UI**: TailwindCSS, Radix UI, Framer Motion
- **Database**: SQLite (better-sqlite3)
- **Build**: electron-builder

## 🏗️ Project Structure

\`\`\`
src/
  main/          # Electron main process
  preload/       # Secure bridge APIs
  renderer/      # React application
  database/      # SQLite setup & repositories
  services/      # Core services (files, scheduler)
  store/         # State management
  utils/         # Shared utilities
\`\`\`

## 🚀 Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Package the application
npm run package
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 LifeOS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```