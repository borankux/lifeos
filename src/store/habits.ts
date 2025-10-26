import { create } from 'zustand';
import type { Habit, HabitWithStats, HabitLog } from '../database/habitsRepo';

interface HabitsState {
  habits: HabitWithStats[];
  selectedHabitId?: number;
  habitLogs: Map<number, HabitLog[]>;
  loading: boolean;
  error?: string;
  loadHabits: () => Promise<void>;
  createHabit: (input: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    category?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    targetCount?: number;
  }) => Promise<void>;
  updateHabit: (id: number, payload: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
  logHabit: (habitId: number, loggedDate: string, count?: number, note?: string) => Promise<void>;
  unlogHabit: (habitId: number, loggedDate: string) => Promise<void>;
  loadHabitLogs: (habitId: number) => Promise<void>;
  setSelectedHabit: (id?: number) => void;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  selectedHabitId: undefined,
  habitLogs: new Map(),
  loading: false,
  error: undefined,

  async loadHabits() {
    set({ loading: true, error: undefined });
    try {
      const response = await window.api.habits.list();
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to load habits');
      }
      set({ habits: response.data, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false, error: error instanceof Error ? error.message : String(error) });
    }
  },

  async createHabit(input) {
    try {
      const response = await window.api.habits.create(input);
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to create habit');
      }
      await get().loadHabits();
    } catch (error) {
      console.error(error);
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  async updateHabit(id, payload) {
    try {
      const response = await window.api.habits.update({ id, payload });
      if (!response.ok) {
        throw new Error(response.error ?? 'Failed to update habit');
      }
      await get().loadHabits();
    } catch (error) {
      console.error(error);
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  async deleteHabit(id) {
    try {
      const response = await window.api.habits.delete(id);
      if (!response.ok) {
        throw new Error(response.error ?? 'Failed to delete habit');
      }
      await get().loadHabits();
      if (get().selectedHabitId === id) {
        set({ selectedHabitId: undefined });
      }
    } catch (error) {
      console.error(error);
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  async logHabit(habitId, loggedDate, count = 1, note) {
    try {
      const response = await window.api.habits.log({ habitId, loggedDate, count, note });
      if (!response.ok) {
        throw new Error(response.error ?? 'Failed to log habit');
      }
      await get().loadHabits();
      if (get().selectedHabitId === habitId) {
        await get().loadHabitLogs(habitId);
      }
    } catch (error) {
      console.error(error);
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  async unlogHabit(habitId, loggedDate) {
    try {
      const response = await window.api.habits.unlog({ habitId, loggedDate });
      if (!response.ok) {
        throw new Error(response.error ?? 'Failed to unlog habit');
      }
      await get().loadHabits();
      if (get().selectedHabitId === habitId) {
        await get().loadHabitLogs(habitId);
      }
    } catch (error) {
      console.error(error);
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  async loadHabitLogs(habitId) {
    try {
      const response = await window.api.habits.getLogs(habitId);
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to load habit logs');
      }
      const logs = new Map(get().habitLogs);
      logs.set(habitId, response.data);
      set({ habitLogs: logs });
    } catch (error) {
      console.error(error);
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  setSelectedHabit(id) {
    set({ selectedHabitId: id });
    if (id !== undefined) {
      get().loadHabitLogs(id);
    }
  },
}));

export const useHabits = () => useHabitsStore((state) => ({
  habits: state.habits,
  selectedHabitId: state.selectedHabitId,
  habitLogs: state.habitLogs,
  loading: state.loading,
  error: state.error,
  loadHabits: state.loadHabits,
  createHabit: state.createHabit,
  updateHabit: state.updateHabit,
  deleteHabit: state.deleteHabit,
  logHabit: state.logHabit,
  unlogHabit: state.unlogHabit,
  loadHabitLogs: state.loadHabitLogs,
  setSelectedHabit: state.setSelectedHabit,
}));
