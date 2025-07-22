import { Currency, Network, CurrencyNetworkPair } from '../types';

export class CurrencyNetworkMapper {
  private static readonly NETWORKS: Record<string, Network> = {
    // Tier 1 - High Performance Networks
    'bitcoin': {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      type: 'MAINNET',
      isActive: true,
      tier: 1,
      explorerUrl: 'https://blockstream.info'
    },
    'ethereum': {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      type: 'MAINNET',
      chainId: 1,
      isActive: true,
      tier: 1,
      explorerUrl: 'https://etherscan.io'
    },
    'binance-smart-chain': {
      id: 'binance-smart-chain',
      name: 'Binance Smart Chain',
      symbol: 'BNB',
      type: 'MAINNET',
      chainId: 56,
      isActive: true,
      tier: 1,
      explorerUrl: 'https://bscscan.com'
    },
    'polygon': {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      type: 'MAINNET',
      chainId: 137,
      isActive: true,
      tier: 1,
      explorerUrl: 'https://polygonscan.com'
    },
    'avalanche': {
      id: 'avalanche',
      name: 'Avalanche',
      symbol: 'AVAX',
      type: 'MAINNET',
      chainId: 43114,
      isActive: true,
      tier: 1,
      explorerUrl: 'https://snowtrace.io'
    },
    'solana': {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      type: 'MAINNET',
      isActive: true,
      tier: 1,
      explorerUrl: 'https://solscan.io'
    },
    'arbitrum-one': {
      id: 'arbitrum-one',
      name: 'Arbitrum One',
      symbol: 'ETH',
      type: 'MAINNET',
      chainId: 42161,
      isActive: true,
      tier: 1,
      explorerUrl: 'https://arbiscan.io'
    },
    'optimism': {
      id: 'optimism',
      name: 'Optimism',
      symbol: 'ETH',
      type: 'MAINNET',
      chainId: 10,
      isActive: true,
      tier: 1,
      explorerUrl: 'https://optimistic.etherscan.io'
    },
    'base': {
      id: 'base',
      name: 'Base',
      symbol: 'ETH',
      type: 'MAINNET',
      chainId: 8453,
      isActive: true,
      tier: 1,
      explorerUrl: 'https://basescan.org'
    },

    // Tier 2 - Stable Networks
    'cardano': {
      id: 'cardano',
      name: 'Cardano',
      symbol: 'ADA',
      type: 'MAINNET',
      isActive: true,
      tier: 2,
      explorerUrl: 'https://cardanoscan.io'
    },
    'tron': {
      id: 'tron',
      name: 'Tron',
      symbol: 'TRX',
      type: 'MAINNET',
      isActive: true,
      tier: 2,
      explorerUrl: 'https://tronscan.org'
    },
    'litecoin': {
      id: 'litecoin',
      name: 'Litecoin',
      symbol: 'LTC',
      type: 'MAINNET',
      isActive: true,
      tier: 2,
      explorerUrl: 'https://blockchair.com/litecoin'
    },
    'dogecoin': {
      id: 'dogecoin',
      name: 'Dogecoin',
      symbol: 'DOGE',
      type: 'MAINNET',
      isActive: true,
      tier: 2,
      explorerUrl: 'https://dogechain.info'
    },
    'ripple': {
      id: 'ripple',
      name: 'Ripple',
      symbol: 'XRP',
      type: 'MAINNET',
      isActive: true,
      tier: 2,
      explorerUrl: 'https://xrpscan.com'
    },
    'stellar': {
      id: 'stellar',
      name: 'Stellar',
      symbol: 'XLM',
      type: 'MAINNET',
      isActive: true,
      tier: 2,
      explorerUrl: 'https://stellar.expert'
    },
    'fantom': {
      id: 'fantom',
      name: 'Fantom',
      symbol: 'FTM',
      type: 'MAINNET',
      chainId: 250,
      isActive: true,
      tier: 2,
      explorerUrl: 'https://ftmscan.com'
    },

    // Tier 3 - Specialized Networks
    'ton': {
      id: 'ton',
      name: 'The Open Network',
      symbol: 'TON',
      type: 'MAINNET',
      isActive: true,
      tier: 3,
      explorerUrl: 'https://tonscan.org'
    },
    'vechain': {
      id: 'vechain',
      name: 'VeChain',
      symbol: 'VET',
      type: 'MAINNET',
      chainId: 1,
      isActive: true,
      tier: 3,
      explorerUrl: 'https://explore.vechain.org'
    },
    'zilliqa': {
      id: 'zilliqa',
      name: 'Zilliqa',
      symbol: 'ZIL',
      type: 'MAINNET',
      chainId: 1,
      isActive: true,
      tier: 3,
      explorerUrl: 'https://viewblock.io/zilliqa'
    },
    'eos': {
      id: 'eos',
      name: 'EOS',
      symbol: 'EOS',
      type: 'MAINNET',
      isActive: true,
      tier: 3,
      explorerUrl: 'https://eos.eosq.eosnation.io'
    },
    'algorand': {
      id: 'algorand',
      name: 'Algorand',
      symbol: 'ALGO',
      type: 'MAINNET',
      isActive: true,
      tier: 3,
      explorerUrl: 'https://algoexplorer.io'
    }
  };

