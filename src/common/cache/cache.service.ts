import { Injectable, Logger } from '@nestjs/common';
import * as NodeCache from 'node-cache';

export interface CacheOptions {
  ttl?: number; // time to live in seconds
  checkperiod?: number; // period in seconds for checking expired keys
}

@Injectable()
export class CacheService {
  private readonly cache: NodeCache;
  private readonly logger = new Logger(CacheService.name);

  constructor() {
    // Default configuration: 1 hour TTL, check every 10 minutes
    this.cache = new NodeCache({
      stdTTL: 3600, // 1 hour default TTL
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false, // Better performance, but be careful with object mutations
    });

    // Log cache statistics periodically
    this.cache.on('set', (key) => {
      this.logger.debug(`Cache SET: ${key}`);
    });

    this.cache.on('del', (key) => {
      this.logger.debug(`Cache DEL: ${key}`);
    });

    this.cache.on('expired', (key) => {
      this.logger.debug(`Cache EXPIRED: ${key}`);
    });
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | undefined {
    try {
      const value = this.cache.get<T>(key);
      if (value !== undefined) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return undefined;
    }
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const success = this.cache.set(key, value, ttl);
      if (success) {
        this.logger.debug(
          `Cache SET success: ${key} (TTL: ${ttl || 'default'})`,
        );
      }
      return success;
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a specific key from cache
   */
  del(key: string): number {
    try {
      const deleted = this.cache.del(key);
      this.logger.debug(`Cache DEL: ${key} (deleted: ${deleted})`);
      return deleted;
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  delPattern(pattern: string): number {
    try {
      const keys = this.cache.keys();
      const matchingKeys = keys.filter((key) => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(key);
      });

      let deletedCount = 0;
      matchingKeys.forEach((key) => {
        deletedCount += this.cache.del(key);
      });

      this.logger.debug(
        `Cache DEL PATTERN: ${pattern} (deleted: ${deletedCount} keys)`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error(
        `Cache DEL PATTERN error for pattern ${pattern}:`,
        error,
      );
      return 0;
    }
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return this.cache.keys();
  }

  /**
   * Clear all cache
   */
  flushAll(): void {
    this.cache.flushAll();
    this.logger.warn('Cache FLUSH ALL: All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }

  /**
   * Generate a cache key with prefix
   */
  generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Invalidate all cache entries for a specific catalog
   */
  invalidateCatalog(catalogName: string): number {
    const pattern = `${catalogName}:*`;
    return this.delPattern(pattern);
  }

  /**
   * Wrapper method for caching database queries
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    // Try to get from cache first
    const cachedValue = this.get<T>(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    // If not in cache, fetch and store
    try {
      const value = await fetchFunction();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      this.logger.error(`Error in getOrSet for key ${key}:`, error);
      throw error;
    }
  }
}
