import { Router } from 'express';
import * as habitsController from '../controllers/habitsController';

export const habitsRouter = Router();

// Create habit
habitsRouter.post('/create', habitsController.createHabit);

// Get habit by ID
habitsRouter.get('/:id', habitsController.getHabit);

// List all habits
habitsRouter.get('/', habitsController.listHabits);

// Update habit
habitsRouter.put('/:id', habitsController.updateHabit);

// Delete habit
habitsRouter.delete('/:id', habitsController.deleteHabit);

// Log habit completion
habitsRouter.post('/:id/log', habitsController.logHabit);

// Unlog habit
habitsRouter.delete('/:id/log/:date', habitsController.unlogHabit);

// Get habit logs
habitsRouter.get('/:id/logs', habitsController.getHabitLogs);

// Get habits status
habitsRouter.get('/status', habitsController.getHabitsStatus);
