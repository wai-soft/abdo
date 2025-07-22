import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { Wallet, WalletCreateRequest, WalletImportRequest, WalletExport, WalletStats } from '../types';
import { TatumService } from './TatumService';
import { CurrencyNetworkMapper } from './CurrencyNetworkMapper';
import { DatabaseService } from './DatabaseService';

export class WalletManager {
  private walletsDir: string;
  private tatumService: TatumService;
  private databaseService: DatabaseService;
  private encryptionKey: string;

  constructor(tatumService: TatumService, databaseService: DatabaseService, walletsDir: string, encryptionKey: string) {
    this.tatumService = tatumService;
    this.databaseService = databaseService;
    this.walletsDir = walletsDir;
    this.encryptionKey = encryptionKey;
    this.ensureWalletsDirectory();
  }

  /**
   * Create a new wallet
   */
  async createWallet(request: WalletCreateRequest): Promise<Wallet> {
    try {
      // Validate currency and network
      const networks = CurrencyNetworkMapper.getNetworksForSymbol(request.symbol);
      const targetNetwork = request.network || networks[0];
      
      if (!targetNetwork) {
        throw new Error(`No supported networks found for ${request.symbol}`);
      }
      
      const validation = CurrencyNetworkMapper.validateCurrencyNetworkPair(
        request.symbol,
        targetNetwork
      );

      if (!validation.supported) {
        throw new Error(`Currency ${request.symbol} is not supported`);
      }

      if (!validation.isValid) {
        throw new Error(`Network ${request.network} is not supported for ${request.symbol}`);
      }

      // Create wallet using Tatum service
      const wallet = await this.tatumService.createWallet(request);

      // Save wallet to database
      await this.databaseService.createWallet(wallet);

      // Also save to file system for backup
      await this.saveWallet(wallet);

      return wallet;
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import an existing wallet
   */
  async importWallet(request: WalletImportRequest): Promise<Wallet> {
    try {
      // Validate currency and network
      const validation = CurrencyNetworkMapper.validateCurrencyNetworkPair(
        request.symbol,
        request.network
      );

      if (!validation.supported) {
        throw new Error(`Currency ${request.symbol} is not supported`);
      }

      if (!validation.isValid) {
        throw new Error(`Network ${request.network} is not supported for ${request.symbol}`);
      }

      // Import wallet using Tatum service
      const wallet = await this.tatumService.importWallet(request);

      // Check if wallet already exists
      const existingWallet = await this.getWalletById(wallet.walletId);
      if (existingWallet) {
        throw new Error('Wallet already exists');
      }

      // Save wallet to database
      await this.databaseService.createWallet(wallet);

      // Also save to file system for backup
      await this.saveWallet(wallet);

      return wallet;
    } catch (error) {
      throw new Error(`Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all wallets
   */
  async getAllWallets(): Promise<Wallet[]> {
    try {
      // Get wallets from database
      const wallets = await this.databaseService.getAllWallets();
      
      // If database is empty, try to load from file system
      if (wallets.length === 0) {
        const fileWallets: Wallet[] = [];
        const files = await fs.readdir(this.walletsDir);

        for (const file of files) {
          if (file.endsWith('.json')) {
            const walletPath = path.join(this.walletsDir, file);
            const walletData = await fs.readJson(walletPath);
            const wallet = this.decryptWallet(walletData);
            fileWallets.push(wallet);
          }
        }

        // Save file wallets to database
        for (const wallet of fileWallets) {
          try {
            await this.databaseService.createWallet(wallet);
          } catch (error) {
            // Wallet might already exist in database
            console.warn(`Wallet ${wallet.walletId} might already exist in database`);
          }
        }

        return fileWallets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      return wallets;
    } catch (error) {
      console.error('Failed to get all wallets:', error);
      return [];
    }
  }

  /**
   * Get wallet by ID
   */
  async getWalletById(walletId: string): Promise<Wallet | null> {
    try {
      // Try to get from database first
      const wallet = await this.databaseService.getWalletById(walletId);
      if (wallet) {
        return wallet;
      }

      // Fallback to file system
      const walletPath = path.join(this.walletsDir, `${walletId}.json`);
      
      if (!await fs.pathExists(walletPath)) {
        return null;
      }

      const walletData = await fs.readJson(walletPath);
      const fileWallet = this.decryptWallet(walletData);
      
      // Save to database for future use
      try {
        await this.databaseService.createWallet(fileWallet);
      } catch (error) {
        // Wallet might already exist
        console.warn(`Wallet ${walletId} might already exist in database`);
      }
      
      return fileWallet;
    } catch (error) {
      console.error(`Failed to get wallet ${walletId}:`, error);
      return null;
    }
  }

  /**
   * Update wallet
   */
  async updateWallet(walletId: string, updates: Partial<Wallet>): Promise<Wallet | null> {
    try {
      // Update in database
      const updatedWallet = await this.databaseService.updateWallet(walletId, updates);
      if (updatedWallet) {
        // Also update in file system for backup
        await this.saveWallet(updatedWallet);
        return updatedWallet;
      }

      // Fallback to file system
      const wallet = await this.getWalletById(walletId);
      if (!wallet) {
        return null;
      }

      const fileUpdatedWallet: Wallet = {
        ...wallet,
        ...updates,
        updatedAt: new Date()
      };

      await this.saveWallet(fileUpdatedWallet);
      return fileUpdatedWallet;
    } catch (error) {
      console.error(`Failed to update wallet ${walletId}:`, error);
      return null;
    }
  }

  /**
   * Delete wallet
   */
  async deleteWallet(walletId: string): Promise<boolean> {
    try {
      // Delete from database
      const dbDeleted = await this.databaseService.deleteWallet(walletId);
      
      // Also delete from file system
      const walletPath = path.join(this.walletsDir, `${walletId}.json`);
      
      if (await fs.pathExists(walletPath)) {
        await fs.remove(walletPath);
      }

      return dbDeleted;
    } catch (error) {
      console.error(`Failed to delete wallet ${walletId}:`, error);
      return false;
    }
  }

  /**
   * Export wallet
   */
  async exportWallet(walletId: string): Promise<WalletExport | null> {
    try {
      const wallet = await this.getWalletById(walletId);
      if (!wallet) {
        return null;
      }

      return {
        walletId: wallet.walletId,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic,
        network: wallet.network,
        symbol: wallet.symbol,
        label: wallet.label,
        createdAt: wallet.createdAt
      };
    } catch (error) {
      console.error(`Failed to export wallet ${walletId}:`, error);
      return null;
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(): Promise<WalletStats> {
    try {
      const wallets = await this.getAllWallets();
      const networks = new Set(wallets.map(w => w.network));
      const symbols = new Set(wallets.map(w => w.symbol));
      
      const totalBalance: Record<string, string> = {};
      
      // Calculate total balance for each symbol
      for (const wallet of wallets) {
        const symbol = wallet.symbol;
        const balance = wallet.balance || '0';
        
        if (!totalBalance[symbol]) {
          totalBalance[symbol] = '0';
        }
        
        // Simple string addition for balance calculation
        totalBalance[symbol] = this.addStrings(totalBalance[symbol], balance);
      }

      return {
        totalWallets: wallets.length,
        totalNetworks: networks.size,
        totalSymbols: symbols.size,
        totalBalance,
        recentTransactions: 0, // Will be calculated by transaction monitor
        activeMonitors: 0 // Will be calculated by transaction monitor
      };
    } catch (error) {
      console.error('Failed to get wallet stats:', error);
      return {
        totalWallets: 0,
        totalNetworks: 0,
        totalSymbols: 0,
        totalBalance: {},
        recentTransactions: 0,
        activeMonitors: 0
      };
    }
  }

  /**
   * Backup all wallets
   */
  async backupWallets(): Promise<string> {
    try {
      const wallets = await this.getAllWallets();
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        wallets: wallets.map(w => ({
          walletId: w.walletId,
          address: w.address,
          privateKey: w.privateKey,
          mnemonic: w.mnemonic,
          network: w.network,
          symbol: w.symbol,
          label: w.label,
          createdAt: w.createdAt.toISOString(),
          isTestnet: w.isTestnet
        }))
      };

      const backupPath = path.join(this.walletsDir, `backup_${Date.now()}.json`);
      const encryptedBackup = this.encryptData(JSON.stringify(backupData));
      
      await fs.writeFile(backupPath, encryptedBackup);
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to backup wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore wallets from backup
   */
  async restoreWallets(backupPath: string): Promise<number> {
    try {
      if (!await fs.pathExists(backupPath)) {
        throw new Error('Backup file not found');
      }

      const encryptedData = await fs.readFile(backupPath, 'utf8');
      const decryptedData = this.decryptData(encryptedData);
      const backupData = JSON.parse(decryptedData);

      let restoredCount = 0;
      for (const walletData of backupData.wallets) {
        try {
          const wallet: Wallet = {
            ...walletData,
            createdAt: new Date(walletData.createdAt),
            updatedAt: new Date()
          };

          await this.saveWallet(wallet);
          restoredCount++;
        } catch (error) {
          console.error(`Failed to restore wallet ${walletData.walletId}:`, error);
        }
      }

      return restoredCount;
    } catch (error) {
      throw new Error(`Failed to restore wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync wallet balances
   */
  async syncWalletBalances(): Promise<void> {
    try {
      const wallets = await this.getAllWallets();
      
      for (const wallet of wallets) {
        try {
          const balance = await this.tatumService.getWalletBalance(
            wallet.address,
            wallet.symbol,
            wallet.network
          );

          await this.updateWallet(wallet.walletId, {
            balance,
            lastSync: new Date()
          });
        } catch (error) {
          console.error(`Failed to sync balance for wallet ${wallet.walletId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync wallet balances:', error);
    }
  }

  /**
   * Save wallet to file system
   */
  private async saveWallet(wallet: Wallet): Promise<void> {
    const walletPath = path.join(this.walletsDir, `${wallet.walletId}.json`);
    const encryptedWallet = this.encryptWallet(wallet);
    await fs.writeJson(walletPath, encryptedWallet, { spaces: 2 });
  }

  /**
   * Encrypt wallet data
   */
  private encryptWallet(wallet: Wallet): any {
    const walletData = {
      ...wallet,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
      lastSync: wallet.lastSync?.toISOString()
    };

    return {
      encrypted: this.encryptData(JSON.stringify(walletData)),
      version: '1.0.0'
    };
  }

  /**
   * Decrypt wallet data
   */
  private decryptWallet(encryptedData: any): Wallet {
    const decryptedData = this.decryptData(encryptedData.encrypted);
    const walletData = JSON.parse(decryptedData);

    return {
      ...walletData,
      createdAt: new Date(walletData.createdAt),
      updatedAt: new Date(walletData.updatedAt),
      lastSync: walletData.lastSync ? new Date(walletData.lastSync) : undefined
    };
  }

  /**
   * Encrypt data
   */
  private encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32));
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Store IV with encrypted data (hex:iv:encrypted)
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt data
   */
  private decryptData(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) throw new Error('Invalid encrypted data format');
    const [ivHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Ensure wallets directory exists
   */
  private async ensureWalletsDirectory(): Promise<void> {
    await fs.ensureDir(this.walletsDir);
  }

  /**
   * Add two string numbers
   */
  private addStrings(a: string, b: string): string {
    const numA = parseFloat(a) || 0;
    const numB = parseFloat(b) || 0;
    return (numA + numB).toString();
  }
} 