# State Management

## Library
- Zustand for simplicity and performance; slices by domain.

## Principles
- Single source of truth per domain with selectors for derived data.
- Optimistic updates for UI responsiveness; reconcile on IPC response.
- Persist ephemeral UI state separately from persisted data.

## Store Slices
- `useProjectsStore`: project list, active project, ordering; actions for CRUD, reorder, setActive.
- `useTasksStore`: tasks keyed by project, columns, filters; actions for CRUD and reorder.
- `useNotesStore`: notes list, current note; actions for save, attach, search query.
- `useHabitsStore`: habits, streaks, calendar; actions markComplete, edit.
- `useAlarmsStore`: alarms collection; actions add/update/toggle.
- `useQAStore`: questions, filters; actions link/unlink references.

## IPC Integration
- Actions call `window.api.<domain>.<action>(payload)` from preload; pending states tracked in store.
- Tasks actions scoped by `activeProjectId` from `useProjectsStore` (selector subscription or middleware).
- Errors set `lastError` with details; UI surfaces inline.

## Selectors (examples)
- `getProjectsSorted()`; `getActiveProject()`
- `getTasksByStatus(status)`; `getOverdueTasks(now)`
- `getNotesByCategory(cat)`; `search(term)`
- `getHabitStreak(id)`; `getActiveAlarms()`

## Undo/Redo (nice-to-have)
- Track recent mutations per slice to enable undo for destructive actions.
