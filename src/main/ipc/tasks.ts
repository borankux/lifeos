import { ipcMain } from 'electron';
import { wrapIpc } from '../utils/response';
import { listTasksByProject, createTask, updateTask, moveTask } from '../../database/tasksRepo';
import type { CreateTaskInput, UpdateTaskPayload } from '../../common/types';

type ListArgs = { projectId: number };

type MoveArgs = { id: number; projectId: number; status: string; position: number };

ipcMain.handle(
  'tasks:list-by-project',
  wrapIpc((_event, { projectId }: ListArgs) => {
    return listTasksByProject(projectId);
  })
);

ipcMain.handle(
  'tasks:create',
  wrapIpc((_event, payload: CreateTaskInput) => {
    return createTask({ ...payload, status: payload.status ?? 'To-Do' });
  })
);

ipcMain.handle(
  'tasks:update',
  wrapIpc((_event, args: { id: number; payload: UpdateTaskPayload }) => {
    return updateTask({ id: args.id, payload: args.payload });
  })
);

ipcMain.handle(
  'tasks:move',
  wrapIpc((_event, payload: MoveArgs) => {
    return moveTask(payload);
  })
);
