export const KANBAN_STATUSES = ['Backlog', 'To-Do', 'In Progress', 'Completed'] as const;

export type KanbanStatus = (typeof KANBAN_STATUSES)[number];
