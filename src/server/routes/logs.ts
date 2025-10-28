import { Router } from 'express';
import * as serverLogsRepo from '../../database/serverLogsRepo';

export const logsRouter = Router();

logsRouter.get('/', (req: any, res: any) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const level = req.query.level;
    const since = req.query.since;

    const logs = serverLogsRepo.getServerLogs({
      limit,
      offset,
      level,
      since
    });

    res.json({
      ok: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to get logs'
    });
  }
});

logsRouter.get('/stats', (req: any, res: any) => {
  try {
    const stats = serverLogsRepo.getLogStats();
    res.json({
      ok: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to get log stats'
    });
  }
});

logsRouter.delete('/old', (req: any, res: any) => {
  try {
    const daysOld = parseInt(req.query.daysOld) || 7;
    const deleted = serverLogsRepo.clearOldLogs(daysOld);
    res.json({
      ok: true,
      data: { deleted }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to clear old logs'
    });
  }
});
