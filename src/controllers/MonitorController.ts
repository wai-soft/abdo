import { Request, Response } from 'express';
import { TransactionMonitorService } from '../services/TransactionMonitor';
import { MonitorRequest } from '../types';

export class MonitorController {
  private static monitorService: TransactionMonitorService;

  static setMonitorService(service: TransactionMonitorService) {
    MonitorController.monitorService = service;
  }

  /**
   * Start monitoring a wallet
   */
  static async startMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const monitorRequest: MonitorRequest = req.body;

      if (!walletId) {
        res.status(400).json({
          success: false,
          error: 'Wallet ID is required'
        });
        return;
      }

      const monitor = await MonitorController.monitorService.startMonitoring(walletId, monitorRequest);

      res.status(201).json({
        success: true,
        data: monitor,
        message: 'Monitoring started successfully'
      });
    } catch (error: any) {
      console.error('Failed to start monitoring:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to start monitoring'
      });
    }
  }

  /**
   * Stop monitoring a wallet
   */
  static async stopMonitoring(req: Request, res: Response): Promise<void> {
    try {
      const { monitoringId } = req.params;

      if (!monitoringId) {
        res.status(400).json({
          success: false,
          error: 'Monitoring ID is required'
        });
        return;
      }

      const success = await MonitorController.monitorService.stopMonitoring(monitoringId);

      if (success) {
        res.json({
          success: true,
          message: 'Monitoring stopped successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Monitor not found'
        });
      }
    } catch (error: any) {
      console.error('Failed to stop monitoring:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to stop monitoring'
      });
    }
  }

  /**
   * Get monitoring status
   */
  static async getMonitoringStatus(req: Request, res: Response): Promise<void> {
    try {
      const { monitoringId } = req.params;

      if (!monitoringId) {
        res.status(400).json({
          success: false,
          error: 'Monitoring ID is required'
        });
        return;
      }

      const monitor = await MonitorController.monitorService.getMonitoringStatus(monitoringId);

      if (monitor) {
        res.json({
          success: true,
          data: monitor
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Monitor not found'
        });
      }
    } catch (error: any) {
      console.error('Failed to get monitoring status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get monitoring status'
      });
    }
  }

  /**
   * Get all monitors
   */
  static async getAllMonitors(req: Request, res: Response) {
    try {
      const monitors = await MonitorController.monitorService.getAllMonitors();

      res.json({
        success: true,
        data: monitors,
        count: monitors.length
      });
    } catch (error: any) {
      console.error('Failed to get all monitors:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get monitors'
      });
    }
  }

  /**
   * Get monitor transactions
   */
  static async getMonitorTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { monitoringId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!monitoringId) {
        res.status(400).json({
          success: false,
          error: 'Monitoring ID is required'
        });
        return;
      }

      const transactions = await MonitorController.monitorService.getMonitorTransactions(monitoringId, limit);

      res.json({
        success: true,
        data: transactions,
        count: transactions.length
      });
    } catch (error: any) {
      console.error('Failed to get monitor transactions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get transactions'
      });
    }
  }

  /**
   * Update monitoring settings
   */
  static async updateMonitoringSettings(req: Request, res: Response): Promise<void> {
    try {
      const { monitoringId } = req.params;
      const updates: Partial<MonitorRequest> = req.body;

      if (!monitoringId) {
        res.status(400).json({
          success: false,
          error: 'Monitoring ID is required'
        });
        return;
      }

      const monitor = await MonitorController.monitorService.updateMonitoringSettings(monitoringId, updates);

      if (monitor) {
        res.json({
          success: true,
          data: monitor,
          message: 'Monitoring settings updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Monitor not found'
        });
      }
    } catch (error: any) {
      console.error('Failed to update monitoring settings:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update monitoring settings'
      });
    }
  }

  /**
   * Get monitoring statistics
   */
  static async getMonitoringStats(req: Request, res: Response) {
    try {
      const stats = await MonitorController.monitorService.getMonitoringStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Failed to get monitoring stats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get monitoring statistics'
      });
    }
  }

  /**
   * Manual transaction check
   */
  static async checkTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { monitoringId } = req.params;

      if (!monitoringId) {
        res.status(400).json({
          success: false,
          error: 'Monitoring ID is required'
        });
        return;
      }

      const newTransactions = await MonitorController.monitorService.checkTransactions(monitoringId);

      res.json({
        success: true,
        data: newTransactions,
        count: newTransactions.length,
        message: `Found ${newTransactions.length} new transactions`
      });
    } catch (error: any) {
      console.error('Failed to check transactions:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to check transactions'
      });
    }
  }

  /**
   * Process webhook from Tatum
   */
  static async processWebhook(req: Request, res: Response) {
    try {
      const payload = req.body;

      // Process webhook asynchronously
      MonitorController.monitorService.processWebhook(payload);

      // Respond immediately to Tatum
      res.status(200).json({
        success: true,
        message: 'Webhook received and processing started'
      });
    } catch (error: any) {
      console.error('Failed to process webhook:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process webhook'
      });
    }
  }
} 