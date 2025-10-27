import { Request, Response, NextFunction } from 'express';
import { getDb } from '../../database/init';
import * as habitsRepo from '../../database/habitsRepo';
import * as notebookRepo from '../../database/notebookRepo';
import * as qaRepo from '../../database/qaRepo';
import * as activitiesRepo from '../../database/activitiesRepo';
import * as projectsRepo from '../../database/projectsRepo';
import { loadSettings } from '../../services/settings';
import fs from 'fs';
import path from 'path';

const startTime = Date.now();

export async function getGlobalStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const settings = loadSettings();

    // Tasks stats
    const taskStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Backlog' THEN 1 ELSE 0 END) as backlog,
        SUM(CASE WHEN status = 'To-Do' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM tasks
    `).get() as any;

    const taskCompletionRate = taskStats.total > 0 
      ? Math.round((taskStats.completed / taskStats.total) * 100) 
      : 0;

    // Projects stats
    const projects = projectsRepo.listProjects();
    const activeProject = projects.find(p => p.id === settings.activeProjectId);

    // Habits stats
    const habitStats = habitsRepo.getHabitStats();

    // Notebooks stats
    const notebookStats = notebookRepo.getNotebookStats();

    // Q&A stats
    const qaStats = qaRepo.getQAStats();

    // Activities stats
    const activityStats = activitiesRepo.getActivityStats();
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activitiesRepo.getActivityCountByDate(today);

    // Calculate streak
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const count = activitiesRepo.getActivityCountByDate(dateStr);
      
      if (count > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Database health check
    let dbSize = 0;
    let dbHealthy = true;
    try {
      const { app } = require('electron');
      const dbPath = path.join(app.getPath('userData'), 'lifeos', 'app.db');
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        dbSize = stats.size;
      }
    } catch (error) {
      dbHealthy = false;
    }

    const status = {
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: require('../../../package.json').version,
      modules: {
        tasks: {
          total: taskStats.total || 0,
          byStatus: {
            backlog: taskStats.backlog || 0,
            todo: taskStats.todo || 0,
            inProgress: taskStats.in_progress || 0,
            completed: taskStats.completed || 0
          },
          completionRate: taskCompletionRate
        },
        projects: {
          total: projects.length,
          active: activeProject ? activeProject.name : null,
          status: {
            activeProjectId: settings.activeProjectId || null
          }
        },
        habits: {
          total: habitStats.totalHabits,
          active: habitStats.activeHabits,
          completedToday: habitStats.completedToday,
          status: {
            avgCompletionRate: habitStats.avgCompletionRate
          }
        },
        notebooks: {
          total: notebookStats.totalNotebooks,
          notes: notebookStats.totalNotes,
          status: {
            totalWords: notebookStats.totalWords,
            recentNotes: notebookStats.recentNotes
          }
        },
        qa: {
          questions: qaStats.totalQuestions,
          answers: qaStats.totalAnswers,
          status: {
            unanswered: qaStats.unansweredQuestions,
            inProgress: qaStats.inProgressQuestions,
            answered: qaStats.answeredQuestions
          }
        },
        activities: {
          today: todayActivities,
          thisWeek: activityStats.last7Days,
          streak,
          status: {
            total: activityStats.total,
            byType: activityStats.byType
          }
        }
      },
      database: {
        size: dbSize,
        healthy: dbHealthy
      }
    };

    res.json({ data: status });
  } catch (error) {
    next(error);
  }
}
