import { Router } from 'express';
import { WalletController } from '../controllers/WalletController';

const router = Router();

// Create a new wallet
router.post('/create', WalletController.createWallet);

// Get all wallets
router.get('/list', WalletController.getAllWallets);

// Get wallet by ID
router.get('/:walletId', WalletController.getWalletById);

// Delete wallet
router.delete('/:walletId', WalletController.deleteWallet);

// Import wallet
router.post('/import', WalletController.importWallet);

// Export wallet
router.get('/:walletId/export', WalletController.exportWallet);

// Get wallet statistics
router.get('/stats', WalletController.getWalletStats);

// Backup all wallets
router.post('/backup', WalletController.backupWallets);

// Restore wallets from backup
router.post('/restore', WalletController.restoreWallets);

// Sync wallet balances
router.post('/sync-balances', WalletController.syncWalletBalances);

export default router; 