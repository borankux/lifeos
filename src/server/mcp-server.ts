import express from 'express';
import cors from 'cors';
import express from 'express';
import { initDatabase } from '../database/init';
import { tasksRouter } from './routes/tasks';
import { projectsRouter } from './routes/projects';
import { habitsRouter } from './routes/habits';
import { notebooksRouter } from './routes/notebooks';
import { notesRouter } from './routes/notes';
import { qaRouter } from './routes/qa';
import { activitiesRouter } from './routes/activities';
import { settingsRouter } from './routes/settings';
import { statusRouter } from './routes/status';
import { logsRouter } from './routes/logs';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const PORT = process.env.MCP_SERVER_PORT || 3000;
const HOST = process.env.MCP_SERVER_HOST || 'localhost';

export function createMcpServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.MCP_CORS_ORIGIN || '*',
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(rateLimiter);
  app.use(authMiddleware);

  // Health check
  app.get('/health', (req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api/tasks', tasksRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/habits', habitsRouter);
  app.use('/api/notebooks', notebooksRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/qa', qaRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/status', statusRouter);
  app.use('/api/logs', logsRouter);

  // Error handling
  app.use(errorHandler);

  return app;
}

export async function startMcpServer() {
  try {
    // Initialize database first
    await initDatabase();
    logger.info('Database initialized for MCP server');
  } catch (error) {
    logger.error('Failed to initialize database for MCP server', error);
    throw error;
  }

  const app = createMcpServer();

  return new Promise<void>((resolve, reject) => {
    try {
      app.listen(Number(PORT), HOST, () => {
        logger.info(`MCP Server started on http://${HOST}:${PORT}`);
        resolve();
      });
    } catch (error) {
      logger.error('Failed to start MCP server', error);
      reject(error);
    }
  });
}

// Start server if run directly
if (require.main === module) {
  startMcpServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
