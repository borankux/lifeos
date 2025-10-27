import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';

export const tasksRouter = Router();

// Create task
tasksRouter.post('/create', tasksController.createTask);

// Get task by ID
tasksRouter.get('/:id', tasksController.getTask);

// List tasks by project
tasksRouter.get('/project/:projectId', tasksController.listTasksByProject);

// Update task
tasksRouter.put('/:id', tasksController.updateTask);

// Delete task
tasksRouter.delete('/:id', tasksController.deleteTask);

// Move task
tasksRouter.put('/:id/move', tasksController.moveTask);

// Get all tasks status
tasksRouter.get('/', tasksController.getTasksStatus);
