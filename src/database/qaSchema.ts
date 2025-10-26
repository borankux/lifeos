import { Database } from 'better-sqlite3';

/**
 * Q&A Module Schema
 * 
 * Features:
 * - Question collections (cards)
 * - Questions with multiple answers
 * - Answer tracking (partial, complete)
 * - Markdown support for answers
 */

export function applyQASchema(db: Database): void {
  // Question collections (cards to organize questions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS qa_collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Questions
  db.exec(`
    CREATE TABLE IF NOT EXISTS qa_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      tags TEXT,
      status TEXT NOT NULL DEFAULT 'unanswered',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collection_id) REFERENCES qa_collections(id) ON DELETE CASCADE
    );
  `);

  // Answers (multiple answers per question)
  db.exec(`
    CREATE TABLE IF NOT EXISTS qa_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_partial BOOLEAN NOT NULL DEFAULT 1,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES qa_questions(id) ON DELETE CASCADE
    );
  `);

  // Indices for performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_qa_collections_position ON qa_collections(position);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_qa_questions_collection ON qa_questions(collection_id, position);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_qa_questions_status ON qa_questions(status);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_qa_answers_question ON qa_answers(question_id, position);');
}

/**
 * Question status types
 */
export const QA_STATUS = {
  UNANSWERED: 'unanswered',      // No answers at all
  IN_PROGRESS: 'in_progress',    // Has partial answers
  ANSWERED: 'answered',          // Has at least one complete answer
} as const;
