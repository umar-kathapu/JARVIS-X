import { getRedisClient, isRedisConnected } from './redis.js';
import { logger } from '../utils/logger.js';

export class RedisCacheService {
  // Session Caching
  async cacheSession(sessionId: string, sessionData: Record<string, unknown>, ttlSeconds = 86400): Promise<void> {
    if (!isRedisConnected()) return;
    try {
      const redis = getRedisClient();
      if (!redis) return;
      await redis.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(sessionData));
    } catch (err) {
      logger.error({ error: err, sessionId }, 'Failed to cache session in Redis');
    }
  }

  async getSession(sessionId: string): Promise<Record<string, unknown> | null> {
    if (!isRedisConnected()) return null;
    try {
      const redis = getRedisClient();
      if (!redis) return null;
      const raw = await redis.get(`session:${sessionId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.error({ error: err, sessionId }, 'Failed to get session from Redis');
      return null;
    }
  }

  async invalidateSession(sessionId: string): Promise<void> {
    if (!isRedisConnected()) return;
    try {
      const redis = getRedisClient();
      if (!redis) return;
      await redis.del(`session:${sessionId}`);
    } catch (err) {
      logger.error({ error: err, sessionId }, 'Failed to invalidate session in Redis');
    }
  }

  // AI Response Caching
  async cacheAiResponse(promptHash: string, response: string, ttlSeconds = 3600): Promise<void> {
    if (!isRedisConnected()) return;
    try {
      const redis = getRedisClient();
      if (!redis) return;
      await redis.setex(`ai_cache:${promptHash}`, ttlSeconds, response);
    } catch (err) {
      logger.warn({ error: err }, 'Failed to cache AI response in Redis');
    }
  }

  async getAiResponse(promptHash: string): Promise<string | null> {
    if (!isRedisConnected()) return null;
    try {
      const redis = getRedisClient();
      if (!redis) return null;
      return await redis.get(`ai_cache:${promptHash}`);
    } catch (err) {
      logger.warn({ error: err }, 'Failed to fetch cached AI response from Redis');
      return null;
    }
  }

  // Memory Vector Cache
  async cacheMemoryVector(memoryId: string, vector: number[], ttlSeconds = 7200): Promise<void> {
    if (!isRedisConnected()) return;
    try {
      const redis = getRedisClient();
      if (!redis) return;
      await redis.setex(`memory_vector:${memoryId}`, ttlSeconds, JSON.stringify(vector));
    } catch (err) {
      logger.warn({ error: err, memoryId }, 'Failed to cache memory vector');
    }
  }

  async getMemoryVector(memoryId: string): Promise<number[] | null> {
    if (!isRedisConnected()) return null;
    try {
      const redis = getRedisClient();
      if (!redis) return null;
      const raw = await redis.get(`memory_vector:${memoryId}`);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      logger.warn({ error: err, memoryId }, 'Failed to get cached memory vector');
      return null;
    }
  }

  // Rate Limiting Counter
  async incrementRateLimit(ipOrKey: string, windowSeconds = 60): Promise<number> {
    if (!isRedisConnected()) return 1;
    try {
      const redis = getRedisClient();
      if (!redis) return 1;
      const key = `ratelimit:${ipOrKey}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSeconds);
      }
      return count;
    } catch (err) {
      logger.warn({ error: err, ipOrKey }, 'Failed to increment rate limit key');
      return 1;
    }
  }

  // Generic Temp Storage
  async setTemp(key: string, value: unknown, ttlSeconds = 600): Promise<void> {
    if (!isRedisConnected()) return;
    try {
      const redis = getRedisClient();
      if (!redis) return;
      await redis.setex(`temp:${key}`, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      logger.error({ error: err, key }, 'Failed to set temporary Redis value');
    }
  }

  async getTemp<T>(key: string): Promise<T | null> {
    if (!isRedisConnected()) return null;
    try {
      const redis = getRedisClient();
      if (!redis) return null;
      const raw = await redis.get(`temp:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
      logger.error({ error: err, key }, 'Failed to get temporary Redis value');
      return null;
    }
  }
}

export const redisCacheService = new RedisCacheService();


