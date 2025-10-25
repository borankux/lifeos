# Architecture

## Processes
- Main process: window lifecycle, tray, menu, auto-update, notifications, scheduling (alarms), DB access (via service layer), secure IPC.
- Renderer (React): UI, state management, view routing, optimistic updates.
- Preload: `contextBridge` API surface; validate inputs; no direct node access from renderer.

## IPC & Boundaries
- Disable `nodeIntegration`; enable `contextIsolation`.
- Expose minimal APIs in preload (e.g., `projects`, `tasks`, `notes`, `habits`, `alarms`, `questions`), each with typed request/response and schema validation (Zod).
- Use channel naming `app/<domain>/<action>`; all IPC handled centrally with auth/validation.

## Directory Layout (refined)
```
src/
  main/          # app.ts, windows.ts, updater.ts, scheduler.ts, ipc/, titlebar.ts
  preload/       # bridge.ts (contextBridge APIs)
  renderer/      # app entry, routes, views, components, contexts/
  database/      # migrations/, client.ts, repos/
  services/      # files/, scheduler/, notifications/
  store/         # Zustand stores by domain
  utils/         # validation/, logging/
  assets/        # icons/, images/, fonts/
```

## UI Architecture

### Custom Titlebar
- **Frameless window**: `frame: false` with custom titlebar implementation
- **Platform-specific styling**: Windows/macOS/Linux appropriate controls
- **Drag regions**: Custom drag areas for window movement
- **Window controls**: Minimize, maximize, close with proper IPC handling

### Icon System
- **Lucide React**: Primary icon library for consistency
- **Custom icons**: LifeOS-specific icons in SVG format
- **Size variants**: 16px, 20px, 24px, 32px, 48px, 64px
- **Theme support**: Light/dark variants with proper contrast

### Theme System
- **CSS custom properties**: Dynamic theming with CSS variables
- **Theme provider**: React context for theme management
- **System preference**: Automatic dark/light mode detection
- **Accessibility**: High contrast and reduced motion support

### Component Architecture
- **Design system**: Consistent spacing, typography, colors
- **Reusable components**: Button, Card, Input, Modal with variants
- **Animation system**: Framer Motion integration with performance optimization
- **Responsive design**: Mobile-first approach with breakpoint system

## Data Flow
- Renderer dispatch -> Store (optimistic) -> IPC call -> Main repo write -> DB -> return -> store reconcile.
- Project change triggers task list reload via combined IPC call (`projects.getActiveWithTasks`).
- Errors propagate via typed results; UI shows inline feedback.

## Technology Choices
- React + TypeScript; Zustand for state; React Router.
- SQLite via `better-sqlite3`; repository layer per table.
- TailwindCSS + Radix UI primitives + Framer Motion.
- Lucide React for icons; Custom SVG icons for branding.
- CSS custom properties for theming; Context API for theme management.

## Config & App Data
- Use `app.getPath('userData')` for:
  - `db/lifeos.sqlite`
  - `attachments/` (hashed filenames with original name preserved in DB)
  - `logs/` (rotating)
  - `icons/` (custom app icons and assets)
  - `themes/` (user-defined theme files)

## Scheduling & Notifications
- `node-schedule` for alarms (cron-like), persisted to DB.
- On launch, load active alarms and (re)register jobs.
- Use Electron Notifications; fallback dialog on unsupported envs.

## Error Handling
- Central error boundary in renderer.
- IPC returns `{ok:boolean, data?, error?}`; log structured errors in main.
- DB operations wrapped with try/catch and transaction where needed.

## Internationalization (optional)
- Minimal i18n scaffolding (en-US default) via `i18next` later.
