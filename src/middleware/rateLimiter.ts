import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../services/Logger';

// Rate limiter for general API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil(15 * 60) // 15 minutes in seconds
    });
  }
});

// Stricter rate limiter for sensitive endpoints (wallet creation, import, etc.)
export const sensitiveEndpointLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many sensitive operations, please try again later',
  handler: (req: Request, res: Response) => {
    logger.warn('Sensitive endpoint rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Too many sensitive operations, please try again later',
      retryAfter: Math.ceil(60 * 60) // 1 hour in seconds
    });
  }
}); 