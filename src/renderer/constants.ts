export const KANBAN_STATUSES = ['To-Do', 'In Progress', 'Completed'] as const;

export type KanbanStatus = (typeof KANBAN_STATUSES)[number];
