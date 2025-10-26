import { Database } from 'better-sqlite3';

export function applyHabitsSchema(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      category TEXT,
      frequency TEXT NOT NULL DEFAULT 'daily',
      target_count INTEGER NOT NULL DEFAULT 1,
      position INTEGER NOT NULL DEFAULT 0,
      archived_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      logged_date TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, logged_date)
    );
  `);

  db.exec('CREATE INDEX IF NOT EXISTS idx_habits_position ON habits(position);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived_at);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id, logged_date DESC);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(logged_date DESC);');
}
