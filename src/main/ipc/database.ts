import { ipcMain } from 'electron';
import { wrapIpc } from '../utils/response';
import { getDb } from '../../database/init';
import * as projectsRepo from '../../database/projectsRepo';
import * as qaRepo from '../../database/qaRepo';
import * as notebookRepo from '../../database/notebookRepo';
import * as activitiesRepo from '../../database/activitiesRepo';

/**
 * Purge all data from the database
 * This will delete all records from all tables but keep the schema intact
 */
export function purgeDatabase(): { success: boolean; message: string } {
  const db = getDb();
  
  try {
    // Use transaction to ensure all-or-nothing deletion
    const transaction = db.transaction(() => {
      // Delete from all tables in proper order to respect foreign key constraints
      db.prepare('DELETE FROM tasks').run();
      db.prepare('DELETE FROM projects').run();
      db.prepare('DELETE FROM qa_answers').run();
      db.prepare('DELETE FROM qa_questions').run();
      db.prepare('DELETE FROM qa_collections').run();
      db.prepare('DELETE FROM notes').run();
      db.prepare('DELETE FROM notebooks').run();
      db.prepare('DELETE FROM activities').run();
      db.prepare('DELETE FROM metrics_events').run();
      
      // Reset auto-increment sequences
      db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('projects', 'tasks', 'qa_collections', 'qa_questions', 'qa_answers', 'notebooks', 'notes', 'activities', 'metrics_events')").run();
    });
    
    transaction();
    
    return {
      success: true,
      message: 'Database purged successfully'
    };
  } catch (error) {
    console.error('Failed to purge database:', error);
    throw new Error(`Failed to purge database: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Register IPC handler
ipcMain.handle(
  'database:purge',
  wrapIpc(() => {
    return purgeDatabase();
  })
);