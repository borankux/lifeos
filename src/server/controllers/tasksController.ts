import { Request, Response, NextFunction } from 'express';
import * as tasksRepo from '../../database/tasksRepo';
import { getDb } from '../../database/init';

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = tasksRepo.createTask(req.body);
    res.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getDb();
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    
    if (!row) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    res.json({ data: row });
  } catch (error) {
    next(error);
  }
}

export async function listTasksByProject(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const tasks = tasksRepo.listTasksByProject(projectId);
    res.json({ data: tasks });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const task = tasksRepo.updateTask({
      id,
      payload: req.body
    });
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const db = getDb();
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found'
        }
      });
    }

    res.json({ data: { success: true, id } });
  } catch (error) {
    next(error);
  }
}

export async function moveTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const task = tasksRepo.moveTask({
      id,
      ...req.body
    });
    res.json({ data: task });
  } catch (error) {
    next(error);
  }
}

export async function getTasksStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Backlog' THEN 1 ELSE 0 END) as backlog,
        SUM(CASE WHEN status = 'To-Do' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN priority = 'Critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN priority = 'Medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN priority = 'Low' THEN 1 ELSE 0 END) as low,
        AVG(estimated_minutes) as avg_estimated_minutes,
        AVG(actual_minutes) as avg_actual_minutes
      FROM tasks
    `).get() as any;

    const completionRate = stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0;

    const status = {
      total: stats.total || 0,
      byStatus: {
        backlog: stats.backlog || 0,
        todo: stats.todo || 0,
        inProgress: stats.in_progress || 0,
        completed: stats.completed || 0
      },
      byPriority: {
        critical: stats.critical || 0,
        high: stats.high || 0,
        medium: stats.medium || 0,
        low: stats.low || 0
      },
      avgEstimatedMinutes: Math.round(stats.avg_estimated_minutes || 0),
      avgActualMinutes: Math.round(stats.avg_actual_minutes || 0),
      completionRate
    };

    res.json({ data: status });
  } catch (error) {
    next(error);
  }
}
