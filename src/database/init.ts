import fs from 'fs';
import path from 'path';
import DatabaseConstructor, { Database } from 'better-sqlite3';
import { applyMetricsSchema } from './metricsSchema';
import { applyQASchema } from './qaSchema';
import { applyNotebookSchema } from './notebookSchema';
import { applyHabitsSchema } from './habitsSchema';

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialised');
  }
  return db;
}

export async function initDatabase(): Promise<Database | null> {
  if (db) {
    return db;
  }

  try {
    const userDataPath = path.join(appDataPath(), 'lifeos');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    const dbPath = path.join(userDataPath, 'lifeos.db');
    db = new DatabaseConstructor(dbPath);
    applyPragma(db);
    runMigrations(db);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Return null to allow app to continue without database in dev
    return null;
  }
}

function appDataPath(): string {
  // Try to use Electron first (main process context)
  try {
    const { app } = require('electron');
    return app.getPath('userData');
  } catch (e) {
    // Fall back to standard user data directory for Node.js context
    // This handles the case where MCP server runs as separate process
    const os = require('os');
    const platform = process.platform;
    
    if (platform === 'win32') {
      return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'lifeos');
    } else if (platform === 'darwin') {
      return path.join(os.homedir(), 'Library', 'Application Support', 'lifeos');
    } else {
      return path.join(os.homedir(), '.config', 'lifeos');
    }
  }
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
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      estimated_minutes INTEGER,
      estimated_start_date TEXT,
      estimated_end_date TEXT,
      actual_start_date TEXT,
      actual_end_date TEXT,
      actual_minutes INTEGER
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
  
  // Add time tracking columns if they don't exist
  try {
    database.exec('ALTER TABLE tasks ADD COLUMN estimated_minutes INTEGER;');
  } catch (e) { /* Column already exists */ }
  try {
    database.exec('ALTER TABLE tasks ADD COLUMN estimated_start_date TEXT;');
  } catch (e) { /* Column already exists */ }
  try {
    database.exec('ALTER TABLE tasks ADD COLUMN estimated_end_date TEXT;');
  } catch (e) { /* Column already exists */ }
  try {
    database.exec('ALTER TABLE tasks ADD COLUMN actual_start_date TEXT;');
  } catch (e) { /* Column already exists */ }
  try {
    database.exec('ALTER TABLE tasks ADD COLUMN actual_end_date TEXT;');
  } catch (e) { /* Column already exists */ }
  try {
    database.exec('ALTER TABLE tasks ADD COLUMN actual_minutes INTEGER;');
  } catch (e) { /* Column already exists */ }
  
  // Apply metrics schema for Efficiency & Aliveness scoring
  applyMetricsSchema(database);
  
  // Apply Q&A schema
  applyQASchema(database);
  
  // Apply Notebook schema
  applyNotebookSchema(database);
  
  // Apply Habits schema
  applyHabitsSchema(database);
  
  // Apply MCP configuration schema
  database.exec(`CREATE TABLE IF NOT EXISTS mcp_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    port INTEGER NOT NULL DEFAULT 3000,
    host TEXT NOT NULL DEFAULT 'localhost',
    enabled INTEGER NOT NULL DEFAULT 1,
    auto_start INTEGER NOT NULL DEFAULT 1,
    protocol_version TEXT NOT NULL DEFAULT '2025-06-18',
    session_timeout INTEGER NOT NULL DEFAULT 3600,
    heartbeat_interval INTEGER NOT NULL DEFAULT 30,
    max_sessions INTEGER NOT NULL DEFAULT 100,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);
  
  // Initialize MCP config with defaults if not exists
  try {
    database.prepare(`
      INSERT INTO mcp_config (id, port, host, enabled, auto_start, protocol_version, session_timeout, heartbeat_interval, max_sessions)
      SELECT 1, 3000, 'localhost', 1, 1, '2025-06-18', 3600, 30, 100
      WHERE NOT EXISTS (SELECT 1 FROM mcp_config WHERE id = 1)
    `).run();
  } catch (e) { /* Config already exists */ }
  
  // Add new fields to existing mcp_config table
  try {
    database.exec('ALTER TABLE mcp_config ADD COLUMN protocol_version TEXT NOT NULL DEFAULT "2025-06-18";');
  } catch (e) { /* Column already exists */ }
  try {
    database.exec('ALTER TABLE mcp_config ADD COLUMN session_timeout INTEGER NOT NULL DEFAULT 3600;');
  } catch (e) { /* Column already exists */ }
  try {
    database.exec('ALTER TABLE mcp_config ADD COLUMN heartbeat_interval INTEGER NOT NULL DEFAULT 30;');
  } catch (e) { /* Column already exists */ }
  try {
    database.exec('ALTER TABLE mcp_config ADD COLUMN max_sessions INTEGER NOT NULL DEFAULT 100;');
  } catch (e) { /* Column already exists */ }
  
  // Apply server logs schema
  database.exec(`CREATE TABLE IF NOT EXISTS server_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    data TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);
  
  database.exec('CREATE INDEX IF NOT EXISTS idx_server_logs_created_at ON server_logs(created_at DESC);');
  database.exec('CREATE INDEX IF NOT EXISTS idx_server_logs_level ON server_logs(level);');
}
