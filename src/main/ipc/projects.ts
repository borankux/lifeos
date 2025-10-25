import { ipcMain } from 'electron';
import { wrapIpc, success, failure } from '../utils/response';
import { createProject, listProjects, reorderProjects, updateProject } from '../../database/projectsRepo';
import { loadSettings, updateSettings } from '../../services/settings';
import type { CreateProjectInput, UpdateProjectPayload, ProjectsListResult } from '../../common/types';

ipcMain.handle(
  'projects:list',
  wrapIpc((): ProjectsListResult => {
    const projects = listProjects();
    const settings = loadSettings();
    let activeProjectId = settings.activeProjectId;

    if (projects.length === 0) {
      return { projects, activeProjectId: undefined };
    }

    if (!activeProjectId || !projects.some((project) => project.id === activeProjectId)) {
      activeProjectId = projects[0].id;
      updateSettings({ activeProjectId });
    }

    return { projects, activeProjectId };
  })
);

ipcMain.handle(
  'projects:create',
  wrapIpc((_event, payload: CreateProjectInput) => {
    const project = createProject(payload);
    const projects = listProjects();
    if (projects.length === 1) {
      updateSettings({ activeProjectId: project.id });
    }
    return project;
  })
);

ipcMain.handle(
  'projects:update',
  wrapIpc((_event, args: { id: number; payload: UpdateProjectPayload }) => {
    return updateProject({ id: args.id, payload: args.payload });
  })
);

ipcMain.handle(
  'projects:reorder',
  wrapIpc((_event, order: Array<{ id: number; position: number }>) => {
    try {
      reorderProjects(order);
      return success({ message: 'Reordered' });
    } catch (error) {
      console.error(error);
      return failure(error instanceof Error ? error.message : String(error));
    }
  })
);


ipcMain.handle(
  'projects:set-active',
  wrapIpc((_event, args: { id: number }) => {
    updateSettings({ activeProjectId: args.id });
    return { id: args.id };
  })
);
