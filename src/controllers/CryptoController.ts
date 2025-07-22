import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { CurrencyNetworkMapper } from '../services/CurrencyNetworkMapper';

export class CryptoController {
  /**
   * Health check endpoint
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Crypto management system is healthy',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get all supported symbols
   */
  static async getAllSymbols(req: Request, res: Response): Promise<void> {
    try {
      const symbols = CurrencyNetworkMapper.getAllSymbols();
      
      const response: ApiResponse<string[]> = {
        success: true,
        data: symbols,
        message: 'All supported symbols retrieved successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve symbols',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get all supported networks
   */
  static async getAllNetworks(req: Request, res: Response): Promise<void> {
    try {
      const networks = CurrencyNetworkMapper.getAllNetworks();
      
      const response: ApiResponse = {
        success: true,
        data: networks,
        message: 'All supported networks retrieved successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve networks',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get networks for a specific symbol
   */
  static async getNetworksForSymbol(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        const response: ApiResponse = {
          success: false,
          message: 'Symbol parameter is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const networks = CurrencyNetworkMapper.getNetworksForSymbol(symbol);
      
      const response: ApiResponse = {
        success: true,
        data: networks,
        message: networks.length > 0 ? 'Networks found' : 'No networks found for this symbol',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve networks for symbol',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get network information
   */
  static async getNetworkInfo(req: Request, res: Response): Promise<void> {
    try {
      const { network } = req.params;
      
      if (!network) {
        const response: ApiResponse = {
          success: false,
          message: 'Network parameter is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const networkInfo = CurrencyNetworkMapper.getNetworkById(network);
      
      if (!networkInfo) {
        const response: ApiResponse = {
          success: false,
          message: 'Network not found',
          timestamp: new Date()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: networkInfo,
        message: 'Network information retrieved successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve network information',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Search for currencies
   */
  static async searchCurrencies(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        const response: ApiResponse = {
          success: false,
          message: 'Symbol parameter is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const currencies = CurrencyNetworkMapper.searchCurrencies(symbol);
      
      const response: ApiResponse = {
        success: true,
        data: currencies,
        message: currencies.length > 0 ? 'Search completed successfully' : 'No currencies found',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to search currencies',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get detailed currency information
   */
  static async getCurrencyInfo(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        const response: ApiResponse = {
          success: false,
          message: 'Symbol parameter is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const currencyInfo = CurrencyNetworkMapper.getCurrencyInfo(symbol);
      
      if (!currencyInfo) {
        const response: ApiResponse = {
          success: false,
          message: 'Currency not found',
          timestamp: new Date()
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: currencyInfo,
        message: 'Currency information retrieved successfully',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve currency information',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Validate currency-network pair
   */
  static async validateCurrencyNetworkPair(req: Request, res: Response): Promise<void> {
    try {
      const { symbol, network } = req.params;
      
      if (!symbol || !network) {
        const response: ApiResponse = {
          success: false,
          message: 'Both symbol and network parameters are required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const validation = CurrencyNetworkMapper.validateCurrencyNetworkPair(symbol, network);
      
      const response: ApiResponse = {
        success: true,
        data: validation,
        message: validation.isValid ? 'Currency-network pair is valid' : 'Currency-network pair is invalid',
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to validate currency-network pair',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }

  /**
   * Get networks by tier
   */
  static async getNetworksByTier(req: Request, res: Response): Promise<void> {
    try {
      const { tier } = req.params;
      const tierNumber = parseInt(tier || '0');
      
      if (!tier || isNaN(tierNumber) || tierNumber < 1 || tierNumber > 3) {
        const response: ApiResponse = {
          success: false,
          message: 'Valid tier parameter (1, 2, or 3) is required',
          timestamp: new Date()
        };
        res.status(400).json(response);
        return;
      }

      const networks = CurrencyNetworkMapper.getNetworksByTier(tierNumber as 1 | 2 | 3);
      
      const response: ApiResponse = {
        success: true,
        data: networks,
        message: `Networks for tier ${tier} retrieved successfully`,
        timestamp: new Date()
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve networks by tier',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };

      res.status(500).json(response);
    }
  }
} 