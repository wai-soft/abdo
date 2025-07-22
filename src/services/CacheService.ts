import NodeCache from 'node-cache';
import { logger } from './Logger';

export class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;
  private readonly defaultTTL = 600; // 10 minutes

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: this.defaultTTL,
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false // For better performance
    });

    // Log cache events
    this.cache.on('expired', (key: string, value: unknown) => {
      logger.debug('Cache key expired', { key });
    });

    this.cache.on('flush', () => {
      logger.debug('Cache flushed');
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Get value from cache
   */
  public get<T>(key: string): T | undefined {
    try {
      return this.cache.get<T>(key);
    } catch (error) {
      logger.error('Error getting value from cache', error, { key });
      return undefined;
    }
  }

  /**
   * Set value in cache
   */
  public set<T>(key: string, value: T, ttl: number = this.defaultTTL): boolean {
    try {
      return this.cache.set(key, value, ttl);
    } catch (error) {
      logger.error('Error setting value in cache', error, { key });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  public del(key: string | string[]): number {
    try {
      return this.cache.del(key);
    } catch (error) {
      logger.error('Error deleting value from cache', error, { key });
      return 0;
    }
  }

  /**
   * Get multiple values from cache
   */
  public mget<T>(keys: string[]): { [key: string]: T } {
    try {
      return this.cache.mget<T>(keys);
    } catch (error) {
      logger.error('Error getting multiple values from cache', error, { keys });
      return {};
    }
  }

  /**
   * Set multiple values in cache
   */
  public mset<T>(keyValuePairs: { key: string; val: T; ttl?: number }[]): boolean {
    try {
      return this.cache.mset(keyValuePairs.map(pair => ({
        key: pair.key,
        val: pair.val,
        ttl: pair.ttl || this.defaultTTL
      })));
    } catch (error) {
      logger.error('Error setting multiple values in cache', error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  public has(key: string): boolean {
    try {
      return this.cache.has(key);
    } catch (error) {
      logger.error('Error checking key existence in cache', error, { key });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  public getStats() {
    return this.cache.getStats();
  }

  /**
   * Flush entire cache
   */
  public flush(): void {
    try {
      this.cache.flushAll();
      logger.info('Cache flushed successfully');
    } catch (error) {
      logger.error('Error flushing cache', error);
    }
  }

  /**
   * Get all keys in cache
   */
  public keys(): string[] {
    try {
      return this.cache.keys();
    } catch (error) {
      logger.error('Error getting cache keys', error);
      return [];
    }
  }
} 