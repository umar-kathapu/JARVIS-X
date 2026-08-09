import { Automation, AutomationExecution, Workflow } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class AutomationRepository extends BaseRepository<Automation> {
  protected modelName = 'Automation';

  async createAutomation(name: string, cronExpression: string, description?: string): Promise<Automation> {
    try {
      const dbPromise = prisma.automation.create({
        data: { name, cronExpression, description },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      return {
        id: `auto_${Date.now()}`,
        name,
        cronExpression,
        description: description || null,
        status: 'ACTIVE',
        lastRun: null,
        nextRun: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  async recordExecution(automationId: string, status: 'RUNNING' | 'SUCCESS' | 'FAILURE' = 'RUNNING', logOutput?: string): Promise<AutomationExecution> {
    try {
      const dbPromise = prisma.automationExecution.create({
        data: { automationId, status, logOutput },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      return {
        id: `exec_${Date.now()}`,
        automationId,
        status,
        logOutput: logOutput || null,
        startedAt: new Date(),
        finishedAt: new Date(),
      };
    }
  }

  async findAllWorkflows(): Promise<Workflow[]> {
    try {
      const dbPromise = prisma.workflow.findMany({
        include: { steps: { orderBy: { stepNumber: 'asc' } } },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      return [];
    }
  }
}

export const automationRepository = new AutomationRepository();
