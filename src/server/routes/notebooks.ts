import { Router } from 'express';
import * as notebooksController from '../controllers/notebooksController';

export const notebooksRouter = Router();

// Create notebook
notebooksRouter.post('/create', notebooksController.createNotebook);

// Get notebook by ID
notebooksRouter.get('/:id', notebooksController.getNotebook);

// List all notebooks
notebooksRouter.get('/', notebooksController.listNotebooks);

// Update notebook
notebooksRouter.put('/:id', notebooksController.updateNotebook);

// Delete notebook
notebooksRouter.delete('/:id', notebooksController.deleteNotebook);

// Get notebooks status
notebooksRouter.get('/status', notebooksController.getNotebooksStatus);
