import { z } from 'zod';
import { getDb } from './init';
import { emitDiaryEvent } from './eventsRepo';

// ==================== TYPES ====================

export interface Notebook {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  position: number;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  notebookId: number;
  title: string;
  content: string;
  wordCount: number;
  tags: string[] | null;
  isPinned: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== SCHEMAS ====================

const createNotebookSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  icon: z.string().max(30).optional(),
  color: z.string().max(20).optional(),
});

const updateNotebookSchema = z.object({
  id: z.number().int().positive(),
  payload: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    icon: z.string().max(30).optional().nullable(),
    color: z.string().max(20).optional().nullable(),
    position: z.number().optional(),
  })
});

const createNoteSchema = z.object({
  notebookId: z.number().int().positive(),
  title: z.string().min(1).max(500),
  content: z.string().default(''),
  tags: z.array(z.string().max(30)).optional(),
});

const updateNoteSchema = z.object({
  id: z.number().int().positive(),
  payload: z.object({
    title: z.string().min(1).max(500).optional(),
    content: z.string().optional(),
    tags: z.array(z.string().max(30)).optional().nullable(),
    isPinned: z.boolean().optional(),
  })
});

// ==================== HELPERS ====================

function countWords(text: string): number {
  if (!text || !text.trim()) return 0;
  // Remove markdown syntax for more accurate word count
  const cleaned = text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]*`/g, '') // inline code
    .replace(/[#*_~\[\]()]/g, '') // markdown symbols
    .trim();
  
  return cleaned.split(/\s+/).filter(word => word.length > 0).length;
}

// ==================== NOTEBOOKS ====================

export function listNotebooks(): Notebook[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT 
      n.*,
      COUNT(DISTINCT nt.id) as note_count
    FROM notebooks n
    LEFT JOIN notes nt ON nt.notebook_id = n.id
    GROUP BY n.id
    ORDER BY n.position ASC, n.id ASC
  `).all() as any[];

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    position: row.position,
    noteCount: row.note_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export function createNotebook(input: z.infer<typeof createNotebookSchema>): Notebook {
  const payload = createNotebookSchema.parse(input);
  const db = getDb();

  const positionRow = db.prepare('SELECT MAX(position) as max_pos FROM notebooks').get() as any;
  const nextPosition = (positionRow?.max_pos ?? -1) + 1;

  const row = db.prepare(`
    INSERT INTO notebooks (name, description, icon, color, position)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    payload.name,
    payload.description ?? null,
    payload.icon ?? null,
    payload.color ?? null,
    nextPosition
  ) as any;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    position: row.position,
    noteCount: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function updateNotebook(input: z.infer<typeof updateNotebookSchema>): Notebook {
  const { id, payload } = updateNotebookSchema.parse(input);
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
  if (payload.icon !== undefined) {
    fields.push('icon = ?');
    params.push(payload.icon ?? null);
  }
  if (payload.color !== undefined) {
    fields.push('color = ?');
    params.push(payload.color ?? null);
  }
  if (payload.position !== undefined) {
    fields.push('position = ?');
    params.push(payload.position);
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`
      UPDATE notebooks 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...params);
  }

  const notebooks = listNotebooks();
  const updated = notebooks.find(n => n.id === id);
  
  if (!updated) {
    throw new Error('Notebook not found');
  }

  return updated;
}

export function deleteNotebook(id: number): void {
  const db = getDb();
  const result = db.prepare('DELETE FROM notebooks WHERE id = ?').run(id);
  
  if (result.changes === 0) {
    throw new Error('Notebook not found');
  }
}

// ==================== NOTES ====================

