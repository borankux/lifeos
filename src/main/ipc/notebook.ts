import { ipcMain } from 'electron';
import { wrapIpc } from '../utils/response';
import {
  listNotebooks,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  listNotesByNotebook,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  getNotebookStats
} from '../../database/notebookRepo';

// ==================== NOTEBOOKS ====================

ipcMain.handle(
  'notebook:listNotebooks',
  wrapIpc(() => {
    return listNotebooks();
  })
);

ipcMain.handle(
  'notebook:createNotebook',
  wrapIpc((_event, args: { name: string; description?: string; icon?: string; color?: string }) => {
    return createNotebook(args);
  })
);

ipcMain.handle(
  'notebook:updateNotebook',
  wrapIpc((_event, args: { id: number; payload: any }) => {
    return updateNotebook(args);
  })
);

ipcMain.handle(
  'notebook:deleteNotebook',
  wrapIpc((_event, args: { id: number }) => {
    deleteNotebook(args.id);
    return { success: true };
  })
);

// ==================== NOTES ====================

ipcMain.handle(
  'notebook:listNotes',
  wrapIpc((_event, args: { notebookId: number }) => {
    return listNotesByNotebook(args.notebookId);
  })
);

ipcMain.handle(
  'notebook:getNote',
  wrapIpc((_event, args: { id: number }) => {
    return getNote(args.id);
  })
);

ipcMain.handle(
  'notebook:createNote',
  wrapIpc((_event, args: { notebookId: number; title: string; content?: string; tags?: string[] }) => {
    return createNote({
      notebookId: args.notebookId,
      title: args.title,
      content: args.content ?? '',
      tags: args.tags
    });
  })
);

ipcMain.handle(
  'notebook:updateNote',
  wrapIpc((_event, args: { id: number; payload: any }) => {
    return updateNote(args);
  })
);

ipcMain.handle(
  'notebook:deleteNote',
  wrapIpc((_event, args: { id: number }) => {
    deleteNote(args.id);
    return { success: true };
  })
);

// ==================== SEARCH & STATS ====================

ipcMain.handle(
  'notebook:searchNotes',
  wrapIpc((_event, args: { query: string }) => {
    return searchNotes(args.query);
  })
);

ipcMain.handle(
  'notebook:getStats',
  wrapIpc(() => {
    return getNotebookStats();
  })
);
