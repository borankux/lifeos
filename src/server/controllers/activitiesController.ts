import { Request, Response, NextFunction } from 'express';
import * as activitiesRepo from '../../database/activitiesRepo';
import { getDb } from '../../database/init';

export async function getAllActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 500;
    const activities = activitiesRepo.getAllActivities(limit);
    res.json({ data: activities });
  } catch (error) {
    next(error);
  }
}

export async function getActivitiesByDate(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.params.date;
    const activities = activitiesRepo.getActivitiesByDateRange(date, date);
    res.json({ data: activities });
  } catch (error) {
    next(error);
  }
}

export async function getActivitiesByType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = req.params.type;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const activities = activitiesRepo.getActivitiesByType(type, limit);
    res.json({ data: activities });
  } catch (error) {
    next(error);
  }
}

export async function getActivitiesStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const db = getDb();
    const stats = activitiesRepo.getActivityStats();

    // Get today's count
    const today = new Date().toISOString().split('T')[0];
    const todayCount = activitiesRepo.getActivityCountByDate(today);

    // Get this week's count
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];
    const thisWeekActivities = activitiesRepo.getActivitiesByDateRange(thisWeekStartStr, today);

    // Get this month's count
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const thisMonthStartStr = thisMonthStart.toISOString().split('T')[0];
    const thisMonthActivities = activitiesRepo.getActivitiesByDateRange(thisMonthStartStr, today);

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

    // Get last activity
    const allActivities = activitiesRepo.getAllActivities(1);
    const lastActivityAt = allActivities.length > 0 ? allActivities[0].created_at : null;

    // Get heatmap data (last 90 days)
    const heatmapData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const count = activitiesRepo.getActivityCountByDate(dateStr);
      
      heatmapData.push({
        date: dateStr,
        count
      });
    }

    const status = {
      today: todayCount,
      thisWeek: thisWeekActivities.length,
      thisMonth: thisMonthActivities.length,
      byType: stats.byType,
      streak,
      lastActivityAt,
      heatmapData
    };

    res.json({ data: status });
  } catch (error) {
    next(error);
  }
}
