import { Database } from 'better-sqlite3';

/**
 * Metrics Schema for Efficiency (E) and Aliveness (A) scoring
 * 
 * This schema extends the existing LifeOS database with tables for:
 * - Events: normalized event log with type, metadata, and weights
 * - Task states: timeline of task state transitions
 * - Metrics config: per-user tunable parameters
 * - Daily aggregates: pre-computed daily stats for performance
 */

export function applyMetricsSchema(db: Database): void {
  // Events table - normalized event log
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default',
      ts TEXT NOT NULL,
      type TEXT NOT NULL,
      meta TEXT,
      weight REAL NOT NULL DEFAULT 1.0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Task state transitions for cycle time tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      ts TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // Metrics configuration (tunable parameters)
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics_config (
      user_id TEXT PRIMARY KEY DEFAULT 'default',
      k_a REAL NOT NULL DEFAULT 50.0,
      t_target REAL NOT NULL DEFAULT 1.0,
      ct_target_days REAL NOT NULL DEFAULT 2.0,
      wip_limit INTEGER NOT NULL DEFAULT 3,
      h_a_days REAL NOT NULL DEFAULT 7.0,
      h_e_days REAL NOT NULL DEFAULT 14.0,
      window_days INTEGER NOT NULL DEFAULT 14,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Daily aggregates for performance
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_aggregates (
      user_id TEXT NOT NULL DEFAULT 'default',
      date TEXT NOT NULL,
      alive_points REAL NOT NULL DEFAULT 0.0,
      event_count INTEGER NOT NULL DEFAULT 0,
      completed_tasks INTEGER NOT NULL DEFAULT 0,
      wip_avg REAL NOT NULL DEFAULT 0.0,
      PRIMARY KEY (user_id, date)
    );
  `);

  // Indices for performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_events_user_ts ON events(user_id, ts DESC);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_task_states_task ON task_states(task_id, ts);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_daily_agg_user_date ON daily_aggregates(user_id, date DESC);');

  // Insert default config if not exists
  db.exec(`
    INSERT OR IGNORE INTO metrics_config (user_id) VALUES ('default');
  `);
}

/**
 * Event types supported by the system
 */
export const EVENT_TYPES = {
  TASK_STARTED: 'task_started',
  TASK_PROGRESSED: 'task_progressed',
  TASK_COMPLETED: 'task_completed',
  HABIT_LOGGED: 'habit_logged',
  DIARY_SAVED: 'diary_saved',
  QA_ASKED: 'qa_asked',
  QA_ANSWERED: 'qa_answered',
} as const;

/**
 * Base involvement weights for each event type
 */
export const BASE_WEIGHTS: Record<string, number> = {
  [EVENT_TYPES.TASK_STARTED]: 1.0,
  [EVENT_TYPES.TASK_PROGRESSED]: 1.0,
  [EVENT_TYPES.TASK_COMPLETED]: 6.0,
  [EVENT_TYPES.HABIT_LOGGED]: 2.0,
  [EVENT_TYPES.DIARY_SAVED]: 3.0,
  [EVENT_TYPES.QA_ASKED]: 2.0,
  [EVENT_TYPES.QA_ANSWERED]: 4.0,
};
