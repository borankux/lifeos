import { create } from 'zustand';
import type { Project } from '../common/types';
import { useTasksStore } from './tasks';
import { useActivityStore } from './activity';

interface ProjectsState {
  projects: Project[];
  activeProjectId?: number;
  loading: boolean;
  error?: string;
  loadProjects: () => Promise<void>;
  setActiveProject: (id: number) => Promise<void>;
  createProject: (name: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  activeProjectId: undefined,
  loading: false,
  error: undefined,
  async loadProjects() {
    set({ loading: true, error: undefined });
    try {
      const response = await window.api.projects.list();
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to load projects');
      }
      const { projects, activeProjectId } = response.data;
      set({ projects, activeProjectId, loading: false });
      if (activeProjectId) {
        await useTasksStore.getState().loadTasks(activeProjectId);
      }
    } catch (error) {
      console.error(error);
      set({ loading: false, error: error instanceof Error ? error.message : String(error) });
    }
  },
  async setActiveProject(id) {
    const previous = get().activeProjectId;
    set({ activeProjectId: id });
    try {
      const response = await window.api.projects.setActive(id);
      if (!response.ok) {
        throw new Error(response.error ?? 'Failed to set active project');
      }
      await useTasksStore.getState().loadTasks(id);
    } catch (error) {
      console.error(error);
      set({ activeProjectId: previous, error: error instanceof Error ? error.message : String(error) });
    }
  },
  async createProject(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const existing = get().projects;
    try {
      const response = await window.api.projects.create({ name: trimmed });
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to create project');
      }
      const project = response.data;
      const projects = [...existing, project].sort((a, b) => a.position - b.position);
      set({ projects, activeProjectId: project.id });
      await window.api.projects.setActive(project.id);
      await useTasksStore.getState().loadTasks(project.id);
      
      // Log activity
      useActivityStore.getState().pushActivity('project', `Created project: ${trimmed}`);
    } catch (error) {
      console.error(error);
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  }
}));

export const useProjects = () => useProjectsStore((state) => ({
  projects: state.projects,
  activeProjectId: state.activeProjectId,
  loading: state.loading,
  error: state.error,
  loadProjects: state.loadProjects,
  setActiveProject: state.setActiveProject,
  createProject: state.createProject
}));
