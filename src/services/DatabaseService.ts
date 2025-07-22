import { PrismaClient } from '@prisma/client';
import { logger } from './Logger';
import config from '../config';

export class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.url
        }
      },
      log: [
        {
          emit: 'event',
          level: 'query'
        },
        {
          emit: 'event',
          level: 'error'
        },
        {
          emit: 'event',
          level: 'info'
        },
        {
          emit: 'event',
          level: 'warn'
        }
      ]
    });

    // Log database events
    this.setupLogging();
  }

  private setupLogging() {
    this.prisma.$on('query', (e: any) => {
      logger.debug('Database query', {
        query: e.query,
        params: e.params,
        duration: e.duration
      });
    });

    this.prisma.$on('error', (e: any) => {
      logger.error('Database error', e);
    });

    this.prisma.$on('info', (e: any) => {
      logger.info('Database info', e);
    });

    this.prisma.$on('warn', (e: any) => {
      logger.warn('Database warning', e);
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Get Prisma client instance
   */
  public getClient(): PrismaClient {
    return this.prisma;
  }

  /**
   * Connect to database
   */
  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('Connected to database successfully');
    } catch (error) {
      logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Disconnected from database successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database', error);
      throw error;
    }
  }

  /**
   * Create wallet
   */
  public async createWallet(data: any): Promise<any> {
    try {
      return await this.prisma.wallet.create({
        data
      });
    } catch (error) {
      logger.error('Failed to create wallet', error);
      throw error;
    }
  }

  /**
   * Get wallet by ID
   */
  public async getWalletById(id: string): Promise<any | null> {
    try {
      return await this.prisma.wallet.findUnique({
        where: { id },
        include: {
          transactions: true,
          monitors: true
        }
      });
    } catch (error) {
      logger.error('Failed to get wallet', error);
      throw error;
    }
  }

  /**
   * Get all wallets
   */
  public async getAllWallets(): Promise<any[]> {
    try {
      return await this.prisma.wallet.findMany({
        include: {
          transactions: true,
          monitors: true
        }
      });
    } catch (error) {
      logger.error('Failed to get all wallets', error);
      throw error;
    }
  }

  /**
   * Update wallet
   */
  public async updateWallet(id: string, data: any): Promise<any> {
    try {
      return await this.prisma.wallet.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Failed to update wallet', error);
      throw error;
    }
  }

  /**
   * Delete wallet
   */
  public async deleteWallet(id: string): Promise<boolean> {
    try {
      await this.prisma.wallet.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('Failed to delete wallet', error);
      return false;
    }
  }

  /**
   * Create transaction
   */
  public async createTransaction(data: any): Promise<any> {
    try {
      return await this.prisma.transaction.create({
        data
      });
    } catch (error) {
      logger.error('Failed to create transaction', error);
      throw error;
    }
  }

  /**
   * Get transactions by wallet ID
   */
  public async getTransactionsByWalletId(walletId: string, limit: number = 50): Promise<any[]> {
    try {
      return await this.prisma.transaction.findMany({
        where: { walletId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });
    } catch (error) {
      logger.error('Failed to get transactions', error);
      throw error;
    }
  }

  /**
   * Create monitor
   */
  public async createMonitor(data: any): Promise<any> {
    try {
      return await this.prisma.monitor.create({
        data
      });
    } catch (error) {
      logger.error('Failed to create monitor', error);
      throw error;
    }
  }

  /**
   * Get monitor by ID
   */
  public async getMonitorById(id: string): Promise<any | null> {
    try {
      return await this.prisma.monitor.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Failed to get monitor', error);
      throw error;
    }
  }

  /**
   * Get all monitors
   */
  public async getAllMonitors(): Promise<any[]> {
    try {
      return await this.prisma.monitor.findMany();
    } catch (error) {
      logger.error('Failed to get all monitors', error);
      throw error;
    }
  }

  /**
   * Update monitor
   */
  public async updateMonitor(id: string, data: any): Promise<any> {
    try {
      return await this.prisma.monitor.update({
        where: { id },
        data
      });
    } catch (error) {
      logger.error('Failed to update monitor', error);
      throw error;
    }
  }

  /**
   * Delete monitor
   */
  public async deleteMonitor(id: string): Promise<boolean> {
    try {
      await this.prisma.monitor.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      logger.error('Failed to delete monitor', error);
      return false;
    }
  }

  /**
   * Run database migration
   */
  public async migrate(): Promise<void> {
    try {
      // Note: This is just a placeholder. In production,
      // you should use the Prisma CLI to run migrations
      logger.info('Running database migration');
    } catch (error) {
      logger.error('Failed to run migration', error);
      throw error;
    }
  }

  /**
   * Check database health
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }
} 