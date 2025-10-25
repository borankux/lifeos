import { z } from 'zod';
import { getDb } from './init';
import { mapProject } from './mappers';
import type { Project } from '../common/types';
import type { ProjectRow } from './types';

const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  color: z.string().max(20).optional().nullable(),
  icon: z.string().max(30).optional().nullable()
});

const updateProjectSchema = z.object({
  id: z.number().int().positive(),
  payload: z.object({
    name: z.string().min(1).max(120).optional(),
    color: z.string().max(20).optional().nullable(),
    icon: z.string().max(30).optional().nullable(),
    position: z.number().int().nonnegative().optional(),
    archivedAt: z.string().datetime().optional().nullable()
  })
});

type CreateProjectInput = z.infer<typeof createProjectSchema>;
type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export function listProjects(options: { includeArchived?: boolean } = {}): Project[] {
  const db = getDb();
  const includeArchived = options.includeArchived ?? false;

  const rows = includeArchived
    ? (db.prepare('SELECT * FROM projects ORDER BY position ASC').all() as ProjectRow[])
    : (db
        .prepare('SELECT * FROM projects WHERE archived_at IS NULL ORDER BY position ASC')
        .all() as ProjectRow[]);

  return rows.map(mapProject);
}

export function createProject(input: CreateProjectInput): Project {
  const payload = createProjectSchema.parse(input);
  const db = getDb();
  const positionRow = db
    .prepare('SELECT MAX(position) as max_position FROM projects WHERE archived_at IS NULL')
    .get() as { max_position: number | null } | undefined;
  const nextPosition = (positionRow?.max_position ?? -1) + 1;

  const statement = db.prepare(`
    INSERT INTO projects (name, color, icon, position)
    VALUES (@name, @color, @icon, @position)
    RETURNING *
  `);

  const row = statement.get({
    name: payload.name.trim(),
    color: payload.color ?? null,
    icon: payload.icon ?? null,
    position: nextPosition
  }) as ProjectRow;

  return mapProject(row);
}

export function updateProject(input: UpdateProjectInput): Project {
  const { id, payload } = updateProjectSchema.parse(input);
  const db = getDb();

  const fields: string[] = [];
  const parameters: Record<string, unknown> = { id };

  if (payload.name !== undefined) {
    fields.push('name = @name');
    parameters.name = payload.name.trim();
  }
  if (payload.color !== undefined) {
    fields.push('color = @color');
    parameters.color = payload.color ?? null;
  }
  if (payload.icon !== undefined) {
    fields.push('icon = @icon');
    parameters.icon = payload.icon ?? null;
  }
  if (payload.position !== undefined) {
    fields.push('position = @position');
    parameters.position = payload.position;
  }
  if (payload.archivedAt !== undefined) {
    fields.push('archived_at = @archivedAt');
    parameters.archivedAt = payload.archivedAt ?? null;
  }

  if (fields.length === 0) {
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
    if (!existing) {
      throw new Error('Project not found');
    }
    return mapProject(existing);
  }

  const statement = db.prepare(`
    UPDATE projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
    RETURNING *
  `);

  const row = statement.get(parameters) as ProjectRow | undefined;
  if (!row) {
    throw new Error('Project not found');
  }
  return mapProject(row);
}

export function reorderProjects(order: Array<{ id: number; position: number }>) {
  const db = getDb();
  const update = db.prepare('UPDATE projects SET position = @position, updated_at = CURRENT_TIMESTAMP WHERE id = @id');
  const transaction = db.transaction((items: Array<{ id: number; position: number }>) => {
    for (const item of items) {
      update.run(item);
    }
  });

  transaction(order);
}


