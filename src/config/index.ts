import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  env: string;
  port: number;
  database: {
    url: string;
    maxConnections: number;
    idleTimeout: number;
  };
  api: {
    rateLimit: {
      windowMs: number;
      max: number;
    };
    sensitiveRateLimit: {
      windowMs: number;
      max: number;
    };
  };
  cache: {
    ttl: number;
    checkPeriod: number;
  };
  monitoring: {
    retryAttempts: number;
    maxTransactions: number;
    webhookTimeout: number;
  };
  security: {
    encryptionKey: string;
    jwtSecret: string;
    corsOrigins: string[];
  };
  tatum: {
    apiKey: string;
    apiUrl: string;
    testnet: boolean;
  };
}

const development: Config = {
  env: 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/crypto_dev',
    maxConnections: 10,
    idleTimeout: 30000
  },
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100
    },
    sensitiveRateLimit: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10
    }
  },
  cache: {
    ttl: 600, // 10 minutes
    checkPeriod: 120 // 2 minutes
  },
  monitoring: {
    retryAttempts: 3,
    maxTransactions: 1000,
    webhookTimeout: 5000
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key',
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
    corsOrigins: ['http://localhost:3000', 'http://localhost:3001']
  },
  tatum: {
    apiKey: process.env.TATUM_API_KEY || '',
    apiUrl: 'https://api.tatum.io/v3',
    testnet: true
  }
};

const production: Config = {
  env: 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: 20,
    idleTimeout: 60000
  },
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100
    },
    sensitiveRateLimit: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5
    }
  },
  cache: {
    ttl: 1800, // 30 minutes
    checkPeriod: 300 // 5 minutes
  },
  monitoring: {
    retryAttempts: 5,
    maxTransactions: 10000,
    webhookTimeout: 10000
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY!,
    jwtSecret: process.env.JWT_SECRET!,
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []
  },
  tatum: {
    apiKey: process.env.TATUM_API_KEY!,
    apiUrl: 'https://api.tatum.io/v3',
    testnet: false
  }
};

const test: Config = {
  env: 'test',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.TEST_DATABASE_URL || 'postgresql://user:password@localhost:5432/crypto_test',
    maxConnections: 5,
    idleTimeout: 10000
  },
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000
    },
    sensitiveRateLimit: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 100
    }
  },
  cache: {
    ttl: 60, // 1 minute
    checkPeriod: 30 // 30 seconds
  },
  monitoring: {
    retryAttempts: 1,
    maxTransactions: 100,
    webhookTimeout: 1000
  },
  security: {
    encryptionKey: 'test-encryption-key',
    jwtSecret: 'test-jwt-secret',
    corsOrigins: ['http://localhost:3000']
  },
  tatum: {
    apiKey: 'test-api-key',
    apiUrl: 'https://api.tatum.io/v3',
    testnet: true
  }
};

const configs = {
  development,
  production,
  test
};

const env = process.env.NODE_ENV || 'development';
const config = configs[env as keyof typeof configs];

if (!config) {
  throw new Error(`Invalid environment: ${env}`);
}

export default config; 