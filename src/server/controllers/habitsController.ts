import { Request, Response, NextFunction } from 'express';
import * as habitsRepo from '../../database/habitsRepo';

export async function createHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const habit = habitsRepo.createHabit(req.body);
    res.status(201).json({ data: habit });
  } catch (error) {
    next(error);
  }
}

export async function getHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const habit = habitsRepo.getHabit(id);
    
    if (!habit) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Habit not found'
        }
      });
    }

    res.json({ data: habit });
  } catch (error) {
    next(error);
  }
}

export async function listHabits(req: Request, res: Response, next: NextFunction) {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const habits = habitsRepo.listHabits({ includeArchived });
    res.json({ data: habits });
  } catch (error) {
    next(error);
  }
}

export async function updateHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const habit = habitsRepo.updateHabit({
      id,
      payload: req.body
    });
    res.json({ data: habit });
  } catch (error) {
    next(error);
  }
}

export async function deleteHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    habitsRepo.deleteHabit(id);
    res.json({ data: { success: true, id } });
  } catch (error) {
    next(error);
  }
}

export async function logHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = parseInt(req.params.id, 10);
    const log = habitsRepo.logHabit({
      habitId,
      ...req.body
    });
    res.status(201).json({ data: log });
  } catch (error) {
    next(error);
  }
}

export async function unlogHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = parseInt(req.params.id, 10);
    const loggedDate = req.params.date;
    habitsRepo.unlogHabit(habitId, loggedDate);
    res.json({ data: { success: true, habitId, loggedDate } });
  } catch (error) {
    next(error);
  }
}

export async function getHabitLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const habitId = parseInt(req.params.id, 10);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const logs = habitsRepo.getHabitLogs(habitId, limit);
    res.json({ data: logs });
  } catch (error) {
    next(error);
  }
}

export async function getHabitsStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = habitsRepo.getHabitStats();
    const habits = habitsRepo.listHabits();
    
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
    
    const habitsData = habits.map(h => ({
      id: h.id,
      name: h.name,
      frequency: h.frequency,
      currentStreak: h.currentStreak,
      completionRate: h.completionRate,
      todayCompleted: h.todayCompleted
    }));

    const status = {
      total: stats.totalHabits,
      active: stats.activeHabits,
      archived: stats.totalHabits - stats.activeHabits,
      completedToday: stats.completedToday,
      avgCompletionRate: stats.avgCompletionRate,
      bestStreak,
      habits: habitsData
    };

    res.json({ data: status });
  } catch (error) {
    next(error);
  }
}
