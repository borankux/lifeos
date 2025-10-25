# Performance

## Budgets
- Cold start TTI < 2s on mid-tier hardware
- Interaction latency < 100ms; 60fps target for animations

## Strategies
- Code-split views; lazy-load heavy editors and previews
- Virtualize long lists (Kanban lanes, note lists)
- Memoize selectors; avoid unnecessary re-renders
- Use `better-sqlite3` (sync, fast) and batch DB writes where possible
- Debounce search and autosave

## Profiling
- React Profiler for renderer hotspots
- Timeline for drag-drop and animations
- Query timing logs for DB operations

