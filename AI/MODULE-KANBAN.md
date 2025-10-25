# Kanban Module (Project-Based)

## Overview
- Provides project-oriented task management with separate Kanban boards per project.
- Supports quick switching between projects, column-based workflow, bulk operations, and metadata (labels, due dates, priority).

## Entities
- **Project**: `id`, `name`, optional `color`, optional `icon`, `position`, timestamps.
- **Task**: `id`, `project_id`, `title`, `description`, `status`, optional `due_date`, optional `priority`, optional `tags` (comma or JSON array), `position`, timestamps.
- **Column (Status)**: derived enum (`To-Do`, `In Progress`, `Completed` by default). Future enhancement: per-project custom statuses.

## Core User Stories
- Create, rename, archive, and reorder projects.
- Select active project from top bar (dropdown or tab list); state persists across sessions.
- Add tasks within active project; default status `To-Do`; optional quick add inline.
- Drag tasks within column to reorder (`position` updates) and across columns (`status` + `position` updates).
- Bulk select tasks for move/delete; multi-select limited to active project.
- Filter tasks by tags, due dates, or search text within current project.
- Duplicate project (optional) to clone tasks and settings.

## UI Flow
1. **Project Switcher**: displays project name, color chip, add button, overflow menu (rename, reorder, archive).
2. **Board Toolbar**: filter chip row (tags, due date ranges, search input), stats (total tasks, done count).
3. **Kanban Columns**: each column shows header with count, add task button, droppable task list with virtualization for long lists.
4. **Task Card**: title, badges (due date, priority, tags), assignee placeholder (future), quick actions (edit, delete, move).
5. **Task Drawer/Modal**: detailed edit form with markdown description, attachments (shared UI component), activity log (future).

## IPC Contracts
- `projects.list()` -> `{projects}` ordered by `position`.
- `projects.create(payload)` / `update` / `reorder` / `archive`.
- `projects.setActive(id)` persists to config JSON via settings service.
- `tasks.listByProject(projectId)` returns tasks sorted by `status` then `position`.
- `tasks.create({projectId, ...})`, `tasks.update(id, changes)`, `tasks.move({taskId, toStatus, toPosition})`, `tasks.bulkUpdate(ids, changes)`.
- IPC responses follow `{ok, data?, error?}` pattern with validation errors enumerated.

## State Management Hooks
- `useProjectsStore` holds `projects`, `activeProjectId`, `loading`, `error`.
- `useTasksStore` keyed by project: `{ [projectId]: { tasks, lastFetched } }`.
- Derived selectors: `selectActiveProjectTasks`, `selectColumnTasks(status)`, `selectProjectMetrics` (e.g., completion rate).
- Actions trigger optimistic updates; on failure revert and surface toast.

## Persistence Rules
- Changing project order updates `position` sequentially.
- Dragging tasks recalculates `position` using fractional indices to reduce churn; periodic normalization service compacts positions.
- Archiving a project sets `archived_at`; archived projects excluded from main switcher but available in manage dialog.

## Edge Cases & Validation
- Prevent duplicate project names (case-insensitive) by inline validation.
- Ensure tasks cannot be moved to archived project (UI hides them).
- Handle empty states: no projects (prompt to create), no tasks per column.
- On project delete/archive, prompt confirmation with task count summary.
- If active project removed, fallback to nearest available project or create new default.
- Offline/DB errors: show dialog with retry; log error details.

## Metrics & Telemetry (local)
- Track task throughput per project (completed count / week) for analytics view (future).
- Record last active project to accelerate startup.

## Open Questions
- Per-project custom columns? (Not in MVP; design future API.)
- Subtasks or checklists inside tasks? (Stretch goal.)
- Project sharing/export? (Handled in later roadmap phase.)

