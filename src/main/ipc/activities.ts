import { ipcMain } from 'electron';
import * as activitiesRepo from '../../database/activitiesRepo';
import { success, failure } from '../utils/response';

export function registerActivitiesHandlers() {
  ipcMain.handle('activities:create', async (_event, input: activitiesRepo.CreateActivityInput) => {
    try {
      const activity = activitiesRepo.createActivity(input);
      return success(activity);
    } catch (err) {
      return failure((err as Error).message);
    }
  });

  ipcMain.handle('activities:getAll', async (_event, limit?: number) => {
    try {
      const activities = activitiesRepo.getAllActivities(limit);
      return success(activities);
    } catch (err) {
      return failure((err as Error).message);
    }
  });

  ipcMain.handle('activities:getByDateRange', async (_event, startDate: string, endDate: string) => {
    try {
      const activities = activitiesRepo.getActivitiesByDateRange(startDate, endDate);
      return success(activities);
    } catch (err) {
      return failure((err as Error).message);
    }
  });

  ipcMain.handle('activities:getByType', async (_event, type: string, limit?: number) => {
    try {
      const activities = activitiesRepo.getActivitiesByType(type, limit);
      return success(activities);
    } catch (err) {
      return failure((err as Error).message);
    }
  });

  ipcMain.handle('activities:getStats', async () => {
    try {
      const stats = activitiesRepo.getActivityStats();
      return success(stats);
    } catch (err) {
      return failure((err as Error).message);
    }
  });

  ipcMain.handle('activities:delete', async (_event, id: number) => {
    try {
      const deleted = activitiesRepo.deleteActivity(id);
      return success(deleted);
    } catch (err) {
      return failure((err as Error).message);
    }
  });

  ipcMain.handle('activities:clear', async () => {
    try {
      const count = activitiesRepo.clearAllActivities();
      return success(count);
    } catch (err) {
      return failure((err as Error).message);
    }
  });
}

// Register handlers immediately when module is loaded
registerActivitiesHandlers();
