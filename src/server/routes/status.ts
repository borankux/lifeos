import { Router } from 'express';
import * as statusController from '../controllers/statusController';

export const statusRouter = Router();

// Get comprehensive system status
statusRouter.get('/', statusController.getGlobalStatus);
