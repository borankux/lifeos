import { getDb } from './init';
import { BASE_WEIGHTS, EVENT_TYPES } from './metricsSchema';

export interface CreateEventInput {
  user_id?: string;
  type: string;
  meta?: Record<string, any>;
  ts?: string;
}

export interface EventRow {
  id: number;
  user_id: string;
  ts: string;
  type: string;
  meta: string | null;
  weight: number;
  created_at: string;
}

/**
 * Create a new event
 */
export function createEvent(input: CreateEventInput): EventRow {
  const db = getDb();
  const userId = input.user_id || 'default';
  const ts = input.ts || new Date().toISOString();
  const weight = BASE_WEIGHTS[input.type] || 1.0;
  const metaJson = input.meta ? JSON.stringify(input.meta) : null;

  const row = db.prepare(`
    INSERT INTO events (user_id, ts, type, meta, weight)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).get(userId, ts, input.type, metaJson, weight) as EventRow;

  return row;
}

/**
 * Get all events for a user
 */
export function getEvents(userId: string = 'default', limit: number = 500): EventRow[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT * FROM events
    WHERE user_id = ?
    ORDER BY ts DESC
    LIMIT ?
  `).all(userId, limit) as EventRow[];

  return rows;
}

/**
 * Get events for a specific date
 */
export function getEventsByDate(userId: string, date: string): EventRow[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT * FROM events
    WHERE user_id = ? AND DATE(ts) = ?
    ORDER BY ts DESC
  `).all(userId, date) as EventRow[];

  return rows;
}

/**
 * Record task state transition
 */
export function recordTaskState(taskId: number, fromStatus: string | null, toStatus: string): void {
  const db = getDb();
  
  db.prepare(`
    INSERT INTO task_states (task_id, from_status, to_status, ts)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).run(taskId, fromStatus, toStatus);
}

/**
 * Emit normalized events from task actions
 */
export function emitTaskEvent(taskId: number, status: string, meta?: Record<string, any>): void {
  let eventType: string;
  
  switch (status) {
    case 'In Progress':
      eventType = EVENT_TYPES.TASK_STARTED;
      break;
    case 'Completed':
      eventType = EVENT_TYPES.TASK_COMPLETED;
      break;
    default:
      eventType = EVENT_TYPES.TASK_PROGRESSED;
  }

  createEvent({
    type: eventType,
    meta: { task_id: taskId, ...meta }
  });
}

/**
 * Emit diary save event
 */
export function emitDiaryEvent(words: number = 0): void {
  createEvent({
    type: EVENT_TYPES.DIARY_SAVED,
    meta: { words }
  });
}

/**
 * Emit habit logged event
 */
export function emitHabitEvent(habitId: number): void {
  createEvent({
    type: EVENT_TYPES.HABIT_LOGGED,
    meta: { habit_id: habitId }
  });
}

/**
 * Emit Q&A events
 */
export function emitQAEvent(type: 'asked' | 'answered', words: number = 0): void {
  const eventType = type === 'asked' ? EVENT_TYPES.QA_ASKED : EVENT_TYPES.QA_ANSWERED;
  createEvent({
    type: eventType,
    meta: { words }
  });
}
