# LifeOS

<p align="center">
  <em>Your Personal Productivity Operating System</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-28+-blue?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

## 🚀 Overview

LifeOS is a powerful, **local-first productivity suite** that helps you organize your life with integrated tools for task management, note-taking, habit tracking, and knowledge management. Built with Electron and React, it provides a seamless desktop experience for Windows, macOS, and Linux.

**Privacy First**: Your data stays on your computer. Everything is stored locally in SQLite with no cloud dependencies.

## ✨ Features

### ✅ Completed

#### 📋 **Kanban Board**
- [x] Drag-and-drop task management with smooth animations
- [x] Multiple project support with color coding
- [x] Task priorities using Eisenhower Matrix (Critical, Delegate, Schedule, Low)
- [x] Markdown support in task descriptions
- [x] Same-column reordering
- [x] Task detail panel with rich editing
- [x] Due date tracking
- [x] Custom tags
- [x] Project deletion with cascade cleanup

#### 📚 **Notebook**
- [x] Create multiple notebooks with custom icons and descriptions
- [x] Markdown notes with live preview editor
- [x] Automatic word count tracking
- [x] Pin important notes
- [x] Search across all notes
- [x] Rich text rendering with syntax highlighting
- [x] Can be used for journaling or general note-taking

#### ❓ **Q&A System**
- [x] Question collections (organize by topic)
- [x] Multiple answers per question
- [x] Partial vs Complete answer tracking
- [x] Markdown support for answers
- [x] Status tracking (Unanswered, In Progress, Answered)
- [x] Answer rate statistics

#### 📊 **Metrics & Analytics**
- [x] **Aliveness Score (A)**: Activity engagement tracking with exponential decay
- [x] **Efficiency Score (E)**: Task completion quality metrics
- [x] Event-based tracking system
- [x] Focus bonus and context-switching penalties
- [x] Beautiful animated gauges on dashboard
- [x] Daily activity charts
- [x] Activity heatmap (12 weeks)

#### 🎨 **UI/UX**
- [x] Custom title bar with window controls
- [x] Collapsible sidebar navigation
- [x] Dark theme (default)
- [x] Custom notification system (separate windows)
- [x] Confirmation dialogs
- [x] Responsive layouts
- [x] Smooth animations and transitions

#### ⚙️ **Settings**
- [x] Theme switching (light/dark)
- [x] Hide old completed tasks option
- [x] Metrics configuration (K_a, targets, etc.)

### 🚧 In Progress / Planned

#### 🎯 **Habits Tracker**
- [ ] Daily habit check-ins
- [ ] Streak tracking
- [ ] Habit statistics and trends
- [ ] Reminder integration
- [ ] Habit categories

#### ⏰ **Smart Alarms**
- [ ] Recurring alarms
- [ ] Custom notification sounds
- [ ] Snooze functionality
- [ ] Integration with tasks and habits
- [ ] Persistent notifications

#### 🔍 **Search**
- [ ] Global search across all modules
- [ ] Advanced filters
- [ ] Search history
- [ ] Quick switcher (CMD/CTRL+K)

#### 🔗 **Integration**
- [ ] Link tasks to notes
- [ ] Link Q&A to tasks
- [ ] Cross-module references
- [ ] Backlinks system

#### 📈 **Advanced Analytics**
- [ ] Weekly/Monthly reports
- [ ] Export to CSV/PDF
- [ ] Custom time ranges
- [ ] Productivity insights
- [ ] Goal tracking

#### 🎨 **Customization**
- [ ] Custom themes/colors
- [ ] Layout preferences
- [ ] Keyboard shortcuts customization
- [ ] Font size settings

#### 📦 **Data Management**
- [ ] Import/Export functionality
- [ ] Backup/Restore
- [ ] Data sync (optional cloud)
- [ ] Encryption options

## 🖼️ Screenshots

See [GALLERY.md](GALLERY.md) for screenshots and demos.

## 🖥️ Installation

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

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

### Building

```bash
# Build for production
npm run build

# Package as executable
npm run package

# Build for specific platform
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

## 🛠️ Tech Stack

### Core
- **Electron 28+** - Desktop application framework
- **React 18** - UI framework
- **TypeScript 5** - Type safety

### State & Data
- **Zustand** - State management
- **SQLite** (better-sqlite3) - Local database
- **Zod** - Runtime validation

### UI/Styling
- **Custom CSS** with CSS variables for theming
- **@uiw/react-md-editor** - Markdown editor with live preview
- **react-markdown** - Markdown rendering
- **@dnd-kit** - Drag and drop

### Build Tools
- **Vite** - Frontend bundler
- **tsup** - TypeScript bundler for main process
- **electron-builder** - Application packaging

## 🏗️ Project Structure

```
lifeos/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main entry point
│   │   └── ipc/           # IPC handlers
│   ├── preload/           # Secure IPC bridge
│   │   └── index.ts       # API exposure
│   ├── renderer/          # React application
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # App root
│   ├── database/          # SQLite schemas & repos
│   │   ├── init.ts        # DB initialization
│   │   ├── *Schema.ts     # Table schemas
│   │   └── *Repo.ts       # Data repositories
│   ├── services/          # Core services
│   │   ├── scoring.ts     # Metrics calculation
│   │   └── settings.ts    # Settings management
│   └── store/             # Zustand stores
├── configs/               # Build configurations
├── build/                 # Build assets
└── dist/                  # Compiled output
```

## 🚀 Development

### Available Scripts

```bash
npm run dev              # Start dev mode with hot reload
npm run build            # Build all (renderer + main + preload)
npm run build:renderer   # Build React app only
npm run build:main       # Build main process only
npm run build:preload    # Build preload script only
npm run package          # Package for current platform
npm run typecheck        # Run TypeScript checks
```

### Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes** to src files
3. **Hot reload** handles renderer updates automatically
4. **Restart** for main process changes

### Database Schema

LifeOS uses SQLite with the following main tables:

- `projects` - Kanban projects
- `tasks` - Tasks within projects
- `notebooks` - Note collections
- `notes` - Individual notes
- `qa_collections` - Q&A collections
- `qa_questions` - Questions
- `qa_answers` - Answers to questions
- `events` - Event log for metrics
- `task_states` - Task state history
- `metrics_config` - User metrics configuration
- `activities` - Activity log

## 📊 Metrics System

LifeOS includes a sophisticated metrics system:

### Aliveness (A)
- Tracks your engagement and activity
- Uses exponential decay (7-day half-life)
- Rewards focus and penalizes context switching
- Score: 0-100 (≥70 is excellent)

### Efficiency (E)
- Measures task completion quality
- Components:
  - Throughput (tasks/day)
  - On-time rate
  - Cycle time
  - WIP health
- Score: 0-100 (≥70 is excellent)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Add comments for complex logic
- Write meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Electron team for the amazing framework
- React community for excellent tools
- All open source contributors

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

<p align="center">
  Made with ❤️ for productivity enthusiasts
</p>