export function listNotesByNotebook(notebookId: number): Note[] {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT * FROM notes
    WHERE notebook_id = ?
    ORDER BY is_pinned DESC, created_at DESC
  `).all(notebookId) as any[];

  return rows.map(row => ({
    id: row.id,
    notebookId: row.notebook_id,
    title: row.title,
    content: row.content,
    wordCount: row.word_count,
    tags: row.tags ? JSON.parse(row.tags) : null,
    isPinned: Boolean(row.is_pinned),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export function getNote(id: number): Note | null {
  const db = getDb();
  
  const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any;
  
  if (!row) return null;

  return {
    id: row.id,
    notebookId: row.notebook_id,
    title: row.title,
    content: row.content,
    wordCount: row.word_count,
    tags: row.tags ? JSON.parse(row.tags) : null,
    isPinned: Boolean(row.is_pinned),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function createNote(input: z.infer<typeof createNoteSchema>): Note {
  const payload = createNoteSchema.parse(input);
  const db = getDb();

  const positionRow = db.prepare(
    'SELECT MAX(position) as max_pos FROM notes WHERE notebook_id = ?'
  ).get(payload.notebookId) as any;
  const nextPosition = (positionRow?.max_pos ?? -1) + 1;

  const wordCount = countWords(payload.content);
  const tagsJson = payload.tags ? JSON.stringify(payload.tags) : null;

  const row = db.prepare(`
    INSERT INTO notes (notebook_id, title, content, word_count, tags, position)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    payload.notebookId,
    payload.title,
    payload.content,
    wordCount,
    tagsJson,
    nextPosition
  ) as any;

  // Emit event for metrics
  emitDiaryEvent(wordCount);

  return {
    id: row.id,
    notebookId: row.notebook_id,
    title: row.title,
    content: row.content,
    wordCount: row.word_count,
    tags: row.tags ? JSON.parse(row.tags) : null,
    isPinned: Boolean(row.is_pinned),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function updateNote(input: z.infer<typeof updateNoteSchema>): Note {
  const { id, payload } = updateNoteSchema.parse(input);
  const db = getDb();

  const fields: string[] = [];
  const params: any[] = [];

  if (payload.title !== undefined) {
    fields.push('title = ?');
    params.push(payload.title);
  }
  if (payload.content !== undefined) {
    fields.push('content = ?');
    params.push(payload.content);
    fields.push('word_count = ?');
    params.push(countWords(payload.content));
    
    // Emit event for content update
    emitDiaryEvent(countWords(payload.content));
  }
  if (payload.tags !== undefined) {
    fields.push('tags = ?');
    params.push(payload.tags ? JSON.stringify(payload.tags) : null);
  }
  if (payload.isPinned !== undefined) {
    fields.push('is_pinned = ?');
    params.push(payload.isPinned ? 1 : 0);
  }

  if (fields.length > 0) {
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`
      UPDATE notes 
      SET ${fields.join(', ')}
      WHERE id = ?
    `).run(...params);
  }

  const note = getNote(id);
  
  if (!note) {
    throw new Error('Note not found');
  }

  return note;
}

export function deleteNote(id: number): void {
  const db = getDb();
  const result = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  
  if (result.changes === 0) {
    throw new Error('Note not found');
  }
}

// ==================== SEARCH ====================

export function searchNotes(query: string): Note[] {
  const db = getDb();
  
  const searchPattern = `%${query}%`;
  
  const rows = db.prepare(`
    SELECT * FROM notes
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY updated_at DESC
    LIMIT 50
  `).all(searchPattern, searchPattern) as any[];

  return rows.map(row => ({
    id: row.id,
    notebookId: row.notebook_id,
    title: row.title,
    content: row.content,
    wordCount: row.word_count,
    tags: row.tags ? JSON.parse(row.tags) : null,
    isPinned: Boolean(row.is_pinned),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

// ==================== STATS ====================

export function getNotebookStats(): {
  totalNotebooks: number;
  totalNotes: number;
  totalWords: number;
  recentNotes: number; // Last 7 days
} {
  const db = getDb();

  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM notebooks) as total_notebooks,
      (SELECT COUNT(*) FROM notes) as total_notes,
      (SELECT COALESCE(SUM(word_count), 0) FROM notes) as total_words,
      (SELECT COUNT(*) FROM notes WHERE created_at >= datetime('now', '-7 days')) as recent_notes
  `).get() as any;

  return {
    totalNotebooks: stats.total_notebooks || 0,
    totalNotes: stats.total_notes || 0,
    totalWords: stats.total_words || 0,
    recentNotes: stats.recent_notes || 0
  };
}
