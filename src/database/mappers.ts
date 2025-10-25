import type { Project, Task } from '../common/types';
import type { ProjectRow, TaskRow } from './types';

function safeParseTags(raw: string | null): string[] | undefined {
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((value) => String(value));
    }
  } catch (error) {
    console.warn('Failed to parse task tags', error);
  }

  return undefined;
}

export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    dueDate: row.due_date ?? undefined,
    priority: row.priority ?? undefined,
    tags: safeParseTags(row.tags),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
