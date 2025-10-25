import { ipcMain } from 'electron';
import { wrapIpc } from '../utils/response';
import { listTasksByProject, createTask, updateTask, moveTask } from '../../database/tasksRepo';
import type { CreateTaskInput, UpdateTaskPayload } from '../../common/types';

type ListArgs = { projectId: number };

type MoveArgs = { id: number; projectId: number; status: string; position: number };

ipcMain.handle(
  'tasks:list-by-project',
  wrapIpc(({ projectId }: ListArgs) => {
    return listTasksByProject(projectId);
  })
);

ipcMain.handle(
  'tasks:create',
  wrapIpc((payload: CreateTaskInput) => {
    return createTask(payload);
  })
);

ipcMain.handle(
  'tasks:update',
  wrapIpc((args: { id: number; payload: UpdateTaskPayload }) => {
    return updateTask({ id: args.id, payload: args.payload });
  })
);

ipcMain.handle(
  'tasks:move',
  wrapIpc((payload: MoveArgs) => {
    return moveTask(payload);
  })
);
