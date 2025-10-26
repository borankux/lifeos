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
import type { ActivityRow, CreateActivityInput } from '../database/activitiesRepo';
import type { Settings } from '../services/settings';

const api = {
  projects: {
    list: () => ipcRenderer.invoke('projects:list') as Promise<ApiResponse<ProjectsListResult>>,
    create: (payload: CreateProjectInput) =>
      ipcRenderer.invoke('projects:create', payload) as Promise<ApiResponse<Project>>,
    update: (id: number, payload: UpdateProjectPayload) =>
      ipcRenderer.invoke('projects:update', { id, payload }) as Promise<ApiResponse<Project>>,
    setActive: (id: number) =>
      ipcRenderer.invoke('projects:set-active', { id }) as Promise<ApiResponse<{ id: number }>>,
    delete: (id: number) =>
      ipcRenderer.invoke('projects:delete', { id }) as Promise<ApiResponse<{ success: boolean }>>
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
  },
  activities: {
    create: (payload: CreateActivityInput) =>
      ipcRenderer.invoke('activities:create', payload) as Promise<ApiResponse<ActivityRow>>,
    getAll: (limit?: number) =>
      ipcRenderer.invoke('activities:getAll', limit) as Promise<ApiResponse<ActivityRow[]>>,
    getByDateRange: (startDate: string, endDate: string) =>
      ipcRenderer.invoke('activities:getByDateRange', startDate, endDate) as Promise<ApiResponse<ActivityRow[]>>,
    getByType: (type: string, limit?: number) =>
      ipcRenderer.invoke('activities:getByType', type, limit) as Promise<ApiResponse<ActivityRow[]>>,
    getStats: () =>
      ipcRenderer.invoke('activities:getStats') as Promise<ApiResponse<{
        total: number;
        byType: Record<string, number>;
        last7Days: number;
        last30Days: number;
      }>>,
    delete: (id: number) =>
      ipcRenderer.invoke('activities:delete', id) as Promise<ApiResponse<boolean>>,
    clear: () =>
      ipcRenderer.invoke('activities:clear') as Promise<ApiResponse<number>>
  },
  settings: {
    get: () =>
      ipcRenderer.invoke('settings:get') as Promise<ApiResponse<Settings>>,
    update: (partial: Partial<Settings>) =>
      ipcRenderer.invoke('settings:update', partial) as Promise<ApiResponse<Settings>>
  },
  notification: {
    show: (options: { type?: 'info' | 'success' | 'error' | 'warning'; title: string; message: string; duration?: number }) =>
      ipcRenderer.invoke('notification:show', options) as Promise<ApiResponse<boolean>>
  },
  metrics: {
    current: (args?: { userId?: string }) =>
      ipcRenderer.invoke('metrics:current', args) as Promise<ApiResponse<any>>,
    daily: (args: { date: string; userId?: string }) =>
      ipcRenderer.invoke('metrics:daily', args) as Promise<ApiResponse<any>>,
    createEvent: (args: { type: string; meta?: Record<string, any>; ts?: string }) =>
      ipcRenderer.invoke('metrics:createEvent', args) as Promise<ApiResponse<any>>,
    getEvents: (args?: { userId?: string; limit?: number }) =>
      ipcRenderer.invoke('metrics:getEvents', args) as Promise<ApiResponse<any[]>>,
    getConfig: (args?: { userId?: string }) =>
      ipcRenderer.invoke('metrics:getConfig', args) as Promise<ApiResponse<any>>,
    updateConfig: (args: { config: any; userId?: string }) =>
      ipcRenderer.invoke('metrics:updateConfig', args) as Promise<ApiResponse<any>>,
    recomputeBaselines: (args?: { userId?: string }) =>
      ipcRenderer.invoke('metrics:recomputeBaselines', args) as Promise<ApiResponse<any>>
  },
  qa: {
    listCollections: () =>
      ipcRenderer.invoke('qa:listCollections') as Promise<ApiResponse<any[]>>,
    createCollection: (args: { name: string; description?: string; color?: string; icon?: string }) =>
      ipcRenderer.invoke('qa:createCollection', args) as Promise<ApiResponse<any>>,
    updateCollection: (args: { id: number; payload: any }) =>
      ipcRenderer.invoke('qa:updateCollection', args) as Promise<ApiResponse<any>>,
    deleteCollection: (args: { id: number }) =>
      ipcRenderer.invoke('qa:deleteCollection', args) as Promise<ApiResponse<any>>,
    listQuestions: (args: { collectionId: number }) =>
      ipcRenderer.invoke('qa:listQuestions', args) as Promise<ApiResponse<any[]>>,
    createQuestion: (args: { collectionId: number; question: string; tags?: string[] }) =>
      ipcRenderer.invoke('qa:createQuestion', args) as Promise<ApiResponse<any>>,
    updateQuestion: (args: { id: number; payload: any }) =>
      ipcRenderer.invoke('qa:updateQuestion', args) as Promise<ApiResponse<any>>,
    deleteQuestion: (args: { id: number }) =>
      ipcRenderer.invoke('qa:deleteQuestion', args) as Promise<ApiResponse<any>>,
    listAnswers: (args: { questionId: number }) =>
      ipcRenderer.invoke('qa:listAnswers', args) as Promise<ApiResponse<any[]>>,
    createAnswer: (args: { questionId: number; content: string; isPartial?: boolean }) =>
      ipcRenderer.invoke('qa:createAnswer', args) as Promise<ApiResponse<any>>,
    updateAnswer: (args: { id: number; payload: any }) =>
      ipcRenderer.invoke('qa:updateAnswer', args) as Promise<ApiResponse<any>>,
    deleteAnswer: (args: { id: number }) =>
      ipcRenderer.invoke('qa:deleteAnswer', args) as Promise<ApiResponse<any>>,
    getStats: () =>
      ipcRenderer.invoke('qa:getStats') as Promise<ApiResponse<any>>
  },
  notebook: {
    listNotebooks: () =>
      ipcRenderer.invoke('notebook:listNotebooks') as Promise<ApiResponse<any[]>>,
    createNotebook: (args: { name: string; description?: string; icon?: string; color?: string }) =>
      ipcRenderer.invoke('notebook:createNotebook', args) as Promise<ApiResponse<any>>,
    updateNotebook: (args: { id: number; payload: any }) =>
      ipcRenderer.invoke('notebook:updateNotebook', args) as Promise<ApiResponse<any>>,
    deleteNotebook: (args: { id: number }) =>
      ipcRenderer.invoke('notebook:deleteNotebook', args) as Promise<ApiResponse<any>>,
    listNotes: (args: { notebookId: number }) =>
      ipcRenderer.invoke('notebook:listNotes', args) as Promise<ApiResponse<any[]>>,
    getNote: (args: { id: number }) =>
      ipcRenderer.invoke('notebook:getNote', args) as Promise<ApiResponse<any>>,
    createNote: (args: { notebookId: number; title: string; content?: string; tags?: string[] }) =>
      ipcRenderer.invoke('notebook:createNote', args) as Promise<ApiResponse<any>>,
    updateNote: (args: { id: number; payload: any }) =>
      ipcRenderer.invoke('notebook:updateNote', args) as Promise<ApiResponse<any>>,
    deleteNote: (args: { id: number }) =>
      ipcRenderer.invoke('notebook:deleteNote', args) as Promise<ApiResponse<any>>,
    searchNotes: (args: { query: string }) =>
      ipcRenderer.invoke('notebook:searchNotes', args) as Promise<ApiResponse<any[]>>,
    getStats: () =>
      ipcRenderer.invoke('notebook:getStats') as Promise<ApiResponse<any>>
  }
};

const windowControls = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize')
};

contextBridge.exposeInMainWorld('api', api);
contextBridge.exposeInMainWorld('windowControls', windowControls);

export type PreloadApi = typeof api;

declare global {
  interface Window {
    api: PreloadApi;
  }
}
