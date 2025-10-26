import { z } from 'zod';
import { getDb } from './init';
import { QA_STATUS } from './qaSchema';
import { emitQAEvent } from './eventsRepo';

// ==================== TYPES ====================

export interface QACollection {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  position: number;
  questionCount: number;
  answeredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QAQuestion {
  id: number;
  collectionId: number;
  question: string;
  tags: string[] | null;
  status: string;
  position: number;
  answerCount: number;
  partialAnswerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QAAnswer {
  id: number;
  questionId: number;
  content: string;
  isPartial: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== SCHEMAS ====================

const createCollectionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(30).optional(),
});

const updateCollectionSchema = z.object({
  id: z.number().int().positive(),
  payload: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    color: z.string().max(20).optional().nullable(),
    icon: z.string().max(30).optional().nullable(),
    position: z.number().optional(),
  })
});

const createQuestionSchema = z.object({
  collectionId: z.number().int().positive(),
  question: z.string().min(1).max(1000),
  tags: z.array(z.string().max(30)).optional(),
});

const updateQuestionSchema = z.object({
  id: z.number().int().positive(),
  payload: z.object({
    question: z.string().min(1).max(1000).optional(),
    tags: z.array(z.string().max(30)).optional().nullable(),
    status: z.string().optional(),
    position: z.number().optional(),
  })
});

const createAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  content: z.string().min(1),
  isPartial: z.boolean().default(true),
});

const updateAnswerSchema = z.object({
  id: z.number().int().positive(),
  payload: z.object({
    content: z.string().min(1).optional(),
    isPartial: z.boolean().optional(),
  })
});

// ==================== COLLECTIONS ====================

