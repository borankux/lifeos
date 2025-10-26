import path from 'path';
import fs from 'fs';
import DatabaseConstructor, { Database } from 'better-sqlite3';
import { applyMetricsSchema } from './metricsSchema';
import { applyQASchema } from './qaSchema';
import { applyNotebookSchema } from './notebookSchema';

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialised');
  }
  return db;
}

export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const userDataPath = path.join(appDataPath(), 'lifeos');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  const dbPath = path.join(userDataPath, 'lifeos.db');
  db = new DatabaseConstructor(dbPath);
  applyPragma(db);
  runMigrations(db);
  return db;
}

function appDataPath(): string {
  const { app } = require('electron');
  return app.getPath('userData');
}

function applyPragma(database: Database) {
  database.pragma('foreign_keys = ON');
}

function runMigrations(database: Database) {
  database.exec(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      icon TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      archived_at TEXT
    );`);

  database.exec(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'To-Do',
      due_date TEXT,
      priority TEXT,
      tags TEXT,
      position REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

  database.exec(`CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);

  database.exec('CREATE INDEX IF NOT EXISTS idx_projects_position ON projects(position);');
  database.exec('CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);');
  database.exec('CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);');
  database.exec('CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);');
  database.exec('CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);');
  
  // Apply metrics schema for Efficiency & Aliveness scoring
  applyMetricsSchema(database);
  
  // Apply Q&A schema
  applyQASchema(database);
  
  // Apply Notebook schema
  applyNotebookSchema(database);
}
