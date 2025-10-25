# LifeOS Product Specification

## Goals
- Personal productivity OS with Kanban, Diary, Habits, Alarm, Notebook, and Q&A.
- Local-first: data stored locally (SQLite + attachments on disk).
- Modern, responsive UI with smooth interactions and clear feedback.
- Modular, extensible architecture for future features (RAG, sync).

## Non-Goals (initial release)
- Cloud sync, multi-user collaboration, real-time presence.
- Mobile apps; focus on desktop Electron (Windows/macOS/Linux).

## Personas
- Planner: manages tasks and deadlines (Kanban focus).
- Journaler: writes markdown notes with media (Diary focus).
- Habit builder: tracks routines and streaks (Habits focus).
- Researcher: asks questions and links answers (Q&A + Notebook).

## Success Criteria (MVP)
- Create/edit/delete projects; each project has its own Kanban columns.
- Create/edit/delete tasks; drag between columns with persistence scoped to project.
- Write markdown notes with image/file attachments and live preview.
- Define habits with frequency; mark completion; streaks compute correctly.
- Create alarms; app triggers and shows notifications reliably.
- Organize notes by categories; search and reorder.
- Q&A tracks status; link to notes/tasks.
- GitHub-style activity calendar showing all user activities (diary entries, tasks, habits, etc.) with intensity levels based on daily activity count.

## Acceptance Criteria (sample)
- Project switch changes board data in under 150ms; active project persists between sessions.
- Drag-drop Kanban updates `status` and `project_id` in DB within 100ms.
- Markdown paste of an image stores file under app data and embeds path.
- Habit streaks span timezones consistently (documented model).
- Alarms fire even when window minimized (main process scheduler).
- No fatal errors on invalid inputs; inline validation provided.

## Metrics (qualitative for local app)
- Time-to-interactive < 2s on cold start on mid-tier hardware.
- Core interactions under 100ms (drag-drop, toggle, mark complete).
- Crash-free sessions: > 99.5% in routine usage.

## Constraints & Dependencies
- Electron 28+; React + TypeScript; SQLite (better-sqlite3).
- TailwindCSS + Motion library (Framer Motion) for animations.
- Packaging via electron-builder.

## Roadmap (high level)
- Phase 1: Foundation (arch, DB, base UI, Kanban)
- Phase 2: Diary + Attachments, Notebook, Search
- Phase 3: Habits + Alarms (scheduler/notifications)
- Phase 4: Q&A + Cross-linking; polish; export/import
- Phase 5: RAG (local embeddings) [optional]
