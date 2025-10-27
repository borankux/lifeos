import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip auth for health check
  if (req.path === '/health') {
    return next();
  }

  // Check for API key if configured
  const apiKey = process.env.MCP_API_KEY;
  
  if (apiKey) {
    const providedKey = req.headers['x-api-key'];
    
    if (!providedKey || providedKey !== apiKey) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing API key'
        }
      });
    }
  }

  next();
}
