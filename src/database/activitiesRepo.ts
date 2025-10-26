import { getDb } from './init';

export interface ActivityRow {
  id: number;
  type: string;
  message: string;
  entity_type: string | null;
  entity_id: number | null;
  metadata: string | null;
  created_at: string;
}

export interface CreateActivityInput {
  type: string;
  message: string;
  entity_type?: string;
  entity_id?: number;
  metadata?: Record<string, any>;
}

export function createActivity(input: CreateActivityInput): ActivityRow {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO activities (type, message, entity_type, entity_id, metadata)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    input.type,
    input.message,
    input.entity_type || null,
    input.entity_id || null,
    input.metadata ? JSON.stringify(input.metadata) : null
  );

  return getActivityById(result.lastInsertRowid as number)!;
}

export function getActivityById(id: number): ActivityRow | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM activities WHERE id = ?');
  return stmt.get(id) as ActivityRow | undefined;
}

export function getAllActivities(limit = 500): ActivityRow[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM activities 
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  return stmt.all(limit) as ActivityRow[];
}

export function getActivitiesByDateRange(startDate: string, endDate: string): ActivityRow[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM activities 
    WHERE date(created_at) >= date(?) 
      AND date(created_at) <= date(?)
    ORDER BY created_at DESC
  `);
  return stmt.all(startDate, endDate) as ActivityRow[];
}

export function getActivitiesByType(type: string, limit = 100): ActivityRow[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM activities 
    WHERE type = ?
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  return stmt.all(type, limit) as ActivityRow[];
}

export function getActivityCountByDate(date: string): number {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM activities 
    WHERE date(created_at) = date(?)
  `);
  const result = stmt.get(date) as { count: number };
  return result.count;
}

export function getActivityStats(): {
  total: number;
  byType: Record<string, number>;
  last7Days: number;
  last30Days: number;
} {
  const db = getDb();
  
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM activities');
  const total = (totalStmt.get() as { count: number }).count;

  const typeStmt = db.prepare(`
    SELECT type, COUNT(*) as count 
    FROM activities 
    GROUP BY type
  `);
  const typeResults = typeStmt.all() as Array<{ type: string; count: number }>;
  const byType = typeResults.reduce((acc, row) => {
    acc[row.type] = row.count;
    return acc;
  }, {} as Record<string, number>);

  const last7DaysStmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM activities 
    WHERE date(created_at) >= date('now', '-7 days')
  `);
  const last7Days = (last7DaysStmt.get() as { count: number }).count;

  const last30DaysStmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM activities 
    WHERE date(created_at) >= date('now', '-30 days')
  `);
  const last30Days = (last30DaysStmt.get() as { count: number }).count;

  return { total, byType, last7Days, last30Days };
}

export function deleteActivity(id: number): boolean {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM activities WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

export function clearAllActivities(): number {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM activities');
  const result = stmt.run();
  return result.changes;
}
