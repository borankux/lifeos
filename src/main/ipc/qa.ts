import { ipcMain } from 'electron';
import { wrapIpc } from '../utils/response';
import {
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  listQuestionsByCollection,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  listAnswersByQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  getQAStats
} from '../../database/qaRepo';

// ==================== COLLECTIONS ====================

ipcMain.handle(
  'qa:listCollections',
  wrapIpc(() => {
    return listCollections();
  })
);

ipcMain.handle(
  'qa:createCollection',
  wrapIpc((_event, args: { name: string; description?: string; color?: string; icon?: string }) => {
    return createCollection(args);
  })
);

ipcMain.handle(
  'qa:updateCollection',
  wrapIpc((_event, args: { id: number; payload: any }) => {
    return updateCollection(args);
  })
);

ipcMain.handle(
  'qa:deleteCollection',
  wrapIpc((_event, args: { id: number }) => {
    deleteCollection(args.id);
    return { success: true };
  })
);

// ==================== QUESTIONS ====================

ipcMain.handle(
  'qa:listQuestions',
  wrapIpc((_event, args: { collectionId: number }) => {
    return listQuestionsByCollection(args.collectionId);
  })
);

ipcMain.handle(
  'qa:createQuestion',
  wrapIpc((_event, args: { collectionId: number; question: string; tags?: string[] }) => {
    return createQuestion(args);
  })
);

ipcMain.handle(
  'qa:updateQuestion',
  wrapIpc((_event, args: { id: number; payload: any }) => {
    return updateQuestion(args);
  })
);

ipcMain.handle(
  'qa:deleteQuestion',
  wrapIpc((_event, args: { id: number }) => {
    deleteQuestion(args.id);
    return { success: true };
  })
);

// ==================== ANSWERS ====================

ipcMain.handle(
  'qa:listAnswers',
  wrapIpc((_event, args: { questionId: number }) => {
    return listAnswersByQuestion(args.questionId);
  })
);

ipcMain.handle(
  'qa:createAnswer',
  wrapIpc((_event, args: { questionId: number; content: string; isPartial?: boolean }) => {
    return createAnswer({
      questionId: args.questionId,
      content: args.content,
      isPartial: args.isPartial ?? true
    });
  })
);

ipcMain.handle(
  'qa:updateAnswer',
  wrapIpc((_event, args: { id: number; payload: any }) => {
    return updateAnswer(args);
  })
);

ipcMain.handle(
  'qa:deleteAnswer',
  wrapIpc((_event, args: { id: number }) => {
    deleteAnswer(args.id);
    return { success: true };
  })
);

// ==================== STATS ====================

ipcMain.handle(
  'qa:getStats',
  wrapIpc(() => {
    return getQAStats();
  })
);
