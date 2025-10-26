import { Database } from 'better-sqlite3';
import { BASE_WEIGHTS, EVENT_TYPES } from '../database/metricsSchema';

/**
 * Production-grade Efficiency (E) and Aliveness (A) scoring engine
 * 
 * Implements exponential decay, normalization, and robust scoring
 * resistant to spammy micro-events and context switching penalties.
 */

// ==================== TYPES ====================

export interface MetricsConfig {
  k_a: number;           // Aliveness normalization constant
  t_target: number;      // Target throughput (tasks/day)
  ct_target_days: number; // Target cycle time (days)
  wip_limit: number;     // WIP limit
  h_a_days: number;      // Aliveness half-life (days)
  h_e_days: number;      // Efficiency half-life (days)
  window_days: number;   // Efficiency window (days)
}

export interface Event {
  id: number;
  user_id: string;
  ts: string;
  type: string;
  meta: any;
  weight: number;
}

export interface AlivenessResult {
  A: number;
  alive_points: number;
  breakdown: {
    total_events: number;
    weighted_points: number;
    decay_applied: boolean;
  };
}

export interface EfficiencyComponents {
  TP_norm: number;
  OTR: number;
  CT_norm: number;
  WIP_norm: number;
}

export interface EfficiencyResult {
  E: number;
  components: EfficiencyComponents;
  debug: {
    throughput: number;
    on_time_rate: number;
    cycle_time_median: number;
    wip_avg: number;
  };
}

// ==================== HELPERS ====================

/**
 * Calculate text factor for content events
 * text_factor = min(3, sqrt(words / 120))
 */
export function textFactor(words: number = 0): number {
  if (words === 0) return 1.0;
  return Math.min(3.0, Math.sqrt(words / 120));
}

/**
 * Exponential decay function
 * decay(ts) = 0.5 ^ (age_days / half_life)
 */
export function decay(ts: string, now: Date, halfLifeDays: number): number {
  const eventDate = new Date(ts);
  const ageDays = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, ageDays / halfLifeDays);
}

/**
 * Clamp value to [0, 1]
 */
export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * Calculate weighted median
 */
export function weightedMedian(values: number[], weights: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];

  // Sort by value
  const combined = values.map((v, i) => ({ value: v, weight: weights[i] }))
    .sort((a, b) => a.value - b.value);

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let cumWeight = 0;
  const halfWeight = totalWeight / 2;

  for (const item of combined) {
    cumWeight += item.weight;
    if (cumWeight >= halfWeight) {
      return item.value;
    }
  }

  return combined[combined.length - 1].value;
}

/**
 * Calculate event weight with text factor, focus bonus, and context switch tax
 */
export function calculateEventWeight(
  event: Event,
  events: Event[],
  index: number
): number {
  const baseWeight = BASE_WEIGHTS[event.type] || 1.0;
  let weight = baseWeight;

  // Apply text factor for content events
  if (event.type === EVENT_TYPES.DIARY_SAVED || event.type === EVENT_TYPES.QA_ANSWERED) {
    const words = event.meta?.words || 0;
    weight *= textFactor(words);
  }

  // Context switching tax (simplified - check module diversity in 90min window)
  const modules = getModulesIn90MinWindow(events, index);
  if (modules.size > 3) {
    weight *= 0.90;
  }

  // Focus bonus (≥45min continuous in same module/task)
  if (hasFocusBonus(events, index)) {
    weight *= 1.15;
  }

  return weight;
}

/**
 * Get unique modules touched in 90-minute window before event
 */
function getModulesIn90MinWindow(events: Event[], currentIndex: number): Set<string> {
  const modules = new Set<string>();
  const currentEvent = events[currentIndex];
  const currentTime = new Date(currentEvent.ts).getTime();
  const windowMs = 90 * 60 * 1000; // 90 minutes

  for (let i = currentIndex; i >= 0; i--) {
    const event = events[i];
    const eventTime = new Date(event.ts).getTime();
    
    if (currentTime - eventTime > windowMs) break;
    
    // Extract module from event type
    const module = event.type.split('_')[0]; // task, habit, diary, qa
    modules.add(module);
  }

  return modules;
}

/**
 * Check if event gets focus bonus (≥45min continuous activity)
 */
function hasFocusBonus(events: Event[], currentIndex: number): boolean {
  const currentEvent = events[currentIndex];
  const currentTime = new Date(currentEvent.ts).getTime();
  const focusWindowMs = 45 * 60 * 1000; // 45 minutes
  const currentModule = currentEvent.type.split('_')[0];
  const currentTaskId = currentEvent.meta?.task_id;

  let startTime = currentTime;
  
  for (let i = currentIndex - 1; i >= 0; i--) {
    const event = events[i];
    const eventTime = new Date(event.ts).getTime();
    
    // If gap > 10 minutes, break
    if (startTime - eventTime > 10 * 60 * 1000) break;
    
    const module = event.type.split('_')[0];
    const taskId = event.meta?.task_id;
    
    // Check if same module/task
    if (module === currentModule && (!currentTaskId || taskId === currentTaskId)) {
      startTime = eventTime;
    } else {
      break;
    }
  }

  return (currentTime - startTime) >= focusWindowMs;
}