  private static readonly CURRENCY_NETWORK_MAP: Record<string, string[]> = {
    'BTC': ['bitcoin'],
    'ETH': ['ethereum', 'arbitrum-one', 'optimism', 'base'],
    'BNB': ['binance-smart-chain'],
    'MATIC': ['polygon'],
    'AVAX': ['avalanche'],
    'SOL': ['solana'],
    'ADA': ['cardano'],
    'TRX': ['tron'],
    'LTC': ['litecoin'],
    'DOGE': ['dogecoin'],
    'XRP': ['ripple'],
    'XLM': ['stellar'],
    'FTM': ['fantom'],
    'TON': ['ton'],
    'VET': ['vechain'],
    'ZIL': ['zilliqa'],
    'EOS': ['eos'],
    'ALGO': ['algorand'],
    'USDT': ['ethereum', 'tron', 'binance-smart-chain', 'polygon', 'avalanche', 'arbitrum-one', 'optimism'],
    'USDC': ['ethereum', 'binance-smart-chain', 'polygon', 'avalanche', 'arbitrum-one', 'optimism'],
    'DAI': ['ethereum', 'binance-smart-chain', 'polygon', 'avalanche'],
    'LINK': ['ethereum', 'binance-smart-chain', 'polygon'],
    'UNI': ['ethereum', 'binance-smart-chain', 'polygon'],
    'AAVE': ['ethereum', 'binance-smart-chain', 'polygon'],
    'COMP': ['ethereum', 'binance-smart-chain'],
    'MKR': ['ethereum', 'binance-smart-chain'],
    'YFI': ['ethereum', 'binance-smart-chain'],
    'CRV': ['ethereum', 'binance-smart-chain', 'polygon'],
    'SUSHI': ['ethereum', 'binance-smart-chain', 'polygon'],
    '1INCH': ['ethereum', 'binance-smart-chain', 'polygon'],
    'BAL': ['ethereum', 'binance-smart-chain'],
    'SNX': ['ethereum', 'binance-smart-chain', 'polygon'],
    'REN': ['ethereum', 'binance-smart-chain'],
    'BAND': ['ethereum', 'binance-smart-chain'],
    'UMA': ['ethereum', 'binance-smart-chain'],
    'ZRX': ['ethereum', 'binance-smart-chain'],
    'KNC': ['ethereum', 'binance-smart-chain'],
    'BAT': ['ethereum', 'binance-smart-chain'],
    'REP': ['ethereum', 'binance-smart-chain'],
    'ZEC': ['ethereum', 'binance-smart-chain'],
    'DASH': ['ethereum', 'binance-smart-chain'],
    'XMR': ['ethereum', 'binance-smart-chain'],
    'BCH': ['ethereum', 'binance-smart-chain'],
    'BSV': ['ethereum', 'binance-smart-chain'],
    'ETC': ['ethereum', 'binance-smart-chain'],
    'XEM': ['ethereum', 'binance-smart-chain'],
    'NEO': ['ethereum', 'binance-smart-chain'],
    'QTUM': ['ethereum', 'binance-smart-chain'],
    'WAVES': ['ethereum', 'binance-smart-chain'],
    'OMG': ['ethereum', 'binance-smart-chain'],
    'ICX': ['ethereum', 'binance-smart-chain'],
    'AION': ['ethereum', 'binance-smart-chain'],
    'ZEN': ['ethereum', 'binance-smart-chain'],
    'IOTA': ['ethereum', 'binance-smart-chain'],
    'NANO': ['ethereum', 'binance-smart-chain'],
    'ONT': ['ethereum', 'binance-smart-chain'],
    'ATOM': ['ethereum', 'binance-smart-chain'],
    'DOT': ['ethereum', 'binance-smart-chain']
  };

  /**
   * Get all supported networks for a currency symbol
   */
  static getNetworksForSymbol(symbol: string): string[] {
    const upperSymbol = symbol.toUpperCase();
    return this.CURRENCY_NETWORK_MAP[upperSymbol] || [];
  }

  /**
   * Get detailed currency information
   */
  static getCurrencyInfo(symbol: string): Currency | null {
    const upperSymbol = symbol.toUpperCase();
    const networks = this.getNetworksForSymbol(upperSymbol);
    
    if (networks.length === 0) {
      return null;
    }

    return {
      symbol: upperSymbol,
      name: this.getCurrencyName(upperSymbol),
      networks,
      primaryNetwork: networks[0] || '',
      isMultiChain: networks.length > 1,
      decimals: this.getCurrencyDecimals(upperSymbol)
    };
  }

  /**
   * Validate if a currency-network pair is supported
   */
  static validateCurrencyNetworkPair(symbol: string, network: string): CurrencyNetworkPair {
    const upperSymbol = symbol.toUpperCase();
    const networks = this.getNetworksForSymbol(upperSymbol);
    const isValid = networks.includes(network);
    const supported = networks.length > 0;

    return {
      symbol: upperSymbol,
      network,
      isValid,
      supported
    };
  }

