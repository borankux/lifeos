/**
 * Legacy SSE Endpoint
 * GET /sse - Legacy MCP client discovery endpoint
 */

import { Router, Request, Response } from 'express';
import * as sseManager from '../utils/sseManager';

const router = Router();

/**
 * GET /sse - Legacy endpoint discovery
 * Sends an endpoint event to help older MCP clients discover the POST /messages endpoint
 */
router.get('/', (req: Request, res: Response) => {
  try {
    // Generate session ID
    const sessionId = sseManager.generateSessionId();

    // Create SSE session
    const session = sseManager.createSession(sessionId, res, {
      legacy: true,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    // Get base URL from request
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Send endpoint discovery event
    sseManager.sendEndpointDiscovery(sessionId, `${baseUrl}/messages`);

    console.log(`Legacy SSE session created: ${sessionId}`);

    // Keep connection open for legacy compatibility
    // Client will use the /messages endpoint for actual JSON-RPC calls
  } catch (error: any) {
    console.error('Legacy SSE error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Internal server error',
        },
      });
    }
  }
});

export default router;