// ==================== ALIVENESS (A) ====================

/**
 * Compute Aliveness score
 * A = round(100 * (1 - exp(-alive_points / K_a)))
 */
export function computeAliveness(
  userId: string,
  now: Date,
  db: Database,
  config: MetricsConfig
): AlivenessResult {
  // Get all events
  const rows = db.prepare(`
    SELECT * FROM events 
    WHERE user_id = ? 
    ORDER BY ts DESC
  `).all(userId) as Event[];

  let alivePoints = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const event = rows[i];
    const weight = calculateEventWeight(event, rows, i);
    const decayFactor = decay(event.ts, now, config.h_a_days);
    alivePoints += weight * decayFactor;
  }

  // Normalize with soft-cap
  const A = Math.round(100 * (1 - Math.exp(-alivePoints / config.k_a)));

  return {
    A: Math.max(0, Math.min(100, A)),
    alive_points: alivePoints,
    breakdown: {
      total_events: rows.length,
      weighted_points: alivePoints,
      decay_applied: true
    }
  };
}

/**
 * Compute daily aliveness (no decay, single day)
 */
export function computeDailyAliveness(
  userId: string,
  date: string, // YYYY-MM-DD
  db: Database,
  config: MetricsConfig
): AlivenessResult {
  const rows = db.prepare(`
    SELECT * FROM events 
    WHERE user_id = ? AND DATE(ts) = ?
    ORDER BY ts DESC
  `).all(userId, date) as Event[];

  let alivePoints = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const event = rows[i];
    const weight = calculateEventWeight(event, rows, i);
    alivePoints += weight; // No decay for daily
  }

  // Normalize
  const A_day = Math.round(100 * (1 - Math.exp(-alivePoints / config.k_a)));

  return {
    A: Math.max(0, Math.min(100, A_day)),
    alive_points: alivePoints,
    breakdown: {
      total_events: rows.length,
      weighted_points: alivePoints,
      decay_applied: false
    }
  };
}

// ==================== EFFICIENCY (E) ====================

interface CompletedTask {
  task_id: number;
  started_at: string;
  completed_at: string;
  due_at?: string;
  cycle_time_days: number;
}

/**
 * Compute Efficiency score
 * E = 0.30*TP_norm + 0.30*OTR + 0.30*CT_norm + 0.10*WIP_norm
 */
export function computeEfficiency(
  userId: string,
  now: Date,
  db: Database,
  config: MetricsConfig
): EfficiencyResult {
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - config.window_days);
  const windowStartStr = windowStart.toISOString();

  // Get completed tasks in window
  const completedTasks = getCompletedTasksInWindow(db, userId, windowStartStr, now.toISOString());

  // 1. Throughput
  const TP = calculateThroughput(completedTasks, now, config);
  const TP_norm = clamp01(TP / config.t_target);

  // 2. On-time rate
  const OTR = calculateOnTimeRate(completedTasks, now, config);

  // 3. Cycle time performance
  const CT_norm = calculateCycleTimeNorm(completedTasks, now, config);

  // 4. WIP health
  const WIP_norm = calculateWIPNorm(db, userId, windowStartStr, now.toISOString(), config);

  // Combine
  const E_raw = 0.30 * TP_norm + 0.30 * OTR + 0.30 * CT_norm + 0.10 * WIP_norm;
  const E = Math.round(100 * E_raw);

  return {
    E: Math.max(0, Math.min(100, E)),
    components: {
      TP_norm,
      OTR,
      CT_norm,
      WIP_norm
    },
    debug: {
      throughput: TP,
      on_time_rate: OTR,
      cycle_time_median: weightedMedian(
        completedTasks.map(t => t.cycle_time_days),
        completedTasks.map(t => decay(t.completed_at, now, config.h_e_days))
      ),
      wip_avg: calculateWIPAvg(db, userId, windowStartStr, now.toISOString())
    }
  };
}

function getCompletedTasksInWindow(
  db: Database,
  userId: string,
  windowStart: string,
  windowEnd: string
): CompletedTask[] {
  const rows = db.prepare(`
    SELECT 
      t.id as task_id,
      t.due_date,
      t.updated_at as completed_at,
      MIN(ts.ts) as started_at
    FROM tasks t
    LEFT JOIN task_states ts ON ts.task_id = t.id AND ts.to_status IN ('In Progress', 'To-Do')
    WHERE t.status = 'Completed'
      AND t.updated_at >= ? AND t.updated_at <= ?
    GROUP BY t.id
  `).all(windowStart, windowEnd) as any[];

  return rows.map(row => {
    const startedAt = row.started_at || row.completed_at;
    const completedAt = row.completed_at;
    const cycleTime = (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24);

    return {
      task_id: row.task_id,
      started_at: startedAt,
      completed_at: completedAt,
      due_at: row.due_date,
      cycle_time_days: cycleTime
    };
  });
}

