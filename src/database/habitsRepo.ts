import { z } from 'zod';
import { getDb } from './init';
import { emitHabitEvent } from './eventsRepo';

export interface Habit {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  position: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export interface HabitLog {
  id: number;
  habitId: number;
  loggedDate: string;
  count: number;
  note: string | null;
  createdAt: string;
}

export interface HabitWithStats extends Habit {
  todayCompleted: boolean;
  todayCount: number;
}

const createHabitSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  icon: z.string().max(30).optional(),
  color: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  targetCount: z.number().int().positive().default(1),
});

const updateHabitSchema = z.object({
  id: z.number().int().positive(),
  payload: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    icon: z.string().max(30).optional().nullable(),
    color: z.string().max(20).optional().nullable(),
    category: z.string().max(50).optional().nullable(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    targetCount: z.number().int().positive().optional(),
    position: z.number().optional(),
    archivedAt: z.string().optional().nullable(),
  })
});

const logHabitSchema = z.object({
  habitId: z.number().int().positive(),
  loggedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.number().int().positive().default(1),
  note: z.string().max(500).optional(),
});

function calculateStreak(logs: { logged_date: string }[]): { current: number; longest: number } {
  if (logs.length === 0) return { current: 0, longest: 0 };

  // Remove duplicates and sort in descending order (newest first)
  const uniqueDates = [...new Set(logs.map(log => log.logged_date))];
  const sortedDates = uniqueDates.sort().reverse();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak (must start from today or yesterday)
  if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
    currentStreak = 1;
    
    // Count consecutive days going backwards from the most recent log
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      
      // Calculate days difference
      const daysDiff = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }
  }

  // Calculate longest streak (check all consecutive sequences)
  tempStreak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const prevDate = new Date(sortedDates[i]);
    const currDate = new Date(sortedDates[i + 1]);
    
    const daysDiff = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  // Don't forget the last streak
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Longest streak must be at least as long as current streak
  longestStreak = Math.max(longestStreak, currentStreak);

  return { current: currentStreak, longest: longestStreak };
}

function calculateCompletionRate(habitId: number, targetCount: number, days: number = 30): number {
  const db = getDb();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const result = db.prepare(`
    SELECT COUNT(*) as completed_days
    FROM habit_logs
    WHERE habit_id = ? AND logged_date >= ? AND count >= ?
  `).get(habitId, startDateStr, targetCount) as { completed_days: number };

  return Math.round((result.completed_days / days) * 100);
}

function mapHabit(row: any): Habit {
  const db = getDb();
  
  const logs = db.prepare(
    'SELECT logged_date FROM habit_logs WHERE habit_id = ? ORDER BY logged_date DESC'
  ).all(row.id) as { logged_date: string }[];

  const streaks = calculateStreak(logs);
  const completionRate = calculateCompletionRate(row.id, row.target_count);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    category: row.category,
    frequency: row.frequency,
    targetCount: row.target_count,
    position: row.position,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    completionRate,
  };
}

export function listHabits(options: { includeArchived?: boolean } = {}): HabitWithStats[] {
  const db = getDb();
  const includeArchived = options.includeArchived ?? false;

  const rows = includeArchived
    ? (db.prepare('SELECT * FROM habits ORDER BY position ASC').all() as any[])
    : (db.prepare('SELECT * FROM habits WHERE archived_at IS NULL ORDER BY position ASC').all() as any[]);

  const today = new Date().toISOString().split('T')[0];

  return rows.map(row => {
    const habit = mapHabit(row);
    
    const todayLog = db.prepare(
      'SELECT count FROM habit_logs WHERE habit_id = ? AND logged_date = ?'
    ).get(row.id, today) as { count: number } | undefined;

    return {
      ...habit,
      todayCompleted: todayLog ? todayLog.count >= row.target_count : false,
      todayCount: todayLog?.count ?? 0,
    };
  });
}

export function getHabit(id: number): Habit | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as any;
  
  if (!row) return null;
  
  return mapHabit(row);
}

