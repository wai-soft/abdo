import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter, sensitiveEndpointLimiter } from './middleware/rateLimiter';
import { metricsMiddleware } from './middleware/metricsMiddleware';
import cryptoRoutes from './routes/cryptoRoutes';
import walletRoutes from './routes/walletRoutes';
import monitorRoutes from './routes/monitorRoutes';
import metricsRoutes from './routes/metricsRoutes';
import { logger } from './services/Logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Metrics middleware
app.use(metricsMiddleware);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/wallet/(create|import)', sensitiveEndpointLimiter);

// Routes
app.use('/api/crypto', cryptoRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/metrics', metricsRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path
  });
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

export default app; 