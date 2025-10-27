import { Request, Response, NextFunction } from 'express';
import * as notebookRepo from '../../database/notebookRepo';
import { getDb } from '../../database/init';

export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const note = notebookRepo.createNote(req.body);
    res.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
}

export async function getNote(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const note = notebookRepo.getNote(id);
    
    if (!note) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Note not found'
        }
      });
    }

    res.json({ data: note });
  } catch (error) {
    next(error);
  }
}

export async function listNotesByNotebook(req: Request, res: Response, next: NextFunction) {
  try {
    const notebookId = parseInt(req.params.notebookId, 10);
    const notes = notebookRepo.listNotesByNotebook(notebookId);
    res.json({ data: notes });
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const note = notebookRepo.updateNote({
      id,
      payload: req.body
    });
    res.json({ data: note });
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    notebookRepo.deleteNote(id);
    res.json({ data: { success: true, id } });
  } catch (error) {
    next(error);
  }
}

export async function searchNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query is required'
        }
      });
    }

    const notes = notebookRepo.searchNotes(query);
    res.json({ data: notes });
  } catch (error) {
    next(error);
  }
}

export async function getNotesStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(word_count) as total_content_length
      FROM notes
    `).get() as any;

    const byNotebook = db.prepare(`
      SELECT notebook_id as notebookId, COUNT(*) as count
      FROM notes
      GROUP BY notebook_id
    `).all() as any[];

    const avgNoteLength = stats.total > 0 
      ? Math.round(stats.total_content_length / stats.total) 
      : 0;

    const status = {
      total: stats.total || 0,
      byNotebook,
      totalContentLength: stats.total_content_length || 0,
      avgNoteLength
    };

    res.json({ data: status });
  } catch (error) {
    next(error);
  }
}
