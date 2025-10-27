import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';

export const settingsRouter = Router();

// Get all settings
settingsRouter.get('/', settingsController.getSettings);

// Update settings
settingsRouter.put('/', settingsController.updateSettings);

// Get theme settings
settingsRouter.get('/theme', settingsController.getTheme);

// Update theme settings
settingsRouter.put('/theme', settingsController.updateTheme);
