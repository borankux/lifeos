import { Router } from 'express';
import * as activitiesController from '../controllers/activitiesController';

export const activitiesRouter = Router();

// Get all activities
activitiesRouter.get('/', activitiesController.getAllActivities);

// Get activities by date
activitiesRouter.get('/date/:date', activitiesController.getActivitiesByDate);

// Get activities by type
activitiesRouter.get('/type/:type', activitiesController.getActivitiesByType);

// Get activities status
activitiesRouter.get('/status', activitiesController.getActivitiesStatus);
