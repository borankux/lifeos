import { Database } from 'better-sqlite3';

/**
 * Notebook Module Schema
 * 
 * Features:
 * - Notebooks with icon, title, and description
 * - Notes/articles within notebooks
 * - Word count tracking
 * - Markdown support
 * - Can be used for journaling and note-taking
 */

export function applyNotebookSchema(db: Database): void {
  // Notebooks (collections of notes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS notebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Notes/Articles
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notebook_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      word_count INTEGER NOT NULL DEFAULT 0,
      tags TEXT,
      is_pinned BOOLEAN NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
    );
  `);

  // Indices for performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_notebooks_position ON notebooks(position);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_notes_notebook ON notes(notebook_id, position DESC);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned DESC, created_at DESC);');
}
