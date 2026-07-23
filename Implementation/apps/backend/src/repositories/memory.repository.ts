import { Memory, MemoryType, MemoryEmbedding } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class MemoryRepository extends BaseRepository<Memory> {
  protected modelName = 'Memory';

  async createMemory(key: string, content: string, type: MemoryType = 'LONG_TERM', importance = 1.0, tags: string[] = []): Promise<Memory> {
    return prisma.memory.create({
      data: { key, content, type, importance, tags },
    });
  }

  async addEmbedding(memoryId: string, vector: number[], modelName = 'text-embedding-3-small'): Promise<MemoryEmbedding> {
    return prisma.memoryEmbedding.create({
      data: { memoryId, vector, modelName, dimension: vector.length },
    });
  }

  async searchMemoriesByKey(key: string): Promise<Memory[]> {
    return prisma.memory.findMany({
      where: { key: { contains: key, mode: 'insensitive' } },
      include: { embeddings: true },
    });
  }
}

export const memoryRepository = new MemoryRepository();
