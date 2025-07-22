import client from 'prom-client';
import { logger } from './Logger';

export class MetricsService {
  private static instance: MetricsService;
  private registry: client.Registry;

  // Metrics
  private transactionCounter: client.Counter;
  private walletGauge: client.Gauge;
  private apiLatencyHistogram: client.Histogram;
  private cacheHitCounter: client.Counter;
  private cacheMissCounter: client.Counter;
  private errorCounter: client.Counter;

  private constructor() {
    // Create a Registry to register the metrics
    this.registry = new client.Registry();

    // Enable the collection of default metrics
    client.collectDefaultMetrics({ register: this.registry });

    // Initialize metrics
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    try {
      // Transaction counter
      this.transactionCounter = new client.Counter({
        name: 'crypto_transactions_total',
        help: 'Total number of processed transactions',
        labelNames: ['type', 'status', 'network'] as const
      });

      // Active wallets gauge
      this.walletGauge = new client.Gauge({
        name: 'crypto_active_wallets',
        help: 'Number of active wallets',
        labelNames: ['network'] as const
      });

      // API latency histogram
      this.apiLatencyHistogram = new client.Histogram({
        name: 'crypto_api_latency_seconds',
        help: 'API endpoint latency in seconds',
        labelNames: ['method', 'endpoint', 'status_code'] as const,
        buckets: [0.1, 0.5, 1, 2, 5] // 100ms, 500ms, 1s, 2s, 5s
      });

      // Cache metrics
      this.cacheHitCounter = new client.Counter({
        name: 'crypto_cache_hits_total',
        help: 'Total number of cache hits',
        labelNames: ['cache_type'] as const
      });

      this.cacheMissCounter = new client.Counter({
        name: 'crypto_cache_misses_total',
        help: 'Total number of cache misses',
        labelNames: ['cache_type'] as const
      });

      // Error counter
      this.errorCounter = new client.Counter({
        name: 'crypto_errors_total',
        help: 'Total number of errors',
        labelNames: ['type', 'code'] as const
      });

      // Register all metrics
      this.registry.registerMetric(this.transactionCounter);
      this.registry.registerMetric(this.walletGauge);
      this.registry.registerMetric(this.apiLatencyHistogram);
      this.registry.registerMetric(this.cacheHitCounter);
      this.registry.registerMetric(this.cacheMissCounter);
      this.registry.registerMetric(this.errorCounter);

      logger.info('Metrics initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize metrics', error);
      throw error;
    }
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  /**
   * Record a transaction
   */
  public recordTransaction(type: string, status: string, network: string): void {
    try {
      this.transactionCounter.labels(type, status, network).inc();
    } catch (error) {
      logger.error('Failed to record transaction metric', error, { type, status, network });
    }
  }

  /**
   * Update active wallets count
   */
  public updateActiveWallets(network: string, count: number): void {
    try {
      this.walletGauge.labels(network).set(count);
    } catch (error) {
      logger.error('Failed to update active wallets metric', error, { network, count });
    }
  }

  /**
   * Start timing an API request
   */
  public startApiTimer(): client.Histogram.Timer {
    return this.apiLatencyHistogram.startTimer();
  }

  /**
   * Record API latency
   */
  public recordApiLatency(method: string, endpoint: string, statusCode: number, timer: client.Histogram.Timer): void {
    try {
      timer({ method, endpoint, status_code: statusCode.toString() });
    } catch (error) {
      logger.error('Failed to record API latency metric', error, { method, endpoint, statusCode });
    }
  }

  /**
   * Record cache hit
   */
  public recordCacheHit(type: string): void {
    try {
      this.cacheHitCounter.labels(type).inc();
    } catch (error) {
      logger.error('Failed to record cache hit metric', error, { type });
    }
  }

  /**
   * Record cache miss
   */
  public recordCacheMiss(type: string): void {
    try {
      this.cacheMissCounter.labels(type).inc();
    } catch (error) {
      logger.error('Failed to record cache miss metric', error, { type });
    }
  }

  /**
   * Record error
   */
  public recordError(type: string, code: string): void {
    try {
      this.errorCounter.labels(type, code).inc();
    } catch (error) {
      logger.error('Failed to record error metric', error, { type, code });
    }
  }

  /**
   * Get metrics
   */
  public async getMetrics(): Promise<string> {
    try {
      return await this.registry.metrics();
    } catch (error) {
      logger.error('Failed to get metrics', error);
      throw error;
    }
  }

  /**
   * Clear all metrics (useful for testing)
   */
  public clearMetrics(): void {
    try {
      this.registry.clear();
      this.initializeMetrics();
    } catch (error) {
      logger.error('Failed to clear metrics', error);
      throw error;
    }
  }
} 