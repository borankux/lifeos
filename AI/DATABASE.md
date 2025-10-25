# Database

## Engine
- SQLite, accessed via `better-sqlite3` (sync, fast for desktop).

## Schema (updated)
- `projects(id, name, color, icon, position, created_at, updated_at)`
- `tasks(id, project_id, title, description, status, due_date, priority, tags, created_at, updated_at, position)`
- `notes(id, title, content, category, attachments, created_at, updated_at)`
- `habits(id, name, frequency, status, history, created_at, updated_at)`
- `alarms(id, time, trigger_habit_id, alert_type, active, created_at, updated_at)`
- `questions(id, content, status, related_notes, created_at, updated_at)`

## Migrations
- Directory `database/migrations`; filename prefix with timestamp and name.
- Use a simple migration runner in main process; track applied migrations in `migrations` table.

## Indexing
- `CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);`
- `CREATE INDEX idx_tasks_due ON tasks(due_date);`
- `CREATE UNIQUE INDEX idx_projects_position ON projects(position);`
- `CREATE INDEX idx_notes_category ON notes(category);`
- `CREATE INDEX idx_habits_name ON habits(name);`
- `CREATE INDEX idx_questions_status ON questions(status);`

## Repositories
- One repo per entity (`repos/projectsRepo.ts`, `repos/tasksRepo.ts`, etc.) with CRUD and query helpers.
- Repos validate inputs (Zod) and normalize outputs.

## Attachments
- Store files under `attachments/` in userData; save DB record with `original_name`, `mime`, `size`, `hash`, and on-disk `path`.
- Sanitize file names; limit size (configurable); verify mime by magic bytes.

## Data Lifecycle
- Soft-delete (optional) via `deleted_at` for tasks/notes; filter in queries.
- Export: JSON with attachment files zipped; Import respects IDs or re-IDs with mapping.
- Backup: periodic copy of SQLite file when app closes (keep N copies).

## Concurrency & Transactions
- Wrap multi-step writes in transactions; keep them short.
- Use a single DB instance owned by main process; no direct renderer access.
