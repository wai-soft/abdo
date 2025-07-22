import { Router } from 'express';
import { CryptoController } from '../controllers/CryptoController';

const router = Router();

// Health check
router.get('/health', CryptoController.healthCheck);

// Get all supported symbols
router.get('/symbols', CryptoController.getAllSymbols);

// Get all supported networks
router.get('/networks', CryptoController.getAllNetworks);

// Get networks for a specific symbol
router.get('/networks/:symbol', CryptoController.getNetworksForSymbol);

// Get network information
router.get('/network/:network', CryptoController.getNetworkInfo);

// Search for currencies
router.get('/search/:symbol', CryptoController.searchCurrencies);

// Get detailed currency information
router.get('/currency/:symbol', CryptoController.getCurrencyInfo);

// Validate currency-network pair
router.get('/validate/:symbol/:network', CryptoController.validateCurrencyNetworkPair);

// Get networks by tier
router.get('/networks/tier/:tier', CryptoController.getNetworksByTier);

export default router; 