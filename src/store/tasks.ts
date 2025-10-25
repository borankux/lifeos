import { create } from 'zustand';
import type { Task, CreateTaskInput, UpdateTaskPayload } from '../common/types';

interface TasksState {
  tasksByProject: Record<number, Task[]>;
  loading: Record<number, boolean>;
  error?: string;
  loadTasks: (projectId: number) => Promise<void>;
  createTask: (payload: CreateTaskInput) => Promise<void>;
  updateTask: (id: number, payload: UpdateTaskPayload) => Promise<void>;
  moveTask: (args: { id: number; projectId: number; status: string; position: number }) => Promise<void>;
}

function withTasks(state: TasksState, projectId: number, tasks: Task[]): TasksState {
  return {
    ...state,
    error: undefined,
    tasksByProject: {
      ...state.tasksByProject,
      [projectId]: tasks
    }
  };
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.status === b.status) {
      return a.position - b.position;
    }
    return a.status.localeCompare(b.status);
  });
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasksByProject: {},
  loading: {},
  error: undefined,
  async loadTasks(projectId) {
    set((state) => ({ loading: { ...state.loading, [projectId]: true }, error: undefined }));
    try {
      const response = await window.api.tasks.listByProject(projectId);
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to load tasks');
      }
      set((state) => ({
        ...state,
        tasksByProject: { ...state.tasksByProject, [projectId]: sortTasks(response.data) },
        loading: { ...state.loading, [projectId]: false }
      }));
    } catch (error) {
      console.error(error);
      set((state) => ({
        ...state,
        loading: { ...state.loading, [projectId]: false },
        error: error instanceof Error ? error.message : String(error)
      }));
    }
  },
  async createTask(payload) {
    try {
      const response = await window.api.tasks.create(payload);
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to create task');
      }
      set((state) => {
        const tasks = state.tasksByProject[payload.projectId] ?? [];
        return withTasks(state, payload.projectId, sortTasks([...tasks, response.data]));
      });
    } catch (error) {
      console.error(error);
      set((state) => ({ ...state, error: error instanceof Error ? error.message : String(error) }));
      throw error;
    }
  },
  async updateTask(id, payload) {
    try {
      const response = await window.api.tasks.update(id, payload);
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to update task');
      }
      const updated = response.data;
      set((state) => {
        const tasks = state.tasksByProject[updated.projectId] ?? [];
        const next = tasks.map((task) => (task.id === updated.id ? updated : task));
        return withTasks(state, updated.projectId, sortTasks(next));
      });
    } catch (error) {
      console.error(error);
      set((state) => ({ ...state, error: error instanceof Error ? error.message : String(error) }));
      throw error;
    }
  },
  async moveTask(args) {
    try {
      const response = await window.api.tasks.move(args);
      if (!response.ok || !response.data) {
        throw new Error(response.error ?? 'Failed to move task');
      }
      const moved = response.data;
      set((state) => {
        const current = state.tasksByProject[args.projectId] ?? [];
        const filtered = current.filter((task) => task.id !== moved.id);
        return withTasks(state, args.projectId, sortTasks([...filtered, moved]));
      });
    } catch (error) {
      console.error(error);
      set((state) => ({ ...state, error: error instanceof Error ? error.message : String(error) }));
      throw error;
    }
  }
}));

export const useTasks = (projectId?: number) =>
  useTasksStore((state) => ({
    tasks: projectId ? state.tasksByProject[projectId] ?? [] : [],
    loading: projectId ? state.loading[projectId] ?? false : false,
    error: state.error,
    loadTasks: state.loadTasks,
    createTask: state.createTask,
    updateTask: state.updateTask,
    moveTask: state.moveTask
  }));
