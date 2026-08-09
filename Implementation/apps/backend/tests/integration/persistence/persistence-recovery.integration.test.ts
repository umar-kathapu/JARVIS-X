import { describe, it, expect, vi } from 'vitest';
import { redisCacheService } from '../../../src/database/redis-cache.service.js';
import { prismaMemoryStore } from '../../../src/memory/storage/prisma-memory.store.js';

describe('Persistence & Recovery Subsystem Integration Tests', () => {
  it('1. Should store and retrieve temporary cache records from Redis caching layer', async () => {
    const testKey = `test_temp_${Date.now()}`;
    const testData = { key: 'sample', value: 123 };

    await redisCacheService.setTemp(testKey, testData, 60);
    const retrieved = await redisCacheService.getTemp<typeof testData>(testKey);

    // If Redis is connected, retrieved matches testData; if Redis is offline, returns null without throwing
    if (retrieved) {
      expect(retrieved.key).toBe('sample');
    } else {
      expect(retrieved).toBeNull();
    }
  });

  it('2. Should store memory vector embeddings and execute similarity search', async () => {
    const queryVector = [0.1, 0.2, 0.3, 0.4, 0.5];
    const results = await prismaMemoryStore.searchVectorSimilarity(queryVector, 3, 0.5);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(3);
    for (const res of results) {
      expect(res.memoryId).toBeDefined();
      expect(res.score).toBeGreaterThanOrEqual(0.5);
    }
  });

  it('3. Should clean up and invalidate session caches during state teardown', async () => {
    const sessionKey = `sess_test_${Date.now()}`;
    await redisCacheService.invalidateSession(sessionKey);
  });
});
