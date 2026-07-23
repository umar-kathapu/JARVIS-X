import { KnowledgeBase, Document, File } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class KnowledgeRepository extends BaseRepository<KnowledgeBase> {
  protected modelName = 'KnowledgeBase';

  async createKnowledgeBase(userId: string, name: string, description?: string): Promise<KnowledgeBase> {
    return prisma.knowledgeBase.create({
      data: { userId, name, description },
    });
  }

  async addDocument(knowledgeBaseId: string, title: string, content: string, fileType = 'text/plain'): Promise<Document> {
    return prisma.document.create({
      data: { knowledgeBaseId, title, content, fileType },
    });
  }

  async findUserFiles(userId: string): Promise<File[]> {
    return prisma.file.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
}

export const knowledgeRepository = new KnowledgeRepository();
