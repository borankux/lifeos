import { Router } from 'express';
import * as notesController from '../controllers/notesController';

export const notesRouter = Router();

// Create note
notesRouter.post('/create', notesController.createNote);

// Get note by ID
notesRouter.get('/:id', notesController.getNote);

// List notes in notebook
notesRouter.get('/notebook/:notebookId', notesController.listNotesByNotebook);

// Update note
notesRouter.put('/:id', notesController.updateNote);

// Delete note
notesRouter.delete('/:id', notesController.deleteNote);

// Search notes
notesRouter.get('/search', notesController.searchNotes);

// Get notes status
notesRouter.get('/status', notesController.getNotesStatus);