  /**
   * Get all supported networks
   */
  static getAllNetworks(): Network[] {
    return Object.values(this.NETWORKS);
  }

  /**
   * Get network by ID
   */
  static getNetworkById(networkId: string): Network | null {
    return this.NETWORKS[networkId] || null;
  }

  /**
   * Get all supported currency symbols
   */
  static getAllSymbols(): string[] {
    return Object.keys(this.CURRENCY_NETWORK_MAP);
  }

  /**
   * Get networks by tier
   */
  static getNetworksByTier(tier: 1 | 2 | 3): Network[] {
    return Object.values(this.NETWORKS).filter(network => network.tier === tier);
  }

  /**
   * Search for currencies with partial symbol match
   */
  static searchCurrencies(query: string): Currency[] {
    const upperQuery = query.toUpperCase();
    const results: Currency[] = [];

    for (const symbol of Object.keys(this.CURRENCY_NETWORK_MAP)) {
      if (symbol.includes(upperQuery)) {
        const currency = this.getCurrencyInfo(symbol);
        if (currency) {
          results.push(currency);
        }
      }
    }

    return results;
  }

  /**
   * Get currency name
   */
  private static getCurrencyName(symbol: string): string {
    const names: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'Binance Coin',
      'MATIC': 'Polygon',
      'AVAX': 'Avalanche',
      'SOL': 'Solana',
      'ADA': 'Cardano',
      'TRX': 'TRON',
      'LTC': 'Litecoin',
      'DOGE': 'Dogecoin',
      'XRP': 'Ripple',
      'XLM': 'Stellar',
      'FTM': 'Fantom',
      'TON': 'Toncoin',
      'VET': 'VeChain',
      'ZIL': 'Zilliqa',
      'EOS': 'EOS',
      'ALGO': 'Algorand',
      'USDT': 'Tether USD',
      'USDC': 'USD Coin',
      'DAI': 'Dai',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'AAVE': 'Aave',
      'COMP': 'Compound',
      'MKR': 'Maker',
      'YFI': 'yearn.finance',
      'CRV': 'Curve DAO Token',
      'SUSHI': 'SushiSwap',
      '1INCH': '1inch',
      'BAL': 'Balancer',
      'SNX': 'Synthetix',
      'REN': 'Ren',
      'BAND': 'Band Protocol',
      'UMA': 'UMA',
      'ZRX': '0x',
      'KNC': 'Kyber Network',
      'BAT': 'Basic Attention Token',
      'REP': 'Augur',
      'ZEC': 'Zcash',
      'DASH': 'Dash',
      'XMR': 'Monero',
      'BCH': 'Bitcoin Cash',
      'BSV': 'Bitcoin SV',
      'ETC': 'Ethereum Classic',
      'XEM': 'NEM',
      'NEO': 'NEO',
      'QTUM': 'Qtum',
      'WAVES': 'Waves',
      'OMG': 'OMG Network',
      'ICX': 'ICON',
      'AION': 'Aion',
      'ZEN': 'Horizen',
      'IOTA': 'IOTA',
      'NANO': 'Nano',
      'ONT': 'Ontology',
      'ATOM': 'Cosmos',
      'DOT': 'Polkadot'
    };

    return names[symbol] || symbol;
  }

  /**
   * Get currency decimals
   */
  private static getCurrencyDecimals(symbol: string): number {
    const decimals: Record<string, number> = {
      'BTC': 8,
      'ETH': 18,
      'BNB': 18,
      'MATIC': 18,
      'AVAX': 18,
      'SOL': 9,
      'ADA': 6,
      'TRX': 6,
      'LTC': 8,
      'DOGE': 8,
      'XRP': 6,
      'XLM': 7,
      'FTM': 18,
      'TON': 9,
      'VET': 18,
      'ZIL': 12,
      'EOS': 4,
      'ALGO': 6,
      'USDT': 6,
      'USDC': 6,
      'DAI': 18,
      'LINK': 18,
      'UNI': 18,
      'AAVE': 18,
      'COMP': 18,
      'MKR': 18,
      'YFI': 18,
      'CRV': 18,
      'SUSHI': 18,
      '1INCH': 18,
      'BAL': 18,
      'SNX': 18,
      'REN': 18,
      'BAND': 18,
      'UMA': 18,
      'ZRX': 18,
      'KNC': 18,
      'BAT': 18,
      'REP': 18,
      'ZEC': 8,
      'DASH': 8,
      'XMR': 12,
      'BCH': 8,
      'BSV': 8,
      'ETC': 18,
      'XEM': 6,
      'NEO': 8,
      'QTUM': 8,
      'WAVES': 8,
      'OMG': 18,
      'ICX': 18,
      'AION': 18,
      'ZEN': 8,
      'IOTA': 6,
      'NANO': 30,
      'ONT': 9,
      'ATOM': 6,
      'DOT': 10
    };

    return decimals[symbol] || 18;
  }
} 