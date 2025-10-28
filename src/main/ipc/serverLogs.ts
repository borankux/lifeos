import { ipcMain } from 'electron';
import * as serverLogsRepo from '../../database/serverLogsRepo';
import { success, failure } from '../utils/response';

ipcMain.handle('server-logs:get', (_, options?: {
  limit?: number;
  offset?: number;
  level?: string;
  since?: string;
}) => {
  try {
    const logs = serverLogsRepo.getServerLogs(options);
    return success(logs);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Failed to get server logs');
  }
});

ipcMain.handle('server-logs:get-stats', () => {
  try {
    const stats = serverLogsRepo.getLogStats();
    return success(stats);
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Failed to get log stats');
  }
});

ipcMain.handle('server-logs:clear-old', (_, daysOld?: number) => {
  try {
    const deleted = serverLogsRepo.clearOldLogs(daysOld || 7);
    return success({ deleted });
  } catch (error) {
    return failure(error instanceof Error ? error.message : 'Failed to clear old logs');
  }
});
