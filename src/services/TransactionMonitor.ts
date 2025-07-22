import { TransactionMonitor, Transaction, MonitorRequest, WebhookPayload } from '../types';
import { TatumService } from './TatumService';
import { DatabaseService } from './DatabaseService';
import * as crypto from 'crypto';

export class TransactionMonitorService {
  private tatumService: TatumService;
  private databaseService: DatabaseService;
  private webhookUrl: string;

  constructor(tatumService: TatumService, databaseService: DatabaseService, webhookUrl?: string) {
    this.tatumService = tatumService;
    this.databaseService = databaseService;
    this.webhookUrl = webhookUrl || 'https://webhook.site/your-unique-url';
  }

  /**
   * Start monitoring a wallet for transactions
   */
  async startMonitoring(walletId: string, request: MonitorRequest): Promise<TransactionMonitor> {
    try {
      // Get wallet from database
      const wallet = await this.databaseService.getWalletById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Generate monitoring ID
      const monitoringId = this.generateMonitoringId(wallet.address, wallet.network);

      // Check if monitoring already exists
      const existingMonitor = await this.databaseService.getMonitorById(monitoringId);
      if (existingMonitor) {
        throw new Error('Monitoring already exists for this wallet');
      }

      // Create monitor record
      const monitor: TransactionMonitor = {
        monitoringId,
        walletId,
        address: wallet.address,
        network: wallet.network,
        symbol: wallet.symbol,
        webhookUrl: request.webhookUrl || this.webhookUrl,
        monitorIncoming: request.monitorIncoming ?? true,
        monitorOutgoing: request.monitorOutgoing ?? true,
        minAmount: request.minAmount,
        isActive: true,
        createdAt: new Date(),
        transactionCount: 0
      };

      // Save to database
      const savedMonitor = await this.databaseService.createMonitor(monitor);

      // Register webhook with Tatum (mock implementation)
      await this.registerTatumWebhook(savedMonitor);

      console.log(`✅ Started monitoring wallet ${wallet.address} on ${wallet.network}`);

      return savedMonitor;
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      throw error;
    }
  }

  /**
   * Stop monitoring a wallet
   */
  async stopMonitoring(monitoringId: string): Promise<boolean> {
    try {
      const monitor = await this.databaseService.getMonitorById(monitoringId);
      if (!monitor) {
        throw new Error('Monitor not found');
      }

      // Update monitor status
      await this.databaseService.updateMonitor(monitoringId, {
        isActive: false
      });

      // Unregister webhook from Tatum (mock implementation)
      await this.unregisterTatumWebhook(monitor);

      console.log(`🛑 Stopped monitoring ${monitor.address}`);

      return true;
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
      return false;
    }
  }

  /**
   * Get monitoring status
   */
  async getMonitoringStatus(monitoringId: string): Promise<TransactionMonitor | null> {
    try {
      return await this.databaseService.getMonitorById(monitoringId);
    } catch (error) {
      console.error('Failed to get monitoring status:', error);
      return null;
    }
  }

  /**
   * Get all active monitors
   */
  async getAllMonitors(): Promise<TransactionMonitor[]> {
    try {
      const monitors = await this.databaseService.getAllMonitors();
      return monitors.filter(monitor => monitor.isActive);
    } catch (error) {
      console.error('Failed to get all monitors:', error);
      return [];
    }
  }

