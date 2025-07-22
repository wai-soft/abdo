import { Router } from 'express';
import { MonitorController } from '../controllers/MonitorController';

const router = Router();

// Start monitoring a wallet
router.post('/wallet/:walletId/start', MonitorController.startMonitoring);

// Stop monitoring
router.post('/:monitoringId/stop', MonitorController.stopMonitoring);

// Get monitoring status
router.get('/:monitoringId/status', MonitorController.getMonitoringStatus);

// Get all monitors
router.get('/', MonitorController.getAllMonitors);

// Get monitor transactions
router.get('/:monitoringId/transactions', MonitorController.getMonitorTransactions);

// Update monitoring settings
router.put('/:monitoringId/settings', MonitorController.updateMonitoringSettings);

// Get monitoring statistics
router.get('/stats/overview', MonitorController.getMonitoringStats);

// Manual transaction check
router.post('/:monitoringId/check', MonitorController.checkTransactions);

// Webhook endpoint for Tatum
router.post('/webhook/tatum', MonitorController.processWebhook);

export default router; 