export function createHabit(input: z.infer<typeof createHabitSchema>): Habit {
  const payload = createHabitSchema.parse(input);
  const db = getDb();

  const positionRow = db.prepare(
    'SELECT MAX(position) as max_pos FROM habits WHERE archived_at IS NULL'
  ).get() as { max_pos: number | null };
  const nextPosition = (positionRow?.max_pos ?? -1) + 1;

  const row = db.prepare(`
    INSERT INTO habits (name, description, icon, color, category, frequency, target_count, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    payload.name,
    payload.description ?? null,
    payload.icon ?? null,
    payload.color ?? null,
    payload.category ?? null,
    payload.frequency,
    payload.targetCount,
    nextPosition
  ) as any;

  return mapHabit(row);
}

export function updateHabit(input: z.infer<typeof updateHabitSchema>): Habit {
  const { id, payload } = updateHabitSchema.parse(input);
  const db = getDb();

  const fields: string[] = [];
  const params: any[] = [];

  if (payload.name !== undefined) {
    fields.push('name = ?');
    params.push(payload.name);
  }
  if (payload.description !== undefined) {
    fields.push('description = ?');
    params.push(payload.description ?? null);
  }
  if (payload.icon !== undefined) {
    fields.push('icon = ?');
    params.push(payload.icon ?? null);
  }
  if (payload.color !== undefined) {
    fields.push('color = ?');
    params.push(payload.color ?? null);
  }
  if (payload.category !== undefined) {
    fields.push('category = ?');
    params.push(payload.category ?? null);
  }
  if (payload.frequency !== undefined) {
    fields.push('frequency = ?');
    params.push(payload.frequency);
  }
  if (payload.targetCount !== undefined) {
    fields.push('target_count = ?');
    params.push(payload.targetCount);
  }
  if (payload.position !== undefined) {
    fields.push('position = ?');
    params.push(payload.position);
  }
  if (payload.archivedAt !== undefined) {
    fields.push('archived_at = ?');
    params.push(payload.archivedAt ?? null);
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`
      UPDATE habits 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...params);
  }

  const habit = getHabit(id);
  
  if (!habit) {
    throw new Error('Habit not found');
  }

  return habit;
}

export function deleteHabit(id: number): void {
  const db = getDb();
  const result = db.prepare('DELETE FROM habits WHERE id = ?').run(id);
  
  if (result.changes === 0) {
    throw new Error('Habit not found');
  }
}

export function logHabit(input: z.infer<typeof logHabitSchema>): HabitLog {
  const payload = logHabitSchema.parse(input);
  const db = getDb();

  const row = db.prepare(`
    INSERT INTO habit_logs (habit_id, logged_date, count, note)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(habit_id, logged_date) 
    DO UPDATE SET count = count + excluded.count, note = excluded.note
    RETURNING *
  `).get(
    payload.habitId,
    payload.loggedDate,
    payload.count,
    payload.note ?? null
  ) as any;

  emitHabitEvent(payload.count);

  return {
    id: row.id,
    habitId: row.habit_id,
    loggedDate: row.logged_date,
    count: row.count,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function unlogHabit(habitId: number, loggedDate: string): void {
  const db = getDb();
  const result = db.prepare(
    'DELETE FROM habit_logs WHERE habit_id = ? AND logged_date = ?'
  ).run(habitId, loggedDate);
  
  if (result.changes === 0) {
    throw new Error('Habit log not found');
  }
}

export function getHabitLogs(habitId: number, limit: number = 30): HabitLog[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT * FROM habit_logs
    WHERE habit_id = ?
    ORDER BY logged_date DESC
    LIMIT ?
  `).all(habitId, limit) as any[];

  return rows.map(row => ({
    id: row.id,
    habitId: row.habit_id,
    loggedDate: row.logged_date,
    count: row.count,
    note: row.note,
    createdAt: row.created_at,
  }));
}

export function getHabitStats(): {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  avgCompletionRate: number;
} {
  const db = getDb();

  const today = new Date().toISOString().split('T')[0];

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM habits) as total_habits,
      (SELECT COUNT(*) FROM habits WHERE archived_at IS NULL) as active_habits,
      (SELECT COUNT(DISTINCT habit_id) FROM habit_logs WHERE logged_date = ?) as completed_today
  `).get(today) as any;

  const habits = listHabits();
  const avgCompletionRate = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / habits.length)
    : 0;

  return {
    totalHabits: stats.total_habits || 0,
    activeHabits: stats.active_habits || 0,
    completedToday: stats.completed_today || 0,
    avgCompletionRate,
  };
}
