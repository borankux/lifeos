import { getDb } from './init';

export interface ServerLog {
  id: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: string;
  created_at: string;
}

export function addServerLog(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): ServerLog {
  try {
    const db = getDb();
    const dataStr = data ? JSON.stringify(data) : null;
    
    const stmt = db.prepare(`
      INSERT INTO server_logs (level, message, data, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(level, message, dataStr);
    
    return {
      id: typeof result.lastInsertRowid === 'number' ? result.lastInsertRowid : 0,
      level,
      message,
      data: dataStr || undefined,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to save server log:', error);
    throw error;
  }
}

export function getServerLogs(options?: {
  limit?: number;
  offset?: number;
  level?: string;
  since?: string;
}): ServerLog[] {
  try {
    const db = getDb();
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    const level = options?.level;
    const since = options?.since;

    let query = 'SELECT id, level, message, data, created_at FROM server_logs';
    const params: any[] = [];
    
    const conditions: string[] = [];
    if (level) {
      conditions.push('level = ?');
      params.push(level);
    }
    if (since) {
      conditions.push('created_at > ?');
      params.push(since);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      level: row.level,
      message: row.message,
      data: row.data ? JSON.parse(row.data) : undefined,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Failed to get server logs:', error);
    throw error;
  }
}

export function clearOldLogs(daysOld: number = 7): number {
  try {
    const db = getDb();
    const stmt = db.prepare(`
      DELETE FROM server_logs 
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `);
    
    const result = stmt.run(daysOld);
    return typeof result.changes === 'number' ? result.changes : 0;
  } catch (error) {
    console.error('Failed to clear old logs:', error);
    throw error;
  }
}

export function getLogStats(): {
  total: number;
  byLevel: Record<string, number>;
  oldestLog: string | null;
  newestLog: string | null;
} {
  try {
    const db = getDb();
    
    const total = (db.prepare('SELECT COUNT(*) as count FROM server_logs').get() as any)?.count || 0;
    
    const byLevel = db.prepare(`
      SELECT level, COUNT(*) as count FROM server_logs GROUP BY level
    `).all() as any[];
    
    const levelStats: Record<string, number> = {};
    for (const row of byLevel) {
      levelStats[row.level] = row.count;
    }

    const oldest = (db.prepare('SELECT created_at FROM server_logs ORDER BY created_at ASC LIMIT 1').get() as any)?.created_at || null;
    const newest = (db.prepare('SELECT created_at FROM server_logs ORDER BY created_at DESC LIMIT 1').get() as any)?.created_at || null;

    return {
      total,
      byLevel: levelStats,
      oldestLog: oldest,
      newestLog: newest
    };
  } catch (error) {
    console.error('Failed to get log stats:', error);
    throw error;
  }
}
