import { redisCacheService } from '../../database/redis-cache.service.js';

export class AIMemoryService {
  async storeShortTerm(sessionId: string, key: string, value: unknown): Promise<void> {
    await redisCacheService.setTemp(`${sessionId}:${key}`, value, 3600);
  }

  async getShortTerm<T>(sessionId: string, key: string): Promise<T | null> {
    return redisCacheService.getTemp<T>(`${sessionId}:${key}`);
  }

  async storeSemanticMemory(key: string, content: string, embedding: number[]): Promise<void> {
    await redisCacheService.cacheMemoryVector(key, embedding, 86400);
  }
}

export const aiMemoryService = new AIMemoryService();
