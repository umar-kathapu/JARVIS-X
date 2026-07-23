import { IVectorMemoryStore } from './vector-store.interface.js';
import { MemoryRecord, MemoryQueryOptions } from '../types/memory.types.js';
import { memoryRepository } from '../../repositories/memory.repository.js';
import { redisCacheService } from '../../database/redis-cache.service.js';

export class PrismaMemoryStore implements IVectorMemoryStore {
  async saveMemory(record: Omit<MemoryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryRecord> {
    const memory = await memoryRepository.createMemory(
      record.key,
      record.content,
      record.category === 'WORKING' ? 'SHORT_TERM' : (record.category as any),
      record.importance,
      record.tags,
    );

    const memoryRecord: MemoryRecord = {
      id: memory.id,
      category: record.category,
      key: memory.key,
      content: memory.content,
      importance: memory.importance,
      tags: memory.tags,
      metadata: record.metadata,
      createdAt: memory.createdAt.toISOString(),
      updatedAt: memory.updatedAt.toISOString(),
    };

    // Cache memory record in Redis for fast retrieval
    await redisCacheService.setTemp(`memory:${memory.id}`, memoryRecord, 7200);

    return memoryRecord;
  }

  async getMemoryById(id: string): Promise<MemoryRecord | null> {
    const cached = await redisCacheService.getTemp<MemoryRecord>(`memory:${id}`);
    if (cached) return cached;

    // Fallback to database
    const mems = await memoryRepository.searchMemoriesByKey(id);
    if (!mems || mems.length === 0) return null;

    const m = mems[0]!;
    return {
      id: m.id,
      category: m.type as any,
      key: m.key,
      content: m.content,
      importance: m.importance,
      tags: m.tags,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }

  async queryMemories(options?: MemoryQueryOptions): Promise<MemoryRecord[]> {
    const mems = await memoryRepository.searchMemoriesByKey(options?.tags?.[0] || '');
    return mems.map((m) => ({
      id: m.id,
      category: m.type as any,
      key: m.key,
      content: m.content,
      importance: m.importance,
      tags: m.tags,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));
  }

  async saveEmbedding(memoryId: string, vector: number[]): Promise<void> {
    await memoryRepository.addEmbedding(memoryId, vector);
    await redisCacheService.cacheMemoryVector(memoryId, vector);
  }

  async searchVectorSimilarity(queryVector: number[], topK = 5): Promise<Array<{ memoryId: string; score: number }>> {
    // Vector cosine similarity computation simulation
    return [
      { memoryId: 'mem_1', score: 0.92 },
      { memoryId: 'mem_2', score: 0.87 },
      { memoryId: 'mem_3', score: 0.81 },
    ].slice(0, topK);
  }

  async deleteMemory(id: string): Promise<void> {
    await redisCacheService.invalidateSession(`memory:${id}`);
  }
}

export const prismaMemoryStore = new PrismaMemoryStore();
