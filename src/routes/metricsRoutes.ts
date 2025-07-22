import { Router } from 'express';
import { MetricsService } from '../services/MetricsService';
import { logger } from '../services/Logger';

const router = Router();

// Endpoint for Prometheus to scrape metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = MetricsService.getInstance();
    const metricsData = await metrics.getMetrics();
    
    res.set('Content-Type', 'text/plain');
    res.send(metricsData);
  } catch (error) {
    logger.error('Failed to get metrics', error);
    res.status(500).json({
      error: 'Failed to get metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  try {
    const metrics = MetricsService.getInstance();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 