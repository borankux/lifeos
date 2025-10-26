import { ipcMain } from 'electron';
import { wrapIpc } from '../utils/response';
import { getDb } from '../../database/init';
import {
  computeAliveness,
  computeDailyAliveness,
  computeEfficiency,
  loadConfig,
  saveConfig,
  recomputeKa,
  type MetricsConfig
} from '../../services/scoring';
import {
  createEvent,
  getEvents,
  getEventsByDate,
  type CreateEventInput
} from '../../database/eventsRepo';

/**
 * Get current metrics (A & E scores)
 */
ipcMain.handle(
  'metrics:current',
  wrapIpc((_event, args?: { userId?: string }) => {
    const db = getDb();
    const userId = args?.userId || 'default';
    const now = new Date();
    const config = loadConfig(db, userId);

    const aliveness = computeAliveness(userId, now, db, config);
    const efficiency = computeEfficiency(userId, now, db, config);

    return {
      A: aliveness.A,
      E: efficiency.E,
      aliveness,
      efficiency,
      last_updated: now.toISOString()
    };
  })
);

/**
 * Get daily metrics for a specific date
 */
ipcMain.handle(
  'metrics:daily',
  wrapIpc((_event, args: { date: string; userId?: string }) => {
    const db = getDb();
    const userId = args.userId || 'default';
    const config = loadConfig(db, userId);

    const events = getEventsByDate(userId, args.date);
    const aliveness = computeDailyAliveness(userId, args.date, db, config);

    return {
      date: args.date,
      A_day: aliveness.A,
      events: events.map(e => ({
        id: e.id,
        type: e.type,
        ts: e.ts,
        meta: e.meta ? JSON.parse(e.meta) : null,
        weight: e.weight
      })),
      alive_breakdown: aliveness.breakdown
    };
  })
);

/**
 * Create a new event
 */
ipcMain.handle(
  'metrics:createEvent',
  wrapIpc((_event, args: CreateEventInput) => {
    const event = createEvent(args);
    
    return {
      id: event.id,
      type: event.type,
      ts: event.ts,
      meta: event.meta ? JSON.parse(event.meta) : null,
      weight: event.weight
    };
  })
);

/**
 * Get events
 */
ipcMain.handle(
  'metrics:getEvents',
  wrapIpc((_event, args?: { userId?: string; limit?: number }) => {
    const userId = args?.userId || 'default';
    const limit = args?.limit || 500;
    
    const events = getEvents(userId, limit);
    
    return events.map(e => ({
      id: e.id,
      type: e.type,
      ts: e.ts,
      meta: e.meta ? JSON.parse(e.meta) : null,
      weight: e.weight
    }));
  })
);

/**
 * Get configuration
 */
ipcMain.handle(
  'metrics:getConfig',
  wrapIpc((_event, args?: { userId?: string }) => {
    const db = getDb();
    const userId = args?.userId || 'default';
    return loadConfig(db, userId);
  })
);

/**
 * Update configuration
 */
ipcMain.handle(
  'metrics:updateConfig',
  wrapIpc((_event, args: { config: Partial<MetricsConfig>; userId?: string }) => {
    const db = getDb();
    const userId = args.userId || 'default';
    saveConfig(db, userId, args.config);
    return loadConfig(db, userId);
  })
);

/**
 * Recompute baselines (K_a, T_target from last 30 days)
 */
ipcMain.handle(
  'metrics:recomputeBaselines',
  wrapIpc((_event, args?: { userId?: string }) => {
    const db = getDb();
    const userId = args?.userId || 'default';
    const newKa = recomputeKa(db, userId);
    
    return {
      k_a: newKa,
      message: 'Baselines recomputed successfully'
    };
  })
);
