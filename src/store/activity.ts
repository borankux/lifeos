import { create } from 'zustand';

export type ActivityEntry = {
  id: string;
  type: 'project' | 'task' | 'system';
  message: string;
  timestamp: string;
};

interface ActivityState {
  entries: ActivityEntry[];
  push: (e: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
  clear: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  entries: [],
  push(e) {
    const entry: ActivityEntry = {
      id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
      ...e
    };
    set((s) => ({ entries: [entry, ...s.entries].slice(0, 200) }));
  },
  clear() {
    set({ entries: [] });
  }
}));

export default useActivityStore;
