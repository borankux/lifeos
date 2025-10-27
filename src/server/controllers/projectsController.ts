import { Request, Response, NextFunction } from 'express';
import * as projectsRepo from '../../database/projectsRepo';
import { getDb } from '../../database/init';
import { loadSettings, saveSettings } from '../../services/settings';

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = projectsRepo.createProject(req.body);
    res.status(201).json({ data: project });
  } catch (error) {
    next(error);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const projects = projectsRepo.listProjects({ includeArchived: true });
    const project = projects.find(p => p.id === id);
    
    if (!project) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
}

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const projects = projectsRepo.listProjects({ includeArchived });
    res.json({ data: projects });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const project = projectsRepo.updateProject({
      id,
      payload: req.body
    });
    res.json({ data: project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    projectsRepo.deleteProject(id);
    res.json({ data: { success: true, id } });
  } catch (error) {
    next(error);
  }
}

export async function reorderProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { order } = req.body;
    projectsRepo.reorderProjects(order);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
}

export async function setActiveProject(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const settings = loadSettings();
    settings.activeProjectId = id;
    saveSettings(settings);
    res.json({ data: { activeProjectId: id } });
  } catch (error) {
    next(error);
  }
}

export async function getProjectsStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const settings = loadSettings();
    const projects = projectsRepo.listProjects();

    const projectsWithStats = projects.map(project => {
      const stats = db.prepare(`
        SELECT
          COUNT(*) as task_count,
          SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(COALESCE(estimated_minutes, 0)) as total_estimated_minutes,
          SUM(COALESCE(actual_minutes, 0)) as total_actual_minutes
        FROM tasks
        WHERE project_id = ?
      `).get(project.id) as any;

      const completionRate = stats.task_count > 0 
        ? Math.round((stats.completed_count / stats.task_count) * 100) 
        : 0;

      return {
        id: project.id,
        name: project.name,
        taskCount: stats.task_count || 0,
        completedCount: stats.completed_count || 0,
        completionRate,
        totalEstimatedMinutes: stats.total_estimated_minutes || 0,
        totalActualMinutes: stats.total_actual_minutes || 0
      };
    });

    const status = {
      total: projects.length,
      activeProjectId: settings.activeProjectId || null,
      projects: projectsWithStats
    };

    res.json({ data: status });
  } catch (error) {
    next(error);
  }
}
