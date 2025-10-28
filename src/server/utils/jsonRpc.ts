/**
 * JSON-RPC 2.0 Handler
 * Implements JSON-RPC 2.0 specification for MCP protocol compliance
 */

// JSON-RPC 2.0 Error Codes
export enum JsonRpcErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  // Server error range: -32000 to -32099
  ServerError = -32000,
  ResourceNotFound = -32001,
  DatabaseError = -32002,
}

// JSON-RPC 2.0 Request
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: string | number;
}

// JSON-RPC 2.0 Response
export interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: JsonRpcError;
  id: string | number | null;
}

// JSON-RPC 2.0 Error
export interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

// JSON-RPC 2.0 Notification (no id, no response expected)
export interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

/**
 * Parse and validate JSON-RPC 2.0 request
 */
export function parseRequest(body: any): JsonRpcRequest {
  // Check if body is valid
  if (!body || typeof body !== 'object') {
    throw createError(
      JsonRpcErrorCode.InvalidRequest,
      'Request must be a JSON object',
    );
  }

  // Validate jsonrpc version
  if (body.jsonrpc !== '2.0') {
    throw createError(
      JsonRpcErrorCode.InvalidRequest,
      'jsonrpc field must be "2.0"',
    );
  }

  // Validate method
  if (!body.method || typeof body.method !== 'string') {
    throw createError(
      JsonRpcErrorCode.InvalidRequest,
      'method field must be a non-empty string',
    );
  }

  // Params is optional
  if (body.params !== undefined && typeof body.params !== 'object') {
    throw createError(
      JsonRpcErrorCode.InvalidRequest,
      'params field must be an object if provided',
    );
  }

  // id is optional for notifications, but if present must be string or number
  if (
    body.id !== undefined &&
    body.id !== null &&
    typeof body.id !== 'string' &&
    typeof body.id !== 'number'
  ) {
    throw createError(
      JsonRpcErrorCode.InvalidRequest,
      'id field must be a string, number, or null',
    );
  }

  return body as JsonRpcRequest;
}

/**
 * Validate method name exists in allowed tools
 */
export function validateMethod(method: string, allowedMethods: string[]): boolean {
  return allowedMethods.includes(method);
}

/**
 * Validate params against JSON schema
 */
export function validateParams(
  params: any,
  schema: any,
  methodName: string,
): { valid: boolean; errors?: string[] } {
  if (!schema) {
    return { valid: true };
  }

  const errors: string[] = [];

  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (params === undefined || params === null || !(field in params)) {
        errors.push(`Missing required parameter: ${field}`);
      }
    }
  }

  // If no params provided but schema exists, check if any are required
  if ((params === undefined || params === null) && errors.length > 0) {
    return { valid: false, errors };
  }

  // Validate properties if params provided
  if (params && schema.properties) {
    for (const [key, value] of Object.entries(params)) {
      const propSchema = schema.properties[key];

      if (!propSchema) {
        errors.push(`Unknown parameter: ${key}`);
        continue;
      }

      // Type validation
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (propSchema.type && actualType !== propSchema.type && value !== null) {
        errors.push(
          `Parameter ${key} must be of type ${propSchema.type}, got ${actualType}`,
        );
      }

      // Enum validation
      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push(
          `Parameter ${key} must be one of [${propSchema.enum.join(', ')}], got "${value}"`,
        );
      }

      // Integer range validation
      if (propSchema.type === 'integer' && typeof value === 'number') {
        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
          errors.push(
            `Parameter ${key} must be >= ${propSchema.minimum}, got ${value}`,
          );
        }
        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
          errors.push(
            `Parameter ${key} must be <= ${propSchema.maximum}, got ${value}`,
          );
        }
      }

      // String length validation
      if (propSchema.type === 'string' && typeof value === 'string') {
        if (propSchema.minLength !== undefined && value.length < propSchema.minLength) {
          errors.push(
            `Parameter ${key} must be at least ${propSchema.minLength} characters`,
          );
        }
        if (propSchema.maxLength !== undefined && value.length > propSchema.maxLength) {
          errors.push(
            `Parameter ${key} must be at most ${propSchema.maxLength} characters`,
          );
        }
      }
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * Format successful JSON-RPC response
 */
export function formatResponse(result: any, requestId: string | number | null): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    result,
    id: requestId,
  };
}

/**
 * Format JSON-RPC error response
 */
export function formatErrorResponse(
  error: JsonRpcError,
  requestId: string | number | null,
): JsonRpcResponse {
  return {
    jsonrpc: '2.0',
    error,
    id: requestId,
  };
}

/**
 * Create JSON-RPC error object
 */
export function createError(code: number, message: string, data?: any): JsonRpcError {
  const error: JsonRpcError = { code, message };
  if (data !== undefined) {
    error.data = data;
  }
  return error;
}

/**
 * Check if request is a notification (no response expected)
 */
export function isNotification(request: JsonRpcRequest): boolean {
  return request.id === undefined;
}

/**
 * Parse JSON safely and return parse errors as JSON-RPC errors
 */
export function parseJsonSafely(text: string): { success: true; data: any } | { success: false; error: JsonRpcError } {
  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: createError(
        JsonRpcErrorCode.ParseError,
        'Invalid JSON',
        err instanceof Error ? err.message : String(err),
      ),
    };
  }
}

/**
 * Get standard error message for error code
 */
export function getErrorMessage(code: JsonRpcErrorCode): string {
  switch (code) {
    case JsonRpcErrorCode.ParseError:
      return 'Parse error';
    case JsonRpcErrorCode.InvalidRequest:
      return 'Invalid Request';
    case JsonRpcErrorCode.MethodNotFound:
      return 'Method not found';
    case JsonRpcErrorCode.InvalidParams:
      return 'Invalid params';
    case JsonRpcErrorCode.InternalError:
      return 'Internal error';
    case JsonRpcErrorCode.ServerError:
      return 'Server error';
    case JsonRpcErrorCode.ResourceNotFound:
      return 'Resource not found';
    case JsonRpcErrorCode.DatabaseError:
      return 'Database error';
    default:
      return 'Unknown error';
  }
}
