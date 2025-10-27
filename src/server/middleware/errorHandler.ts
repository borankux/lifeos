import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(err: ApiError | Error, req: Request, res: Response, next: NextFunction) {
  // Log error
  logger.error('API Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors
      }
    });
  }

  // Handle custom API errors
  if ('statusCode' in err) {
    return res.status(err.statusCode || 500).json({
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        details: err.details
      }
    });
  }

  // Handle not found errors
  if (err.message.includes('not found')) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: err.message
      }
    });
  }

  // Default error response
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    }
  });
}

export function createError(message: string, statusCode: number = 500, code?: string, details?: any): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}
