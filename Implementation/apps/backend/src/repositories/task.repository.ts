import { AgentTask, TaskStatus, Priority, Prisma } from '@prisma/client';
import { prisma } from '../database/prisma.js';

export class TaskRepository {
  async findById(id: string): Promise<AgentTask | null> {
    return prisma.agentTask.findUnique({ where: { id } });
  }

  async findAll(): Promise<AgentTask[]> {
    return prisma.agentTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTask(data: {
    title: string;
    description: string;
    priority?: Priority;
    assignedAgent: string;
    userId?: string;
  }): Promise<AgentTask> {
    return prisma.agentTask.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority ?? 'MEDIUM',
        assignedAgent: data.assignedAgent,
        userId: data.userId,
        status: 'PENDING',
      },
    });
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    resultPayload?: Prisma.InputJsonValue,
    errorMessage?: string,
  ): Promise<AgentTask> {
    return prisma.agentTask.update({
      where: { id },
      data: {
        status,
        resultPayload,
        errorMessage,
      },
    });
  }
}

export const taskRepository = new TaskRepository();
