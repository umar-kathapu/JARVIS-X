import Redis from 'ioredis';
import { appConfig } from '../config/app.config.js';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(appConfig.redis.url, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`Redis connection retry attempt ${times} after ${delay}ms`);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      logger.info('✅ Connected to Redis server');
    });

    redisClient.on('error', (err) => {
      logger.error({ error: err.message }, '⚠️ Redis client error encountered');
    });
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  try {
    const client = getRedisClient();
    if (client.status === 'wait') {
      await client.connect();
    }
  } catch (error) {
    logger.warn({ error }, '⚠️ Redis server connection deferred / offline');
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Disconnected from Redis server');
  }
}
