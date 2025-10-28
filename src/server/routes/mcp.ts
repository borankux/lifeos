/**
 * MCP Protocol Routes
 * Implements POST /mcp, GET /mcp, and DELETE /mcp for MCP 2.0 compliance
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  parseRequest,
  validateMethod,
  validateParams,
  formatResponse,
  formatErrorResponse,
  createError,
  isNotification,
  JsonRpcErrorCode,
  getErrorMessage,
} from '../utils/jsonRpc';
import { executeToolHandler, getAvailableTools, getToolSchema } from '../utils/toolHandlers';
import * as sseManager from '../utils/sseManager';

const router = Router();

/**
 * POST /mcp - JSON-RPC 2.0 Tool Invocation
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse and validate JSON-RPC request
    let rpcRequest;
    try {
      rpcRequest = parseRequest(req.body);
    } catch (error: any) {
      return res.status(400).json(
        formatErrorResponse(
          error,
          null,
        ),
      );
    }

    // Check if method exists
    const availableMethods = getAvailableTools();
    if (!validateMethod(rpcRequest.method, availableMethods)) {
      return res.status(400).json(
        formatErrorResponse(
          createError(
            JsonRpcErrorCode.MethodNotFound,
            `Method not found: ${rpcRequest.method}`,
          ),
          rpcRequest.id || null,
        ),
      );
    }

    // Validate params against schema
    const schema = getToolSchema(rpcRequest.method);
    const validation = validateParams(rpcRequest.params || {}, schema, rpcRequest.method);

    if (!validation.valid) {
      return res.status(400).json(
        formatErrorResponse(
          createError(
            JsonRpcErrorCode.InvalidParams,
            'Invalid parameters',
            validation.errors,
          ),
          rpcRequest.id || null,
        ),
      );
    }

    // Check if this is a notification (no response expected)
    if (isNotification(rpcRequest)) {
      // Execute handler asynchronously
      executeToolHandler(rpcRequest.method, rpcRequest.params || {}).catch(error => {
        console.error('Error executing notification:', error);
      });

      // Return 202 Accepted for notifications
      return res.status(202).end();
    }

    // Execute tool handler
    const result = await executeToolHandler(rpcRequest.method, rpcRequest.params || {});

    if (result.success) {
      return res.status(200).json(formatResponse(result.data, rpcRequest.id || null));
    } else {
      return res.status(500).json(
        formatErrorResponse(
          result.error || createError(JsonRpcErrorCode.InternalError, 'Internal error'),
          rpcRequest.id || null,
        ),
      );
    }
  } catch (error: any) {
    console.error('MCP POST error:', error);
    return res.status(500).json(
      formatErrorResponse(
        createError(JsonRpcErrorCode.InternalError, error.message || 'Internal server error'),
        null,
      ),
    );
  }
});

/**
 * GET /mcp - SSE Streaming Endpoint
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate Accept header
    const accept = req.get('Accept') || '';
    if (!accept.includes('text/event-stream')) {
      return res.status(406).json({
        error: {
          code: 'INVALID_ACCEPT_HEADER',
          message: 'Accept header must include text/event-stream',
        },
      });
    }

    // Get or generate session ID
    let sessionId = req.get('Mcp-Session-Id');
    const isNewSession = !sessionId;

    if (!sessionId) {
      sessionId = sseManager.generateSessionId();
    } else if (!sseManager.isValidSessionId(sessionId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_SESSION_ID',
          message: 'Mcp-Session-Id must be a valid UUID',
        },
      });
    }

    // Check if resuming existing session
    const existingSession = sseManager.getSession(sessionId);
    if (existingSession) {
      // Close existing session and create new one
      sseManager.closeSession(sessionId);
    }

    // Create SSE session
    const session = sseManager.createSession(sessionId, res, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    // Handle Last-Event-ID for reconnection
    const lastEventId = req.get('Last-Event-ID');
    if (lastEventId) {
      const eventId = parseInt(lastEventId, 10);
      if (!isNaN(eventId)) {
        // Resume from last event (currently not implemented with history)
        // In a full implementation, you'd replay missed events here
        console.log(`Client reconnecting from event ID: ${eventId}`);
      }
    }

    console.log(
      `SSE session ${isNewSession ? 'created' : 'resumed'}: ${sessionId}`,
    );

    // Session will stay open until client disconnects
    // Heartbeats are sent automatically by sseManager
  } catch (error: any) {
    console.error('MCP GET error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Internal server error',
        },
      });
    }
  }
});

/**
 * DELETE /mcp - Session Cleanup
 */
router.delete('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.get('Mcp-Session-Id');

    if (!sessionId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SESSION_ID',
          message: 'Mcp-Session-Id header is required',
        },
      });
    }

    if (!sseManager.isValidSessionId(sessionId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_SESSION_ID',
          message: 'Mcp-Session-Id must be a valid UUID',
        },
      });
    }

    const session = sseManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: `Session not found: ${sessionId}`,
        },
      });
    }

    // Close session
    sseManager.closeSession(sessionId);

    console.log(`SSE session closed: ${sessionId}`);

    return res.status(200).json({
      success: true,
      message: 'Session closed successfully',
    });
  } catch (error: any) {
    console.error('MCP DELETE error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
      },
    });
  }
});

export default router;
