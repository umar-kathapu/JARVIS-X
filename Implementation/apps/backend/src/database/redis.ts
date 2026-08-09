import { Redis } from 'ioredis';
import { appConfig } from '../config/app.config.js';
import { logger } from '../utils/logger.js';

let redisClient: InstanceType<typeof Redis> | null = null;
let hasLoggedOfflineWarning = false;
let redisDisabled = false;

export function isRedisConnected(): boolean {
  return !redisDisabled && redisClient !== null && redisClient.status === 'ready';
}

export function getRedisClient(): InstanceType<typeof Redis> | null {
  if (redisDisabled) {
    return null;
  }
  if (!redisClient) {
    try {
      redisClient = new Redis(appConfig.redis.url, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy(times) {
          if (times >= 1) {
            return null; // Stop retrying immediately if unreachable
          }
          return 200;
        },
      });

      redisClient.on('error', (err) => {
        if (!hasLoggedOfflineWarning) {
          logger.warn(
            { error: err.message },
            '⚠️ Redis connection warning. Caching operating in degraded / disabled mode.'
          );
          hasLoggedOfflineWarning = true;
        }
      });

      redisClient.on('connect', () => {
        redisDisabled = false;
        hasLoggedOfflineWarning = false;
        logger.info('✅ Connected to Redis server');
      });
    } catch (err: any) {
      redisDisabled = true;
      if (!hasLoggedOfflineWarning) {
        logger.warn(
          { error: err?.message || err },
          '⚠️ Failed to instantiate Redis client. Operating in cache-disabled mode.'
        );
        hasLoggedOfflineWarning = true;
      }
      return null;
    }
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  if (redisDisabled) return;
  const client = getRedisClient();
  if (!client) return;

  try {
    if (client.status === 'wait') {
      await client.connect();
    }
  } catch (error: any) {
    redisDisabled = true;
    if (!hasLoggedOfflineWarning) {
      logger.warn(
        { error: error?.message || error },
        '⚠️ Redis server connection failed or unavailable. Operating in cache-disabled mode.'
      );
      hasLoggedOfflineWarning = true;
    }
    try {
      client.removeAllListeners('error');
      client.disconnect();
    } catch {
      // Ignore disconnect errors during teardown
    }
    redisClient = null;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    try {
      if (redisClient.status !== 'end') {
        await redisClient.quit();
      }
      logger.info('Disconnected from Redis server');
    } catch {
      // Ignore disconnect errors if already closed
    } finally {
      redisClient = null;
    }
  }
}


