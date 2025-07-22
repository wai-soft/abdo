import app from './app';
import { TatumService } from './services/TatumService';
import { WalletManager } from './services/WalletManager';
import { DatabaseService } from './services/DatabaseService';
import { TransactionMonitorService } from './services/TransactionMonitor';
import { WalletController } from './controllers/WalletController';
import { MonitorController } from './controllers/MonitorController';
import * as path from 'path';
import * as fs from 'fs-extra';

// Load environment variables
const port = process.env.PORT || 3000;
const tatumApiKey = process.env.TATUM_API_KEY;
const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars';

// Validate required environment variables
if (!tatumApiKey) {
  console.error('TATUM_API_KEY is required in environment variables');
  process.exit(1);
}

// Initialize services
const tatumService = new TatumService(tatumApiKey);
const databaseService = new DatabaseService();
const walletsDir = path.join(process.cwd(), 'wallets');
const walletManager = new WalletManager(tatumService, databaseService, walletsDir, encryptionKey);
const monitorService = new TransactionMonitorService(tatumService, databaseService);

// Set services in controllers
WalletController.setWalletManager(walletManager);
MonitorController.setMonitorService(monitorService);

// Ensure required directories exist
async function ensureDirectories(): Promise<void> {
  try {
    await fs.ensureDir(walletsDir);
    await fs.ensureDir(path.join(process.cwd(), 'monitoring'));
    await fs.ensureDir(path.join(process.cwd(), 'logs'));
    console.log('Directories created successfully');
  } catch (error) {
    console.error('Failed to create directories:', error);
  }
}

// Test Tatum API connection
async function testTatumConnection(): Promise<void> {
  try {
    const isConnected = await tatumService.testConnection();
    if (isConnected) {
      console.log('✅ Tatum API connection successful');
    } else {
      console.warn('⚠️  Tatum API connection failed');
    }
  } catch (error) {
    console.error('❌ Tatum API connection error:', error);
  }
}

// Start server
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await databaseService.connect();
    
    // Ensure directories exist
    await ensureDirectories();
    
    // Test Tatum connection
    await testTatumConnection();
    
    // Start the server
    app.listen(port, () => {
      console.log(`🚀 Cryptocurrency Management System started on port ${port}`);
      console.log(`📊 API Documentation: http://localhost:${port}`);
      console.log(`🔗 Health Check: http://localhost:${port}/health`);
      console.log(`💼 Crypto Endpoints: http://localhost:${port}/api/crypto`);
      console.log(`👛 Wallet Endpoints: http://localhost:${port}/api/wallet`);
      console.log(`📡 Monitor Endpoints: http://localhost:${port}/api/monitor`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer(); 