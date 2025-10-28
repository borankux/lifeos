import express from 'express';
import cors from 'cors';
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
import mcpRouter from './routes/mcp';
import sseRouter from './routes/sse';
import messagesRouter from './routes/messages';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { strictMcpSecurity, legacySecurity } from './middleware/mcpSecurity';
import { logger } from './utils/logger';

const PORT = process.env.MCP_SERVER_PORT || 3000;
const HOST = process.env.MCP_SERVER_HOST || 'localhost';

export function createMcpServer() {
  const app = express();

  // CORS configuration - support SSE streaming
  app.use(cors({
    origin: process.env.MCP_CORS_ORIGIN || '*',
    credentials: true,
    exposedHeaders: ['MCP-Protocol-Version', 'Mcp-Session-Id'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'MCP-Protocol-Version',
      'Mcp-Session-Id',
      'Origin',
      'Last-Event-ID',
      'Accept'
    ]
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(rateLimiter);
  // Note: authMiddleware is applied selectively, not to MCP endpoints

  // Health check endpoints
  app.get('/health', (req: any, res: any) => {
    const uptime = process.uptime();
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: '1.0.0'
    });
  });

  app.get('/healthz', (req: any, res: any) => {
    const uptime = process.uptime();
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      version: '1.0.0'
    });
  });

  // MCP Protocol Endpoints (with MCP security middleware)
  app.use('/mcp', strictMcpSecurity, mcpRouter);
  app.use('/sse', legacySecurity, sseRouter);
  app.use('/messages', legacySecurity, messagesRouter);

  // REST API Routes (with auth middleware)
  app.use('/api/tasks', authMiddleware, tasksRouter);
  app.use('/api/projects', authMiddleware, projectsRouter);
  app.use('/api/habits', authMiddleware, habitsRouter);
  app.use('/api/notebooks', authMiddleware, notebooksRouter);
  app.use('/api/notes', authMiddleware, notesRouter);
  app.use('/api/qa', authMiddleware, qaRouter);
  app.use('/api/activities', authMiddleware, activitiesRouter);
  app.use('/api/settings', authMiddleware, settingsRouter);
  app.use('/api/status', authMiddleware, statusRouter);
  app.use('/api/logs', authMiddleware, logsRouter);

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
