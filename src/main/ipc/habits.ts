import { ipcMain } from 'electron';
import { wrapIpc } from '../utils/response';
import {
  listHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  unlogHabit,
  getHabitLogs,
  getHabitStats
} from '../../database/habitsRepo';

ipcMain.handle(
  'habits:list',
  wrapIpc(() => {
    return listHabits();
  })
);

ipcMain.handle(
  'habits:get',
  wrapIpc((_event, args: { id: number }) => {
    return getHabit(args.id);
  })
);

ipcMain.handle(
  'habits:create',
  wrapIpc((_event, args: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    category?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    targetCount?: number;
  }) => {
    // Provide defaults to match schema requirements
    return createHabit({
      name: args.name,
      description: args.description,
      icon: args.icon,
      color: args.color,
      category: args.category,
      frequency: args.frequency || 'daily',
      targetCount: args.targetCount || 1
    });
  })
);

ipcMain.handle(
  'habits:update',
  wrapIpc((_event, args: { id: number; payload: any }) => {
    return updateHabit(args);
  })
);

ipcMain.handle(
  'habits:delete',
  wrapIpc((_event, args: { id: number }) => {
    deleteHabit(args.id);
    return { success: true };
  })
);

ipcMain.handle(
  'habits:log',
  wrapIpc((_event, args: { habitId: number; loggedDate: string; count?: number; note?: string }) => {
    return logHabit({
      habitId: args.habitId,
      loggedDate: args.loggedDate,
      count: args.count || 1,
      note: args.note
    });
  })
);

ipcMain.handle(
  'habits:unlog',
  wrapIpc((_event, args: { habitId: number; loggedDate: string }) => {
    unlogHabit(args.habitId, args.loggedDate);
    return { success: true };
  })
);

ipcMain.handle(
  'habits:getLogs',
  wrapIpc((_event, args: { habitId: number; limit?: number }) => {
    return getHabitLogs(args.habitId, args.limit);
  })
);

ipcMain.handle(
  'habits:getStats',
  wrapIpc(() => {
    return getHabitStats();
  })
);
