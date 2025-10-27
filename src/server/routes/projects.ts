import { Router } from 'express';
import * as projectsController from '../controllers/projectsController';

export const projectsRouter = Router();

// Create project
projectsRouter.post('/create', projectsController.createProject);

// Get project by ID
projectsRouter.get('/:id', projectsController.getProject);

// List all projects
projectsRouter.get('/', projectsController.listProjects);

// Update project
projectsRouter.put('/:id', projectsController.updateProject);

// Delete project
projectsRouter.delete('/:id', projectsController.deleteProject);

// Reorder projects
projectsRouter.put('/reorder', projectsController.reorderProjects);

// Set active project
projectsRouter.put('/:id/set-active', projectsController.setActiveProject);

// Get projects status
projectsRouter.get('/status', projectsController.getProjectsStatus);
