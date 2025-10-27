import { Router } from 'express';
import * as qaController from '../controllers/qaController';

export const qaRouter = Router();

// Collections
qaRouter.post('/collections/create', qaController.createCollection);
qaRouter.get('/collections/:id', qaController.getCollection);
qaRouter.get('/collections', qaController.listCollections);
qaRouter.put('/collections/:id', qaController.updateCollection);
qaRouter.delete('/collections/:id', qaController.deleteCollection);

// Questions
qaRouter.post('/questions/create', qaController.createQuestion);
qaRouter.get('/questions/:id', qaController.getQuestion);
qaRouter.get('/questions', qaController.listQuestions);
qaRouter.put('/questions/:id', qaController.updateQuestion);
qaRouter.delete('/questions/:id', qaController.deleteQuestion);

// Answers
qaRouter.post('/answers/create', qaController.createAnswer);
qaRouter.get('/answers/:questionId', qaController.getAnswers);
qaRouter.put('/answers/:id', qaController.updateAnswer);
qaRouter.delete('/answers/:id', qaController.deleteAnswer);

// Status
qaRouter.get('/status', qaController.getQAStatus);
