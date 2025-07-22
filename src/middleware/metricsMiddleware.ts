import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../services/MetricsService';
import { logger } from '../services/Logger';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const metrics = MetricsService.getInstance();
  const timer = metrics.startApiTimer();

  // Add response hook to record metrics after request is completed
  res.on('finish', () => {
    try {
      metrics.recordApiLatency(
        req.method,
        req.path,
        res.statusCode,
        timer
      );

      // Record errors (4xx and 5xx status codes)
      if (res.statusCode >= 400) {
        metrics.recordError(
          res.statusCode >= 500 ? 'server_error' : 'client_error',
          res.statusCode.toString()
        );
      }

      // Log request details
      logger.info('API Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: timer.startTimer,
        userAgent: req.headers['user-agent']
      });
    } catch (error) {
      logger.error('Failed to record API metrics', error, {
        method: req.method,
        path: req.path
      });
    }
  });

  next();
} 