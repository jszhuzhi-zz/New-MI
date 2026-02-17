import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

/**
 * Redis Service
 * Handles caching, OTP storage, and rate limiting
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis.Redis | null = null;
  private readonly keyPrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.keyPrefix = this.configService.get<string>('redis.keyPrefix', 'linkreit:');
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const host = this.configService.get<string>('redis.host', 'localhost');
      const port = this.configService.get<number>('redis.port', 6379);
      const password = this.configService.get<string>('redis.password');
      const db = this.configService.get<number>('redis.db', 0);

      this.client = new Redis.default({
        host,
        port,
        password: password || undefined,
        db,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn('Redis connection failed after 3 retries, using in-memory fallback');
            return null;
          }
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
      });

      this.client.on('error', (err) => {
        this.logger.warn(`Redis error: ${err.message}`);
      });

      this.client.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      // Try to connect
      this.client.connect().catch(() => {
        this.logger.warn('Redis not available, using in-memory storage');
        this.client = null;
      });
    } catch (error) {
      this.logger.warn(`Failed to initialize Redis: ${error.message}`);
      this.client = null;
    }
  }

  // In-memory fallback storage
  private memoryStore = new Map<string, { value: string; expiry: number }>();

  private getFullKey(key: string): string {
    return this.keyPrefix + key;
  }

  private cleanupExpiredMemory() {
    const now = Date.now();
    for (const [key, data] of this.memoryStore.entries()) {
      if (data.expiry > 0 && data.expiry < now) {
        this.memoryStore.delete(key);
      }
    }
  }

  /**
   * Set a value with optional expiry
   */
  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    const fullKey = this.getFullKey(key);

    if (this.client) {
      try {
        if (expirySeconds) {
          await this.client.set(fullKey, value, 'EX', expirySeconds);
        } else {
          await this.client.set(fullKey, value);
        }
        return;
      } catch (error) {
        this.logger.warn(`Redis set failed, using memory: ${error.message}`);
      }
    }

    // Fallback to memory
    this.cleanupExpiredMemory();
    this.memoryStore.set(fullKey, {
      value,
      expiry: expirySeconds ? Date.now() + expirySeconds * 1000 : 0,
    });
  }

  /**
   * Get a value
   */
  async get(key: string): Promise<string | null> {
    const fullKey = this.getFullKey(key);

    if (this.client) {
      try {
        return await this.client.get(fullKey);
      } catch (error) {
        this.logger.warn(`Redis get failed, using memory: ${error.message}`);
      }
    }

    // Fallback to memory
    const data = this.memoryStore.get(fullKey);
    if (!data) return null;
    if (data.expiry > 0 && data.expiry < Date.now()) {
      this.memoryStore.delete(fullKey);
      return null;
    }
    return data.value;
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    const fullKey = this.getFullKey(key);

    if (this.client) {
      try {
        await this.client.del(fullKey);
        return;
      } catch (error) {
        this.logger.warn(`Redis del failed, using memory: ${error.message}`);
      }
    }

    this.memoryStore.delete(fullKey);
  }

  /**
   * Increment a counter
   */
  async incr(key: string): Promise<number> {
    const fullKey = this.getFullKey(key);

    if (this.client) {
      try {
        return await this.client.incr(fullKey);
      } catch (error) {
        this.logger.warn(`Redis incr failed, using memory: ${error.message}`);
      }
    }

    // Fallback to memory
    const data = this.memoryStore.get(fullKey);
    const currentValue = data ? parseInt(data.value, 10) || 0 : 0;
    const newValue = currentValue + 1;
    this.memoryStore.set(fullKey, {
      value: newValue.toString(),
      expiry: data?.expiry || 0,
    });
    return newValue;
  }

  /**
   * Set expiry on a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    const fullKey = this.getFullKey(key);

    if (this.client) {
      try {
        await this.client.expire(fullKey, seconds);
        return;
      } catch (error) {
        this.logger.warn(`Redis expire failed, using memory: ${error.message}`);
      }
    }

    // Fallback to memory
    const data = this.memoryStore.get(fullKey);
    if (data) {
      data.expiry = Date.now() + seconds * 1000;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);

    if (this.client) {
      try {
        return (await this.client.exists(fullKey)) === 1;
      } catch (error) {
        this.logger.warn(`Redis exists failed, using memory: ${error.message}`);
      }
    }

    const data = this.memoryStore.get(fullKey);
    if (!data) return false;
    if (data.expiry > 0 && data.expiry < Date.now()) {
      this.memoryStore.delete(fullKey);
      return false;
    }
    return true;
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