  /**
   * Get transactions for a specific monitor
   */
  async getMonitorTransactions(monitoringId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      const monitor = await this.databaseService.getMonitorById(monitoringId);
      if (!monitor) {
        throw new Error('Monitor not found');
      }

      return await this.databaseService.getTransactionsByWalletId(monitor.walletId, limit);
    } catch (error) {
      console.error('Failed to get monitor transactions:', error);
      return [];
    }
  }

  /**
   * Update monitoring settings
   */
  async updateMonitoringSettings(monitoringId: string, updates: Partial<MonitorRequest>): Promise<TransactionMonitor | null> {
    try {
      const monitor = await this.databaseService.getMonitorById(monitoringId);
      if (!monitor) {
        throw new Error('Monitor not found');
      }

      const updateData: Partial<TransactionMonitor> = {};

      if (updates.webhookUrl !== undefined) {
        updateData.webhookUrl = updates.webhookUrl;
      }
      if (updates.monitorIncoming !== undefined) {
        updateData.monitorIncoming = updates.monitorIncoming;
      }
      if (updates.monitorOutgoing !== undefined) {
        updateData.monitorOutgoing = updates.monitorOutgoing;
      }
      if (updates.minAmount !== undefined) {
        updateData.minAmount = updates.minAmount;
      }

      return await this.databaseService.updateMonitor(monitoringId, updateData);
    } catch (error) {
      console.error('Failed to update monitoring settings:', error);
      return null;
    }
  }

  /**
   * Process incoming webhook from Tatum
   */
  async processWebhook(payload: any): Promise<void> {
    try {
      console.log('📥 Received webhook from Tatum:', payload);

      // Extract transaction data from webhook payload
      const transaction = this.extractTransactionFromWebhook(payload);
      if (!transaction) {
        console.warn('Invalid webhook payload received');
        return;
      }

      // Find the monitor for this transaction
      const monitors = await this.getAllMonitors();
      const relevantMonitor = monitors.find(monitor => 
        monitor.address === transaction.address || 
        monitor.address === transaction.fromAddress || 
        monitor.address === transaction.toAddress
      );

      if (!relevantMonitor) {
        console.warn('No monitor found for transaction:', transaction.txId);
        return;
      }

      // Check if transaction meets monitoring criteria
      if (!this.meetsMonitoringCriteria(transaction, relevantMonitor)) {
        console.log('Transaction does not meet monitoring criteria:', transaction.txId);
        return;
      }

      // Save transaction to database
      transaction.walletId = relevantMonitor.walletId;
      await this.databaseService.createTransaction(transaction);

      // Update monitor transaction count
      await this.databaseService.updateMonitor(relevantMonitor.monitoringId, {
        transactionCount: relevantMonitor.transactionCount + 1,
        lastCheck: new Date()
      });

      // Send webhook alert
      await this.sendWebhookAlert(relevantMonitor, transaction);

      console.log(`✅ Processed transaction ${transaction.txId} for monitor ${relevantMonitor.monitoringId}`);
    } catch (error) {
      console.error('Failed to process webhook:', error);
    }
  }

  /**
   * Get monitoring statistics
   */
  async getMonitoringStats(): Promise<any> {
    try {
      const monitors = await this.getAllMonitors();
      const totalMonitors = monitors.length;
      const activeMonitors = monitors.filter(m => m.isActive).length;
      
      const totalTransactions = monitors.reduce((sum, monitor) => sum + monitor.transactionCount, 0);
      
      const last24Hours = monitors.filter(m => {
        const lastCheck = m.lastCheck;
        if (!lastCheck) return false;
        const hoursDiff = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 24;
      }).length;

      const networks: Record<string, number> = {};
      monitors.forEach(monitor => {
        networks[monitor.network] = (networks[monitor.network] || 0) + 1;
      });

      return {
        totalMonitors,
        activeMonitors,
        totalTransactions,
        last24Hours,
        networks
      };
    } catch (error) {
      console.error('Failed to get monitoring stats:', error);
      return {
        totalMonitors: 0,
        activeMonitors: 0,
        totalTransactions: 0,
        last24Hours: 0,
        networks: {}
      };
    }
  }

  /**
   * Manual transaction check (for testing)
   */
  async checkTransactions(monitoringId: string): Promise<Transaction[]> {
    try {
      const monitor = await this.databaseService.getMonitorById(monitoringId);
      if (!monitor) {
        throw new Error('Monitor not found');
      }

      // Get recent transactions from Tatum API
      const transactions = await this.tatumService.getTransactionHistory(
        monitor.address,
        monitor.symbol,
        10
      );

      // Process and save new transactions
      const newTransactions: Transaction[] = [];
      for (const tx of transactions) {
        const transaction = this.mapTatumTransaction(tx, monitor.walletId);
        
        // Check if transaction already exists
        const existing = await this.databaseService.getTransactionsByWalletId(monitor.walletId, 100);
        const exists = existing.some(t => t.txId === transaction.txId);
        
        if (!exists) {
          await this.databaseService.createTransaction(transaction);
          newTransactions.push(transaction);
        }
      }

      // Update monitor
      await this.databaseService.updateMonitor(monitoringId, {
        transactionCount: monitor.transactionCount + newTransactions.length,
        lastCheck: new Date()
      });

      return newTransactions;
    } catch (error) {
      console.error('Failed to check transactions:', error);
      return [];
    }
  }

  // Private helper methods
  private generateMonitoringId(address: string, network: string): string {
    const hash = crypto.createHash('sha256').update(`${address}_${network}_${Date.now()}`).digest('hex');
    return `monitor_${hash.slice(0, 16)}`;
  }

  private async registerTatumWebhook(monitor: TransactionMonitor): Promise<void> {
    // In a real implementation, this would call Tatum API to register webhook
    console.log(`🔗 Registered webhook for ${monitor.address} on ${monitor.network}`);
  }

  private async unregisterTatumWebhook(monitor: TransactionMonitor): Promise<void> {
    // In a real implementation, this would call Tatum API to unregister webhook
    console.log(`🔗 Unregistered webhook for ${monitor.address} on ${monitor.network}`);
  }

  private extractTransactionFromWebhook(payload: any): Transaction | null {
    try {
      // This is a mock implementation - in real scenario, parse actual Tatum webhook format
      return {
        txId: payload.txId || `tx_${Date.now()}`,
        walletId: '', // Will be set later
        address: payload.address,
        network: payload.network,
        symbol: payload.symbol,
        type: payload.type || 'INCOMING',
        amount: payload.amount || '0',
        fee: payload.fee,
        status: payload.status || 'CONFIRMED',
        blockNumber: payload.blockNumber,
        timestamp: new Date(payload.timestamp || Date.now()),
        fromAddress: payload.fromAddress,
        toAddress: payload.toAddress,
        hash: payload.hash
      };
    } catch (error) {
      console.error('Failed to extract transaction from webhook:', error);
      return null;
    }
  }

  private meetsMonitoringCriteria(transaction: Transaction, monitor: TransactionMonitor): boolean {
    // Check transaction type
    if (transaction.type === 'INCOMING' && !monitor.monitorIncoming) {
      return false;
    }
    if (transaction.type === 'OUTGOING' && !monitor.monitorOutgoing) {
      return false;
    }

    // Check minimum amount
    if (monitor.minAmount) {
      const txAmount = parseFloat(transaction.amount);
      const minAmount = parseFloat(monitor.minAmount);
      if (txAmount < minAmount) {
        return false;
      }
    }

    return true;
  }

  private async sendWebhookAlert(monitor: TransactionMonitor, transaction: Transaction): Promise<void> {
    try {
      if (!monitor.webhookUrl) {
        return;
      }

      const alertPayload: WebhookPayload = {
        type: transaction.type === 'INCOMING' ? 'TRANSACTION_RECEIVED' : 'TRANSACTION_SENT',
        data: transaction,
        timestamp: new Date(),
        signature: this.generateWebhookSignature(transaction)
      };

      const response = await fetch(monitor.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': alertPayload.signature || ''
        },
        body: JSON.stringify(alertPayload)
      });

      if (!response.ok) {
        console.error(`Failed to send webhook alert: ${response.statusText}`);
      } else {
        console.log(`📤 Sent webhook alert to ${monitor.webhookUrl}`);
      }
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private generateWebhookSignature(transaction: Transaction): string {
    const data = `${transaction.txId}_${transaction.amount}_${transaction.timestamp.getTime()}`;
    return crypto.createHmac('sha256', 'webhook_secret').update(data).digest('hex');
  }

  private mapTatumTransaction(tatumTx: any, walletId: string): Transaction {
    return {
      txId: tatumTx.txId || `tx_${Date.now()}`,
      walletId,
      address: tatumTx.address,
      network: tatumTx.network,
      symbol: tatumTx.symbol,
      type: tatumTx.type || 'INCOMING',
      amount: tatumTx.amount || '0',
      fee: tatumTx.fee,
      status: tatumTx.status || 'CONFIRMED',
      blockNumber: tatumTx.blockNumber,
      timestamp: new Date(tatumTx.timestamp || Date.now()),
      fromAddress: tatumTx.fromAddress,
      toAddress: tatumTx.toAddress,
      hash: tatumTx.hash
    };
  }
} 