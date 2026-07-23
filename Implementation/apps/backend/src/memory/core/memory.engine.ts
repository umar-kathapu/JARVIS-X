import { MemoryCategory, MemoryRecord } from '../types/memory.types.js';
import { DocumentFileType } from '../types/knowledge.types.js';
import { prismaMemoryStore } from '../storage/prisma-memory.store.js';
import { hybridRetriever } from '../retrieval/hybrid-retriever.js';
import { indexerPipeline } from '../indexing/indexer.pipeline.js';
import { userProfileService } from '../profiles/user-profile.service.js';
import { logger } from '../../utils/logger.js';

export class MemoryEngine {
  private static instance: MemoryEngine;

  private constructor() {
    logger.info('💾 JARVIS-X Lifelong Memory & Knowledge Engine initialized');
  }

  public static getInstance(): MemoryEngine {
    if (!MemoryEngine.instance) {
      MemoryEngine.instance = new MemoryEngine();
    }
    return MemoryEngine.instance;
  }

  async remember(key: string, content: string, category: MemoryCategory = 'LONG_TERM', importance = 1.0, tags: string[] = []): Promise<MemoryRecord> {
    return prismaMemoryStore.saveMemory({
      key,
      content,
      category,
      importance,
      tags,
    });
  }

  async recall(query: string, limit = 5) {
    return hybridRetriever.retrieveHybrid(query, limit);
  }

  async ingestKnowledgeDocument(docId: string, title: string, content: string, fileType: DocumentFileType = 'markdown') {
    return indexerPipeline.ingestDocument(docId, title, content, fileType);
  }

  async searchKnowledge(query: string, topK = 5) {
    return indexerPipeline.searchHybrid(query, topK);
  }

  async getUserProfile(userId: string) {
    return userProfileService.getUserProfile(userId);
  }
}

export const memoryEngine = MemoryEngine.getInstance();
