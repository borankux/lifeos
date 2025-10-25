import { contextBridge, ipcRenderer } from 'electron';
import type {
  ApiResponse,
  Project,
  ProjectsListResult,
  Task,
  CreateProjectInput,
  UpdateProjectPayload,
  CreateTaskInput,
  UpdateTaskPayload
} from '../common/types';

const api = {
  projects: {
    list: () => ipcRenderer.invoke('projects:list') as Promise<ApiResponse<ProjectsListResult>>,
    create: (payload: CreateProjectInput) =>
      ipcRenderer.invoke('projects:create', payload) as Promise<ApiResponse<Project>>,
    update: (id: number, payload: UpdateProjectPayload) =>
      ipcRenderer.invoke('projects:update', { id, payload }) as Promise<ApiResponse<Project>>,
    setActive: (id: number) =>
      ipcRenderer.invoke('projects:set-active', { id }) as Promise<ApiResponse<{ id: number }>>
  },
  tasks: {
    listByProject: (projectId: number) =>
      ipcRenderer.invoke('tasks:list-by-project', { projectId }) as Promise<ApiResponse<Task[]>>,
    create: (payload: CreateTaskInput) =>
      ipcRenderer.invoke('tasks:create', payload) as Promise<ApiResponse<Task>>,
    update: (id: number, payload: UpdateTaskPayload) =>
      ipcRenderer.invoke('tasks:update', { id, payload }) as Promise<ApiResponse<Task>>,
    move: (payload: { id: number; projectId: number; status: string; position: number }) =>
      ipcRenderer.invoke('tasks:move', payload) as Promise<ApiResponse<Task>>
  }
};

contextBridge.exposeInMainWorld('api', api);

export type PreloadApi = typeof api;

declare global {
  interface Window {
    api: PreloadApi;
  }
}