function calculateThroughput(tasks: CompletedTask[], now: Date, config: MetricsConfig): number {
  if (tasks.length === 0) return 0;

  let weightedSum = 0;
  for (const task of tasks) {
    const decayFactor = decay(task.completed_at, now, config.h_e_days);
    weightedSum += decayFactor;
  }

  return weightedSum / config.window_days;
}

function calculateOnTimeRate(tasks: CompletedTask[], now: Date, config: MetricsConfig): number {
  if (tasks.length === 0) return 1.0; // No tasks = perfect score

  let weightedOnTime = 0;
  let weightedTotal = 0;

  for (const task of tasks) {
    const decayFactor = decay(task.completed_at, now, config.h_e_days);
    const onTime = !task.due_at || new Date(task.completed_at) <= new Date(task.due_at) ? 1 : 0;
    
    weightedOnTime += decayFactor * onTime;
    weightedTotal += decayFactor;
  }

  return weightedTotal > 0 ? weightedOnTime / weightedTotal : 1.0;
}

function calculateCycleTimeNorm(tasks: CompletedTask[], now: Date, config: MetricsConfig): number {
  if (tasks.length === 0) return 1.0;

  const cycleTimes = tasks.map(t => t.cycle_time_days);
  const weights = tasks.map(t => decay(t.completed_at, now, config.h_e_days));
  const CT_med = weightedMedian(cycleTimes, weights);

  return clamp01(1.3 - CT_med / config.ct_target_days);
}

function calculateWIPNorm(
  db: Database,
  userId: string,
  windowStart: string,
  windowEnd: string,
  config: MetricsConfig
): number {
  const wipAvg = calculateWIPAvg(db, userId, windowStart, windowEnd);
  
  if (wipAvg <= config.wip_limit) return 1.0;
  
  const excess = wipAvg - config.wip_limit;
  return clamp01(1 - excess / config.wip_limit);
}

function calculateWIPAvg(
  db: Database,
  userId: string,
  windowStart: string,
  windowEnd: string
): number {
  // Approximate WIP via daily snapshots
  const days = db.prepare(`
    SELECT DATE(ts) as date, COUNT(DISTINCT task_id) as wip_count
    FROM task_states
    WHERE ts >= ? AND ts <= ?
      AND to_status = 'In Progress'
    GROUP BY DATE(ts)
  `).all(windowStart, windowEnd) as any[];

  if (days.length === 0) return 0;

  const totalWIP = days.reduce((sum: number, day: any) => sum + day.wip_count, 0);
  return totalWIP / days.length;
}

// ==================== CONFIG MANAGEMENT ====================

export function loadConfig(db: Database, userId: string = 'default'): MetricsConfig {
  const row = db.prepare(`
    SELECT * FROM metrics_config WHERE user_id = ?
  `).get(userId) as any;

  if (!row) {
    return {
      k_a: 50.0,
      t_target: 1.0,
      ct_target_days: 2.0,
      wip_limit: 3,
      h_a_days: 7.0,
      h_e_days: 14.0,
      window_days: 14
    };
  }

  return {
    k_a: row.k_a,
    t_target: row.t_target,
    ct_target_days: row.ct_target_days,
    wip_limit: row.wip_limit,
    h_a_days: row.h_a_days,
    h_e_days: row.h_e_days,
    window_days: row.window_days
  };
}

export function saveConfig(db: Database, userId: string, config: Partial<MetricsConfig>): void {
  db.prepare(`
    UPDATE metrics_config 
    SET k_a = COALESCE(?, k_a),
        t_target = COALESCE(?, t_target),
        ct_target_days = COALESCE(?, ct_target_days),
        wip_limit = COALESCE(?, wip_limit),
        h_a_days = COALESCE(?, h_a_days),
        h_e_days = COALESCE(?, h_e_days),
        window_days = COALESCE(?, window_days),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(
    config.k_a ?? null,
    config.t_target ?? null,
    config.ct_target_days ?? null,
    config.wip_limit ?? null,
    config.h_a_days ?? null,
    config.h_e_days ?? null,
    config.window_days ?? null,
    userId
  );
}

/**
 * Recompute K_a baseline from last 30 days
 */
export function recomputeKa(db: Database, userId: string = 'default'): number {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyPoints: number[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const result = computeDailyAliveness(userId, dateStr, db, loadConfig(db, userId));
    dailyPoints.push(result.alive_points);
  }

  // Median of daily points * 7
  dailyPoints.sort((a, b) => a - b);
  const median = dailyPoints[Math.floor(dailyPoints.length / 2)] || 10;
  const newKa = median * 7;

  saveConfig(db, userId, { k_a: newKa });
  return newKa;
}
