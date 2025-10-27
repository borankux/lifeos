import { Request, Response, NextFunction } from 'express';
import * as qaRepo from '../../database/qaRepo';

// Collections
export async function createCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const collection = qaRepo.createCollection(req.body);
    res.status(201).json({ data: collection });
  } catch (error) {
    next(error);
  }
}

export async function getCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const collections = qaRepo.listCollections();
    const collection = collections.find(c => c.id === id);
    
    if (!collection) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Collection not found'
        }
      });
    }

    res.json({ data: collection });
  } catch (error) {
    next(error);
  }
}

export async function listCollections(req: Request, res: Response, next: NextFunction) {
  try {
    const collections = qaRepo.listCollections();
    res.json({ data: collections });
  } catch (error) {
    next(error);
  }
}

export async function updateCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const collection = qaRepo.updateCollection({
      id,
      payload: req.body
    });
    res.json({ data: collection });
  } catch (error) {
    next(error);
  }
}

export async function deleteCollection(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    qaRepo.deleteCollection(id);
    res.json({ data: { success: true, id } });
  } catch (error) {
    next(error);
  }
}

// Questions
export async function createQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const question = qaRepo.createQuestion(req.body);
    res.status(201).json({ data: question });
  } catch (error) {
    next(error);
  }
}

export async function getQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const collectionId = parseInt(req.query.collectionId as string, 10);
    const questions = qaRepo.listQuestionsByCollection(collectionId);
    const question = questions.find(q => q.id === id);
    
    if (!question) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Question not found'
        }
      });
    }

    res.json({ data: question });
  } catch (error) {
    next(error);
  }
}

export async function listQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const collectionId = parseInt(req.query.collectionId as string, 10);
    
    if (!collectionId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'collectionId is required'
        }
      });
    }

    const questions = qaRepo.listQuestionsByCollection(collectionId);
    res.json({ data: questions });
  } catch (error) {
    next(error);
  }
}

export async function updateQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const question = qaRepo.updateQuestion({
      id,
      payload: req.body
    });
    res.json({ data: question });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    qaRepo.deleteQuestion(id);
    res.json({ data: { success: true, id } });
  } catch (error) {
    next(error);
  }
}

// Answers
export async function createAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const answer = qaRepo.createAnswer(req.body);
    res.status(201).json({ data: answer });
  } catch (error) {
    next(error);
  }
}

export async function getAnswers(req: Request, res: Response, next: NextFunction) {
  try {
    const questionId = parseInt(req.params.questionId, 10);
    const answers = qaRepo.listAnswersByQuestion(questionId);
    res.json({ data: answers });
  } catch (error) {
    next(error);
  }
}

export async function updateAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const answer = qaRepo.updateAnswer({
      id,
      payload: req.body
    });
    res.json({ data: answer });
  } catch (error) {
    next(error);
  }
}

export async function deleteAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    qaRepo.deleteAnswer(id);
    res.json({ data: { success: true, id } });
  } catch (error) {
    next(error);
  }
}

// Status
export async function getQAStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = qaRepo.getQAStats();
    const collections = qaRepo.listCollections();

    const collectionsData = collections.map(c => ({
      name: c.name,
      questionCount: c.questionCount
    }));

    const answerRate = stats.totalQuestions > 0 
      ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100) 
      : 0;

    const status = {
      totalQuestions: stats.totalQuestions,
      totalAnswers: stats.totalAnswers,
      byStatus: {
        unanswered: stats.unansweredQuestions,
        inProgress: stats.inProgressQuestions,
        answered: stats.answeredQuestions
      },
      answerRate,
      collections: collectionsData
    };

    res.json({ data: status });
  } catch (error) {
    next(error);
  }
}
