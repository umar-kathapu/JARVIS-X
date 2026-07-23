import { Automation, AutomationExecution, Workflow } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class AutomationRepository extends BaseRepository<Automation> {
  protected modelName = 'Automation';

  async createAutomation(name: string, cronExpression: string, description?: string): Promise<Automation> {
    return prisma.automation.create({
      data: { name, cronExpression, description },
    });
  }

  async recordExecution(automationId: string, status: 'RUNNING' | 'SUCCESS' | 'FAILURE' = 'RUNNING', logOutput?: string): Promise<AutomationExecution> {
    return prisma.automationExecution.create({
      data: { automationId, status, logOutput },
    });
  }

  async findAllWorkflows(): Promise<Workflow[]> {
    return prisma.workflow.findMany({
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });
  }
}

export const automationRepository = new AutomationRepository();
