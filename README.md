# Cryptocurrency Management System

A comprehensive cryptocurrency management system built with TypeScript and the Tatum API. This system provides advanced capabilities for mapping tokens to networks, creating and managing wallets, and monitoring transactions in real-time.

## Features

### 🔗 Currency-Network Mapping

- Smart Search: Get all supported networks for any token
- Validation: Verify currency-network pair validity
- Multi-Network Support: Supports 60+ blockchain networks
- Detailed Info: Get comprehensive technical information about each network

### 💼 Advanced Wallet Management

- Create Wallets: Generate new wallets for all supported networks
- Import Wallets: Import using private key or mnemonic phrase
- Export Wallets: Securely export wallet data
- Backup: Comprehensive wallet backup and restore
- Statistics: Detailed tracking of all wallets and activities

### 📊 Transaction Monitoring

- Real-time Monitoring: Track incoming and outgoing transactions
- Custom Alerts: Set up webhook alerts for new transactions
- Transaction Log: Store and manage comprehensive transaction history
- Advanced Filters: Filter transactions by amount, token, and direction

## Supported Networks

### Tier 1 - High Performance Networks

- Bitcoin (BTC) - Original Bitcoin network
- Ethereum (ETH) - Leading smart contract platform
- Binance Smart Chain (BNB) - High-speed Binance network
- Polygon (MATIC) - Ethereum scaling solution
- Avalanche (AVAX) - DApp platform
- Solana (SOL) - High-performance blockchain
- Arbitrum One (ETH) - Ethereum Layer 2 solution
- Optimism (ETH) - Optimistic Rollups technology
- Base (ETH) - Coinbase Layer 2 network

### Tier 2 - Stable Networks

- Cardano (ADA) - Research-based blockchain
- Tron (TRX) - Digital content platform
- Litecoin (LTC) - Digital silver
- Dogecoin (DOGE) - Popular meme coin
- Ripple (XRP) - Global payments network
- Stellar (XLM) - Financial transfer platform
- Fantom (FTM) - High-speed DeFi platform

### Tier 3 - Specialized Networks

- The Open Network (TON) - Telegram network
- VeChain (VET) - Supply chain blockchain
- Zilliqa (ZIL) - First sharded blockchain
- EOS (EOS) - DApp platform
- Algorand (ALGO) - Pure Proof-of-Stake blockchain

## Technical Requirements

- Node.js 18+
- PostgreSQL 12+
- TypeScript 5+
- Express 4.18+
- Tatum SDK 4.2+

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wai-soft/abdo.git
   cd crypto-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Build the project:
   ```bash
   npm run build
   ```

6. Start the server:
   ```bash
   npm start
   ```

## Development

Run in development mode:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

## API Documentation

### Crypto Operations

- GET /api/crypto/health - System health check
- GET /api/crypto/symbols - All supported symbols
- GET /api/crypto/networks - All supported networks
- GET /api/crypto/networks/:symbol - Networks for specific symbol
- GET /api/crypto/network/:network - Specific network information
- GET /api/crypto/search/:symbol - Detailed search
- GET /api/crypto/validate/:symbol/:network - Pair validation

### Wallet Management

- POST /api/wallet/create - Create new wallet
- GET /api/wallet/list - List wallets
- GET /api/wallet/:walletId - Wallet details
- DELETE /api/wallet/:walletId - Delete wallet
- POST /api/wallet/import - Import wallet
- GET /api/wallet/:walletId/export - Export wallet
- GET /api/wallet/stats - Wallet statistics
- POST /api/wallet/backup - Backup
- POST /api/wallet/restore - Restore from backup

### Transaction Monitoring

- POST /api/wallet/:walletId/monitor - Start monitoring
- DELETE /api/wallet/monitor/:monitoringId - Stop monitoring
- GET /api/wallet/monitor/:monitoringId/status - Monitor status
- GET /api/wallet/monitor/list - List monitored addresses
- GET /api/wallet/monitor/:monitoringId/transactions - Transaction log
- GET /api/wallet/monitor/stats - Monitoring statistics
- PUT /api/wallet/monitor/:monitoringId - Update monitor settings

## Security Features

- Private key encryption
- Secure wallet storage
- Encrypted backups
- Key management
- Security monitoring
- Access protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