export function listCollections(): QACollection[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT 
      c.*,
      COUNT(DISTINCT q.id) as question_count,
      COUNT(DISTINCT CASE WHEN q.status = 'answered' THEN q.id END) as answered_count
    FROM qa_collections c
    LEFT JOIN qa_questions q ON q.collection_id = c.id
    GROUP BY c.id
    ORDER BY c.position ASC, c.id ASC
  `).all() as any[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    position: row.position,
    questionCount: row.question_count || 0,
    answeredCount: row.answered_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export function createCollection(input: z.infer<typeof createCollectionSchema>): QACollection {
  const payload = createCollectionSchema.parse(input);
  const db = getDb();

  const positionRow = db.prepare('SELECT MAX(position) as max_pos FROM qa_collections').get() as any;
  const nextPosition = (positionRow?.max_pos ?? -1) + 1;

  const row = db.prepare(`
    INSERT INTO qa_collections (name, description, color, icon, position)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    payload.name,
    payload.description ?? null,
    payload.color ?? null,
    payload.icon ?? null,
    nextPosition
  ) as any;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    position: row.position,
    questionCount: 0,
    answeredCount: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function updateCollection(input: z.infer<typeof updateCollectionSchema>): QACollection {
  const { id, payload } = updateCollectionSchema.parse(input);
  const db = getDb();

  const fields: string[] = [];
  const params: any[] = [];

  if (payload.name !== undefined) {
    fields.push('name = ?');
    params.push(payload.name);
  }
  if (payload.description !== undefined) {
    fields.push('description = ?');
    params.push(payload.description ?? null);
  }
  if (payload.color !== undefined) {
    fields.push('color = ?');
    params.push(payload.color ?? null);
  }
  if (payload.icon !== undefined) {
    fields.push('icon = ?');
    params.push(payload.icon ?? null);
  }
  if (payload.position !== undefined) {
    fields.push('position = ?');
    params.push(payload.position);
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`
      UPDATE qa_collections 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...params);
  }

  const collections = listCollections();
  const updated = collections.find(c => c.id === id);
  
  if (!updated) {
    throw new Error('Collection not found');
  }

  return updated;
}

export function deleteCollection(id: number): void {
  const db = getDb();
  const result = db.prepare('DELETE FROM qa_collections WHERE id = ?').run(id);
  
  if (result.changes === 0) {
    throw new Error('Collection not found');
  }
}

// ==================== QUESTIONS ====================

export function listQuestionsByCollection(collectionId: number): QAQuestion[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT 
      q.*,
      COUNT(DISTINCT a.id) as answer_count,
      COUNT(DISTINCT CASE WHEN a.is_partial = 1 THEN a.id END) as partial_answer_count
    FROM qa_questions q
    LEFT JOIN qa_answers a ON a.question_id = q.id
    WHERE q.collection_id = ?
    GROUP BY q.id
    ORDER BY q.position ASC, q.id ASC
  `).all(collectionId) as any[];

  return rows.map(row => ({
    id: row.id,
    collectionId: row.collection_id,
    question: row.question,
    tags: row.tags ? JSON.parse(row.tags) : null,
    status: row.status,
    position: row.position,
    answerCount: row.answer_count || 0,
    partialAnswerCount: row.partial_answer_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export function createQuestion(input: z.infer<typeof createQuestionSchema>): QAQuestion {
  const payload = createQuestionSchema.parse(input);
  const db = getDb();

  const positionRow = db.prepare(
    'SELECT MAX(position) as max_pos FROM qa_questions WHERE collection_id = ?'
  ).get(payload.collectionId) as any;
  const nextPosition = (positionRow?.max_pos ?? -1) + 1;

  const tagsJson = payload.tags ? JSON.stringify(payload.tags) : null;

  const row = db.prepare(`
    INSERT INTO qa_questions (collection_id, question, tags, position)
    VALUES (?, ?, ?, ?)
    RETURNING *
  `).get(
    payload.collectionId,
    payload.question,
    tagsJson,
    nextPosition
  ) as any;

  // Emit event
  const wordCount = payload.question.split(/\s+/).length;
  emitQAEvent('asked', wordCount);

  return {
    id: row.id,
    collectionId: row.collection_id,
    question: row.question,
    tags: row.tags ? JSON.parse(row.tags) : null,
    status: row.status,
    position: row.position,
    answerCount: 0,
    partialAnswerCount: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function updateQuestion(input: z.infer<typeof updateQuestionSchema>): QAQuestion {
  const { id, payload } = updateQuestionSchema.parse(input);
  const db = getDb();

  const fields: string[] = [];
  const params: any[] = [];

  if (payload.question !== undefined) {
    fields.push('question = ?');
    params.push(payload.question);
  }
  if (payload.tags !== undefined) {
    fields.push('tags = ?');
    params.push(payload.tags ? JSON.stringify(payload.tags) : null);
  }
  if (payload.status !== undefined) {
    fields.push('status = ?');
    params.push(payload.status);
  }
  if (payload.position !== undefined) {
    fields.push('position = ?');
    params.push(payload.position);
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`
      UPDATE qa_questions 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...params);
  }

  const row = db.prepare('SELECT * FROM qa_questions WHERE id = ?').get(id) as any;
  
  if (!row) {
    throw new Error('Question not found');
  }

  const answerStats = db.prepare(`
    SELECT 
      COUNT(*) as answer_count,
      COUNT(CASE WHEN is_partial = 1 THEN 1 END) as partial_count
    FROM qa_answers
    WHERE question_id = ?
  `).get(id) as any;

  return {
    id: row.id,
    collectionId: row.collection_id,
    question: row.question,
    tags: row.tags ? JSON.parse(row.tags) : null,
    status: row.status,
    position: row.position,
    answerCount: answerStats?.answer_count || 0,
    partialAnswerCount: answerStats?.partial_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function deleteQuestion(id: number): void {
  const db = getDb();
  const result = db.prepare('DELETE FROM qa_questions WHERE id = ?').run(id);
  
  if (result.changes === 0) {
    throw new Error('Question not found');
  }
}

/**
 * Update question status based on answers
 */
function updateQuestionStatus(questionId: number): void {
  const db = getDb();
  
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN is_partial = 0 THEN 1 END) as complete
    FROM qa_answers
    WHERE question_id = ?
  `).get(questionId) as any;

  let status: string = QA_STATUS.UNANSWERED;
  
  if (stats.total > 0) {
    status = stats.complete > 0 ? QA_STATUS.ANSWERED : QA_STATUS.IN_PROGRESS;
  }

  db.prepare('UPDATE qa_questions SET status = ? WHERE id = ?').run(status, questionId);
}

// ==================== ANSWERS ====================

export function listAnswersByQuestion(questionId: number): QAAnswer[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT * FROM qa_answers
    WHERE question_id = ?
    ORDER BY position ASC, id ASC
  `).all(questionId) as any[];

  return rows.map(row => ({
    id: row.id,
    questionId: row.question_id,
    content: row.content,
    isPartial: Boolean(row.is_partial),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export function createAnswer(input: z.infer<typeof createAnswerSchema>): QAAnswer {
  const payload = createAnswerSchema.parse(input);
  const db = getDb();

  const positionRow = db.prepare(
    'SELECT MAX(position) as max_pos FROM qa_answers WHERE question_id = ?'
  ).get(payload.questionId) as any;
  const nextPosition = (positionRow?.max_pos ?? -1) + 1;

  const row = db.prepare(`
    INSERT INTO qa_answers (question_id, content, is_partial, position)
    VALUES (?, ?, ?, ?)
    RETURNING *
  `).get(
    payload.questionId,
    payload.content,
    payload.isPartial ? 1 : 0,
    nextPosition
  ) as any;

  // Update question status
  updateQuestionStatus(payload.questionId);

  // Emit event
  const wordCount = payload.content.split(/\s+/).length;
  emitQAEvent('answered', wordCount);

  return {
    id: row.id,
    questionId: row.question_id,
    content: row.content,
    isPartial: Boolean(row.is_partial),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function updateAnswer(input: z.infer<typeof updateAnswerSchema>): QAAnswer {
  const { id, payload } = updateAnswerSchema.parse(input);
  const db = getDb();

  const fields: string[] = [];
  const params: any[] = [];

  if (payload.content !== undefined) {
    fields.push('content = ?');
    params.push(payload.content);
  }
  if (payload.isPartial !== undefined) {
    fields.push('is_partial = ?');
    params.push(payload.isPartial ? 1 : 0);
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`
      UPDATE qa_answers 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...params);
  }

  const row = db.prepare('SELECT * FROM qa_answers WHERE id = ?').get(id) as any;
  
  if (!row) {
    throw new Error('Answer not found');
  }

  // Update question status
  updateQuestionStatus(row.question_id);

  return {
    id: row.id,
    questionId: row.question_id,
    content: row.content,
    isPartial: Boolean(row.is_partial),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function deleteAnswer(id: number): void {
  const db = getDb();
  
  const answer = db.prepare('SELECT question_id FROM qa_answers WHERE id = ?').get(id) as any;
  
  if (!answer) {
    throw new Error('Answer not found');
  }

  const result = db.prepare('DELETE FROM qa_answers WHERE id = ?').run(id);
  
  if (result.changes > 0) {
    // Update question status after deletion
    updateQuestionStatus(answer.question_id);
  }
}

// ==================== STATS ====================

export function getQAStats(): {
  totalCollections: number;
  totalQuestions: number;
  unansweredQuestions: number;
  inProgressQuestions: number;
  answeredQuestions: number;
  totalAnswers: number;
} {
  const db = getDb();

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM qa_collections) as total_collections,
      (SELECT COUNT(*) FROM qa_questions) as total_questions,
      (SELECT COUNT(*) FROM qa_questions WHERE status = ?) as unanswered,
      (SELECT COUNT(*) FROM qa_questions WHERE status = ?) as in_progress,
      (SELECT COUNT(*) FROM qa_questions WHERE status = ?) as answered,
      (SELECT COUNT(*) FROM qa_answers) as total_answers
  `).get(
    QA_STATUS.UNANSWERED,
    QA_STATUS.IN_PROGRESS,
    QA_STATUS.ANSWERED
  ) as any;

  return {
    totalCollections: stats.total_collections || 0,
    totalQuestions: stats.total_questions || 0,
    unansweredQuestions: stats.unanswered || 0,
    inProgressQuestions: stats.in_progress || 0,
    answeredQuestions: stats.answered || 0,
    totalAnswers: stats.total_answers || 0
  };
}
