import { Request, Response } from 'express';
import { ApiResponse, WalletCreateRequest, WalletImportRequest } from '../types';
import { WalletManager } from '../services/WalletManager';

export class WalletController {
  private static walletManager: WalletManager;

  static setWalletManager(manager: WalletManager): void {
    WalletController.walletManager = manager;
  }

  /**
   * Create a new wallet
   */
  static async createWallet(req: Request, res: Response): Promise<void> {
    try {
      const walletData: WalletCreateRequest = req.body;

      // Validate required fields
      if (!walletData.symbol) {
        const response: ApiResponse = {
          success: false,
          message: 'Symbol is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const wallet = await WalletController.walletManager.createWallet(walletData);
      
      const response: ApiResponse = {
        success: true,
        data: wallet,
        message: 'Wallet created and stored successfully',
        timestamp: new Date()
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create wallet',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get all wallets
   */
  static async getAllWallets(req: Request, res: Response): Promise<void> {
    try {
      const wallets = await WalletController.walletManager.getAllWallets();
      
      const response: ApiResponse = {
        success: true,
        data: wallets,
        message: 'All wallets retrieved successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve wallets',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get wallet by ID
   */
  static async getWalletById(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;

      if (!walletId) {
        const response: ApiResponse = {
          success: false,
          message: 'Wallet ID is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const wallet = await WalletController.walletManager.getWalletById(walletId);

      if (!wallet) {
        const response: ApiResponse = {
          success: false,
          message: 'Wallet not found',
          timestamp: new Date()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: wallet,
        message: 'Wallet retrieved successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve wallet',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Delete wallet
   */
  static async deleteWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;

      if (!walletId) {
        const response: ApiResponse = {
          success: false,
          message: 'Wallet ID is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await WalletController.walletManager.deleteWallet(walletId);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: 'Wallet not found',
          timestamp: new Date()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Wallet deleted successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete wallet',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Import wallet
   */
  static async importWallet(req: Request, res: Response): Promise<void> {
    try {
      const walletData: WalletImportRequest = req.body;

      // Validate required fields
      if (!walletData.symbol || !walletData.network || !walletData.privateKey) {
        const response: ApiResponse = {
          success: false,
          message: 'Symbol, network, and private key are required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const wallet = await WalletController.walletManager.importWallet(walletData);
      
      const response: ApiResponse = {
        success: true,
        data: wallet,
        message: 'Wallet imported successfully',
        timestamp: new Date()
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to import wallet',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Export wallet
   */
  static async exportWallet(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;

      if (!walletId) {
        const response: ApiResponse = {
          success: false,
          message: 'Wallet ID is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const walletExport = await WalletController.walletManager.exportWallet(walletId);

      if (!walletExport) {
        const response: ApiResponse = {
          success: false,
          message: 'Wallet not found',
          timestamp: new Date()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: walletExport,
        message: 'Wallet exported successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to export wallet',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get wallet statistics
   */
  static async getWalletStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await WalletController.walletManager.getWalletStats();
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Wallet statistics retrieved successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve wallet statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Backup all wallets
   */
  static async backupWallets(req: Request, res: Response): Promise<void> {
    try {
      const backupPath = await WalletController.walletManager.backupWallets();
      
      const response: ApiResponse = {
        success: true,
        data: { backupPath },
        message: 'Wallets backed up successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to backup wallets',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Restore wallets from backup
   */
  static async restoreWallets(req: Request, res: Response): Promise<void> {
    try {
      const { backupPath } = req.body;

      if (!backupPath) {
        const response: ApiResponse = {
          success: false,
          message: 'Backup path is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const restoredCount = await WalletController.walletManager.restoreWallets(backupPath);
      
      const response: ApiResponse = {
        success: true,
        data: { restoredCount },
        message: `${restoredCount} wallets restored successfully`,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to restore wallets',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Sync wallet balances
   */
  static async syncWalletBalances(req: Request, res: Response): Promise<void> {
    try {
      await WalletController.walletManager.syncWalletBalances();
      
      const response: ApiResponse = {
        success: true,
        message: 'Wallet balances synced successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to sync wallet balances',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }
} 