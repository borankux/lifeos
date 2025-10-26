import { z } from 'zod';
import { getDb } from './init';
import { mapTask } from './mappers';
import type { Task } from '../common/types';
import type { TaskRow } from './types';
import { emitTaskEvent, recordTaskState } from './eventsRepo';

const createTaskSchema = z.object({
  projectId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  status: z.string().min(1).max(50).default('To-Do'),
  dueDate: z.string().datetime().optional(),
  priority: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).optional(),
  position: z.number().optional()
});

const updateTaskSchema = z.object({
  id: z.number().int().positive(),
  payload: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(4000).optional().nullable(),
    status: z.string().min(1).max(50).optional(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: z.string().max(50).optional().nullable(),
    tags: z.array(z.string().max(30)).optional().nullable(),
    position: z.number().optional(),
    projectId: z.number().int().positive().optional()
  })
});

const moveTaskSchema = z.object({
  id: z.number().int().positive(),
  projectId: z.number().int().positive(),
  status: z.string().min(1).max(50),
  position: z.number()
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type MoveTaskInput = z.infer<typeof moveTaskSchema>;

function serialiseTags(tags?: string[] | null) {
  if (!tags) {
    return null;
  }
  return JSON.stringify(tags);
}

export function listTasksByProject(projectId: number): Task[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY status ASC, position ASC, id ASC')
    .all(projectId) as TaskRow[];
  return rows.map(mapTask);
}

export function createTask(input: CreateTaskInput): Task {
  const payload = createTaskSchema.parse(input);
  const db = getDb();

  let position = payload.position;
  if (position === undefined) {
    const last = db
      .prepare('SELECT MAX(position) as max_position FROM tasks WHERE project_id = ? AND status = ?')
      .get(payload.projectId, payload.status) as { max_position: number | null } | undefined;
    position = (last?.max_position ?? 0) + 1;
  }

  const row = db.prepare(`
      INSERT INTO tasks (project_id, title, description, status, due_date, priority, tags, position)
      VALUES (@projectId, @title, @description, @status, @dueDate, @priority, @tags, @position)
      RETURNING *
    `).get({
    projectId: payload.projectId,
    title: payload.title.trim(),
    description: payload.description ?? null,
    status: payload.status,
    dueDate: payload.dueDate ?? null,
    priority: payload.priority ?? null,
    tags: serialiseTags(payload.tags),
    position
  }) as TaskRow;

  const task = mapTask(row);
  
  // Record state transition and emit event
  recordTaskState(task.id, null, task.status);
  if (task.status === 'In Progress') {
    emitTaskEvent(task.id, task.status);
  }

  return task;
}

export function updateTask(input: UpdateTaskInput): Task {
  const { id, payload } = updateTaskSchema.parse(input);
  const db = getDb();

  // Get old status
  const oldTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
  const oldStatus = oldTask?.status;

  const fields: string[] = [];
  const parameters: Record<string, unknown> = { id };

  if (payload.title !== undefined) {
    fields.push('title = @title');
    parameters.title = payload.title.trim();
  }
  if (payload.description !== undefined) {
    fields.push('description = @description');
    parameters.description = payload.description ?? null;
  }
  if (payload.status !== undefined) {
    fields.push('status = @status');
    parameters.status = payload.status;
  }
  if (payload.dueDate !== undefined) {
    fields.push('due_date = @dueDate');
    parameters.dueDate = payload.dueDate ?? null;
  }
  if (payload.priority !== undefined) {
    fields.push('priority = @priority');
    parameters.priority = payload.priority ?? null;
  }
  if (payload.tags !== undefined) {
    fields.push('tags = @tags');
    parameters.tags = serialiseTags(payload.tags ?? undefined);
  }
  if (payload.position !== undefined) {
    fields.push('position = @position');
    parameters.position = payload.position;
  }
  if (payload.projectId !== undefined) {
    fields.push('project_id = @projectId');
    parameters.projectId = payload.projectId;
  }

  if (fields.length === 0) {
    if (!oldTask) {
      throw new Error('Task not found');
    }
    return mapTask(oldTask);
  }

  const row = db
    .prepare(`UPDATE tasks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = @id RETURNING *`)
    .get(parameters) as TaskRow | undefined;

  if (!row) {
    throw new Error('Task not found');
  }

  const task = mapTask(row);
  
  // Track status changes and emit events
  if (payload.status && payload.status !== oldStatus) {
    recordTaskState(task.id, oldStatus || null, task.status);
    emitTaskEvent(task.id, task.status, {
      old_status: oldStatus,
      due_date: task.dueDate
    });
  }

  return task;
}

export function moveTask(input: MoveTaskInput): Task {
  const payload = moveTaskSchema.parse(input);
  return updateTask({
    id: payload.id,
    payload: {
      projectId: payload.projectId,
      status: payload.status,
      position: payload.position
    }
  });
}
