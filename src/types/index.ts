// Network and Currency Types
export interface Network {
  id: string;
  name: string;
  symbol: string;
  type: 'MAINNET' | 'TESTNET';
  chainId?: number;
  rpcUrl?: string;
  explorerUrl?: string;
  isActive: boolean;
  tier: 1 | 2 | 3;
}

export interface Currency {
  symbol: string;
  name: string;
  networks: string[];
  primaryNetwork: string;
  isMultiChain: boolean;
  decimals: number;
  icon?: string;
}

export interface CurrencyNetworkPair {
  symbol: string;
  network: string;
  isValid: boolean;
  supported: boolean;
}

// Wallet Types
export interface Wallet {
  walletId: string;
  address: string;
  privateKey: string;
  mnemonic?: string;
  network: string;
  symbol: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
  isTestnet: boolean;
  balance?: string;
  lastSync?: Date;
}

export interface WalletCreateRequest {
  symbol: string;
  network?: string;
  testnet?: boolean;
  label?: string;
}

export interface WalletImportRequest {
  symbol: string;
  network: string;
  privateKey: string;
  label?: string;
  mnemonic?: string;
}

export interface WalletExport {
  walletId: string;
  address: string;
  privateKey: string;
  mnemonic?: string;
  network: string;
  symbol: string;
  label: string;
  createdAt: Date;
}

// Transaction Types
export interface Transaction {
  txId: string;
  walletId: string;
  address: string;
  network: string;
  symbol: string;
  type: 'INCOMING' | 'OUTGOING';
  amount: string;
  fee?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  blockNumber?: number;
  timestamp: Date;
  fromAddress?: string;
  toAddress?: string;
  hash?: string;
}

export interface TransactionMonitor {
  monitoringId: string;
  walletId: string;
  address: string;
  network: string;
  symbol: string;
  webhookUrl?: string;
  monitorIncoming: boolean;
  monitorOutgoing: boolean;
  minAmount?: string;
  isActive: boolean;
  createdAt: Date;
  lastCheck?: Date;
  transactionCount: number;
}

export interface MonitorRequest {
  webhookUrl?: string;
  monitorIncoming?: boolean;
  monitorOutgoing?: boolean;
  minAmount?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Statistics Types
export interface WalletStats {
  totalWallets: number;
  totalNetworks: number;
  totalSymbols: number;
  totalBalance: Record<string, string>;
  recentTransactions: number;
  activeMonitors: number;
}

export interface MonitorStats {
  totalMonitors: number;
  activeMonitors: number;
  totalTransactions: number;
  last24Hours: number;
  networks: Record<string, number>;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

// Configuration Types
export interface AppConfig {
  port: number;
  nodeEnv: string;
  tatumApiKey: string;
  webhookUrl?: string;
  encryptionKey: string;
  logLevel: string;
  logFile: string;
}

// Webhook Types
export interface WebhookPayload {
  type: 'TRANSACTION_RECEIVED' | 'TRANSACTION_SENT' | 'MONITOR_STARTED' | 'MONITOR_STOPPED';
  data: Transaction | TransactionMonitor;
  timestamp: Date;
  signature?: string;
} 