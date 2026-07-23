import { MemoryRecord, MemoryQueryOptions } from '../types/memory.types.js';

export interface IVectorMemoryStore {
  saveMemory(record: Omit<MemoryRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryRecord>;
  getMemoryById(id: string): Promise<MemoryRecord | null>;
  queryMemories(options?: MemoryQueryOptions): Promise<MemoryRecord[]>;
  saveEmbedding(memoryId: string, vector: number[]): Promise<void>;
  searchVectorSimilarity(queryVector: number[], topK?: number): Promise<Array<{ memoryId: string; score: number }>>;
  deleteMemory(id: string): Promise<void>;
}
