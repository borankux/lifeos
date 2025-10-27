import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const RATE_LIMIT = Number(process.env.MCP_RATE_LIMIT) || 100; // requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  // Skip rate limiting for health check
  if (req.path === '/health') {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // Clean up expired entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });

  // Initialize or get current rate limit data
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS
    };
    return next();
  }

  // Increment count
  store[ip].count++;

  // Check if limit exceeded
  if (store[ip].count > RATE_LIMIT) {
    const retryAfter = Math.ceil((store[ip].resetTime - now) / 1000);
    
    res.set('X-RateLimit-Limit', String(RATE_LIMIT));
    res.set('X-RateLimit-Remaining', '0');
    res.set('X-RateLimit-Reset', String(store[ip].resetTime));
    res.set('Retry-After', String(retryAfter));
    
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        details: {
          limit: RATE_LIMIT,
          retryAfter
        }
      }
    });
  }

  // Set rate limit headers
  res.set('X-RateLimit-Limit', String(RATE_LIMIT));
  res.set('X-RateLimit-Remaining', String(RATE_LIMIT - store[ip].count));
  res.set('X-RateLimit-Reset', String(store[ip].resetTime));

  next();
}
