import { create } from 'zustand';

export type ActivityEntry = {
  id: number;
  type: string;
  message: string;
  created_at: string;
};

interface ActivityState {
  entries: ActivityEntry[];
  isLoaded: boolean;
  loadActivities: () => Promise<void>;
  pushActivity: (type: string, message: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  entries: [],
  isLoaded: false,
  
  async loadActivities() {
    try {
      const response = await window.api.activities.getAll(500);
      if (response.ok && response.data) {
        set({ 
          entries: response.data.map(a => ({
            id: a.id,
            type: a.type,
            message: a.message,
            created_at: a.created_at
          })),
          isLoaded: true 
        });
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  },
  
  async pushActivity(type: string, message: string) {
    try {
      const response = await window.api.activities.create({ type, message });
      if (response.ok && response.data) {
        const newActivity: ActivityEntry = {
          id: response.data.id,
          type: response.data.type,
          message: response.data.message,
          created_at: response.data.created_at
        };
        set((s) => ({ entries: [newActivity, ...s.entries] }));
      }
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  },
  
  async clear() {
    try {
      await window.api.activities.clear();
      set({ entries: [] });
    } catch (error) {
      console.error('Failed to clear activities:', error);
    }
  }
}));

export default useActivityStore;
