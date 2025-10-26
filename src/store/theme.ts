import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isLoaded: boolean;
  loadTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  isLoaded: false,
  
  async loadTheme() {
    try {
      const response = await window.api.settings.get();
      if (response.ok && response.data) {
        const theme = response.data.theme || 'dark';
        set({ theme, isLoaded: true });
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      set({ theme: 'dark', isLoaded: true });
      applyTheme('dark');
    }
  },
  
  async setTheme(theme: Theme) {
    try {
      const response = await window.api.settings.update({ theme });
      if (response.ok) {
        set({ theme });
        applyTheme(theme);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },
  
  async toggleTheme() {
    const current = get().theme;
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    await get().setTheme(next);
  }
}));

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  if (theme === 'light') {
    // Softer light mode - easier on the eyes
    root.style.setProperty('--bg-primary', '#f5f5f5');
    root.style.setProperty('--bg-secondary', '#e8e8e8');
    root.style.setProperty('--bg-tertiary', '#d0d0d0');
    root.style.setProperty('--text-primary', '#1a1a1a');
    root.style.setProperty('--text-secondary', '#4a4a4a');
    root.style.setProperty('--text-tertiary', '#6a6a6a');
    root.style.setProperty('--border-color', 'rgba(0,0,0,0.15)');
    root.style.setProperty('--card-bg', 'rgba(255,255,255,0.8)');
    root.style.setProperty('--card-border', 'rgba(0,0,0,0.12)');
    root.style.setProperty('--hover-bg', 'rgba(0,0,0,0.05)');
    
    // Apply to body - softer background
    document.body.style.background = '#f5f5f5';
    document.body.style.color = '#1a1a1a';
  } else {
    root.style.setProperty('--bg-primary', '#121212');
    root.style.setProperty('--bg-secondary', '#1e1e1e');
    root.style.setProperty('--bg-tertiary', '#2a2a2a');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#e0e0e0');
    root.style.setProperty('--text-tertiary', '#b0b0b0');
    root.style.setProperty('--border-color', 'rgba(255,255,255,0.12)');
    root.style.setProperty('--card-bg', 'rgba(255,255,255,0.04)');
    root.style.setProperty('--card-border', 'rgba(255,255,255,0.08)');
    root.style.setProperty('--hover-bg', 'rgba(255,255,255,0.06)');
    
    // Apply to body
    document.body.style.background = '#121212';
    document.body.style.color = '#ffffff';
  }
}

export default useThemeStore;
