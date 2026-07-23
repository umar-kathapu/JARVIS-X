import { Conversation, Message, MessageRole } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class ConversationRepository extends BaseRepository<Conversation> {
  protected modelName = 'Conversation';

  async createConversation(userId: string, title: string, modelId?: string): Promise<Conversation> {
    return prisma.conversation.create({
      data: { userId, title, modelId },
    });
  }

  async findConversationById(id: string): Promise<(Conversation & { messages: Message[] }) | null> {
    return prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async findUserConversations(userId: string, page = 1, limit = 20) {
    const { skip, take } = this.getPagination(page, limit);
    const [data, totalCount] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      prisma.conversation.count({ where: { userId, deletedAt: null } }),
    ]);

    return this.formatResult(data, totalCount, page, limit);
  }

  async addMessage(conversationId: string, role: MessageRole, content: string, tokensUsed = 0, metadata?: Record<string, unknown>): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        tokensUsed,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}

export const conversationRepository = new ConversationRepository();
