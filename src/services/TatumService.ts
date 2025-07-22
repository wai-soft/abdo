import { Wallet, WalletCreateRequest, WalletImportRequest } from '../types';

export class TatumService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.tatum.io/v3';
  }

  /**
   * Create a new wallet for a specific currency and network
   */
  async createWallet(request: WalletCreateRequest): Promise<Wallet> {
    try {
      const { symbol, network, testnet = false, label = '' } = request;
      
      // Determine the network to use
      const targetNetwork = network || this.getDefaultNetwork(symbol);
      
      // For demo purposes, create a mock wallet
      // In production, you would use the actual Tatum API
      const mockWallet = this.createMockWallet(symbol, targetNetwork, testnet);
      
      const walletId = this.generateWalletId(symbol, targetNetwork, mockWallet.address);

      return {
        walletId,
        address: mockWallet.address,
        privateKey: mockWallet.privateKey,
        mnemonic: mockWallet.mnemonic,
        network: targetNetwork,
        symbol: symbol.toUpperCase(),
        label,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTestnet: testnet
      };
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import an existing wallet using private key
   */
  async importWallet(request: WalletImportRequest): Promise<Wallet> {
    try {
      const { symbol, network, privateKey, label = '', mnemonic } = request;

      // Validate the private key format
      if (!this.isValidPrivateKey(privateKey, symbol)) {
        throw new Error('Invalid private key format for the specified currency');
      }

      // Generate address from private key (simplified)
      const address = this.generateAddressFromPrivateKey(privateKey, symbol, network);

      const walletId = this.generateWalletId(symbol, network, address);

      return {
        walletId,
        address,
        privateKey,
        mnemonic,
        network,
        symbol: symbol.toUpperCase(),
        label,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTestnet: false // Imported wallets are assumed to be mainnet
      };
    } catch (error) {
      throw new Error(`Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string, symbol: string, network: string): Promise<string> {
    try {
      // For demo purposes, return a mock balance
      // In production, you would call the actual Tatum API
      return '0.00000000';
    } catch (error) {
      console.error(`Failed to get balance for ${address}:`, error);
      return '0';
    }
  }

  /**
   * Get transaction history for a wallet
   */
  async getTransactionHistory(address: string, symbol: string, limit: number = 50): Promise<any[]> {
    try {
      // For demo purposes, return empty array
      // In production, you would call the actual Tatum API
      return [];
    } catch (error) {
      console.error(`Failed to get transaction history for ${address}:`, error);
      return [];
    }
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    fromAddress: string,
    toAddress: string,
    amount: string,
    symbol: string,
    privateKey: string,
    network: string
  ): Promise<string> {
    try {
      // For demo purposes, return a mock transaction ID
      // In production, you would call the actual Tatum API
      return `mock_tx_${Date.now()}`;
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(txId: string, symbol: string): Promise<any> {
    try {
      // For demo purposes, return mock transaction data
      // In production, you would call the actual Tatum API
      return {
        txId,
        status: 'confirmed',
        amount: '0.00000000',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get transaction details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(network: string): Promise<any> {
    try {
      // For demo purposes, return mock network info
      // In production, you would call the actual Tatum API
      return {
        network,
        lastBlock: 1000000,
        status: 'active'
      };
    } catch (error) {
      console.error(`Failed to get network info for ${network}:`, error);
      return null;
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlock(network: string): Promise<number> {
    try {
      const info = await this.getNetworkInfo(network);
      return info?.lastBlock || 0;
    } catch (error) {
      console.error(`Failed to get current block for ${network}:`, error);
      return 0;
    }
  }

  /**
   * Validate address format
   */
  async validateAddress(address: string, symbol: string, network: string): Promise<boolean> {
    try {
      // For demo purposes, return true for valid-looking addresses
      // In production, you would call the actual Tatum API
      return address.length > 10;
    } catch (error) {
      console.error(`Failed to validate address ${address}:`, error);
      return false;
    }
  }

  /**
   * Get estimated transaction fee
   */
  async getTransactionFee(symbol: string, network: string): Promise<string> {
    try {
      // For demo purposes, return a mock fee
      // In production, you would call the actual Tatum API
      return '0.0001';
    } catch (error) {
      console.error(`Failed to get transaction fee for ${symbol}:`, error);
      return '0';
    }
  }

  /**
   * Generate address from private key
   */
  private generateAddressFromPrivateKey(privateKey: string, symbol: string, network: string): string {
    // For demo purposes, generate a mock address
    // In production, you would use proper cryptographic functions
    const hash = this.simpleHash(privateKey);
    return `${symbol.toLowerCase()}${hash.slice(0, 34)}`;
  }

  /**
   * Create mock wallet for demo purposes
   */
  private createMockWallet(symbol: string, network: string, testnet: boolean): any {
    const prefix = testnet ? 't' : '';
    const hash = this.simpleHash(`${symbol}${network}${Date.now()}`);
    
    return {
      address: `${prefix}${symbol.toLowerCase()}${hash.slice(0, 34)}`,
      privateKey: `mock_private_key_${hash.slice(0, 64)}`,
      mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
    };
  }

  /**
   * Simple hash function for demo purposes
   */
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Get default network for a currency
   */
  private getDefaultNetwork(symbol: string): string {
    const networkMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binance-smart-chain',
      'MATIC': 'polygon',
      'AVAX': 'avalanche',
      'SOL': 'solana',
      'ADA': 'cardano',
      'TRX': 'tron',
      'LTC': 'litecoin',
      'DOGE': 'dogecoin',
      'XRP': 'ripple',
      'XLM': 'stellar',
      'FTM': 'fantom',
      'TON': 'ton',
      'VET': 'vechain',
      'ZIL': 'zilliqa',
      'EOS': 'eos',
      'ALGO': 'algorand',
      'USDT': 'ethereum',
      'USDC': 'ethereum',
      'DAI': 'ethereum'
    };

    return networkMap[symbol.toUpperCase()] || 'ethereum';
  }

  /**
   * Get network currency symbol
   */
  private getNetworkCurrency(network: string): string {
    const currencyMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binance-smart-chain': 'BNB',
      'polygon': 'MATIC',
      'avalanche': 'AVAX',
      'solana': 'SOL',
      'cardano': 'ADA',
      'tron': 'TRX',
      'litecoin': 'LTC',
      'dogecoin': 'DOGE',
      'ripple': 'XRP',
      'stellar': 'XLM',
      'fantom': 'FTM',
      'ton': 'TON',
      'vechain': 'VET',
      'zilliqa': 'ZIL',
      'eos': 'EOS',
      'algorand': 'ALGO'
    };

    return currencyMap[network] || 'ETH';
  }

  /**
   * Validate private key format
   */
  private isValidPrivateKey(privateKey: string, symbol: string): boolean {
    // Basic validation - can be enhanced based on specific requirements
    if (!privateKey || privateKey.length < 32) {
      return false;
    }

    // Remove 0x prefix if present
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

    // Check if it's a valid hex string
    return /^[0-9a-fA-F]+$/.test(cleanKey);
  }

  /**
   * Generate unique wallet ID
   */
  private generateWalletId(symbol: string, network: string, address: string): string {
    const shortAddress = address.slice(0, 8);
    return `${symbol.toLowerCase()}_${network}_${shortAddress}`;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // For demo purposes, always return true
      // In production, you would test the actual Tatum API connection
      return true;
    } catch (error) {
      console.error('Tatum API connection test failed:', error);
      return false;
    }
  }
} 