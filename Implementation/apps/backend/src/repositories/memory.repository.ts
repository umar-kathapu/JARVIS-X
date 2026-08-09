import { Memory, MemoryType, MemoryEmbedding } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class MemoryRepository extends BaseRepository<Memory> {
  protected modelName = 'Memory';

  private fallbackMemories = new Map<string, Memory>();

  async createMemory(key: string, content: string, type: MemoryType = 'LONG_TERM', importance = 1.0, tags: string[] = []): Promise<Memory> {
    try {
      const dbPromise = prisma.memory.create({
        data: { key, content, type, importance, tags },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      const fallbackMemory: Memory = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        key,
        content,
        type,
        importance,
        tags,
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.fallbackMemories.set(fallbackMemory.id, fallbackMemory);
      return fallbackMemory;
    }
  }

  async addEmbedding(memoryId: string, vector: number[], modelName = 'text-embedding-3-small'): Promise<MemoryEmbedding> {
    try {
      const dbPromise = prisma.memoryEmbedding.create({
        data: { memoryId, vector, modelName, dimension: vector.length },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      return {
        id: `emb_${Date.now()}`,
        memoryId,
        vector,
        dimension: vector.length,
        modelName,
        createdAt: new Date(),
      };
    }
  }

  async searchMemoriesByKey(key: string): Promise<Memory[]> {
    try {
      const dbPromise = prisma.memory.findMany({
        where: { key: { contains: key, mode: 'insensitive' } },
        include: { embeddings: true },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      const q = (key || '').toLowerCase();
      return Array.from(this.fallbackMemories.values()).filter(
        (m) => m.key.toLowerCase().includes(q) || m.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
  }
}

export const memoryRepository = new MemoryRepository();
