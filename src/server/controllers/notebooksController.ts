import { Request, Response, NextFunction } from 'express';
import * as notebookRepo from '../../database/notebookRepo';

export async function createNotebook(req: Request, res: Response, next: NextFunction) {
  try {
    const notebook = notebookRepo.createNotebook(req.body);
    res.status(201).json({ data: notebook });
  } catch (error) {
    next(error);
  }
}

export async function getNotebook(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const notebooks = notebookRepo.listNotebooks();
    const notebook = notebooks.find(n => n.id === id);
    
    if (!notebook) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Notebook not found'
        }
      });
    }

    res.json({ data: notebook });
  } catch (error) {
    next(error);
  }
}

export async function listNotebooks(req: Request, res: Response, next: NextFunction) {
  try {
    const notebooks = notebookRepo.listNotebooks();
    res.json({ data: notebooks });
  } catch (error) {
    next(error);
  }
}

export async function updateNotebook(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const notebook = notebookRepo.updateNotebook({
      id,
      payload: req.body
    });
    res.json({ data: notebook });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotebook(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    notebookRepo.deleteNotebook(id);
    res.json({ data: { success: true, id } });
  } catch (error) {
    next(error);
  }
}

export async function getNotebooksStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = notebookRepo.getNotebookStats();
    const notebooks = notebookRepo.listNotebooks();

    const notebooksData = notebooks.map(n => ({
      id: n.id,
      title: n.name,
      noteCount: n.noteCount,
      lastUpdated: n.updatedAt
    }));

    const status = {
      total: stats.totalNotebooks,
      totalNotes: stats.totalNotes,
      notebooks: notebooksData
    };

    res.json({ data: status });
  } catch (error) {
    next(error);
  }
}
