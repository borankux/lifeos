/**
 * Legacy Messages Endpoint
 * POST /messages - Legacy JSON-RPC endpoint for older MCP clients
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
} from '../utils/jsonRpc';
import { executeToolHandler, getAvailableTools, getToolSchema } from '../utils/toolHandlers';

const router = Router();

/**
 * POST /messages - Legacy JSON-RPC endpoint
 * Same functionality as POST /mcp but without MCP-specific headers
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
    console.error('Legacy messages POST error:', error);
    return res.status(500).json(
      formatErrorResponse(
        createError(JsonRpcErrorCode.InternalError, error.message || 'Internal server error'),
        null,
      ),
    );
  }
});

export default router;
