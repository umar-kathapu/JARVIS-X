import { AuditLog, SystemLog, FeatureFlag, AuditAction } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class SystemRepository extends BaseRepository<AuditLog> {
  protected modelName = 'AuditLog';

  async recordAudit(action: AuditAction, resource: string, userId?: string, details?: Record<string, unknown>, ipAddress?: string): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        action,
        resource,
        userId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        ipAddress,
      },
    });
  }

  async recordSystemLog(level: string, scope: string, message: string, metadata?: Record<string, unknown>): Promise<SystemLog> {
    return prisma.systemLog.create({
      data: {
        level,
        scope,
        message,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  }

  async isFeatureEnabled(name: string): Promise<boolean> {
    const flag = await prisma.featureFlag.findUnique({ where: { name } });
    return flag ? flag.isEnabled : false;
  }

  async setFeatureFlag(name: string, isEnabled: boolean, description?: string): Promise<FeatureFlag> {
    return prisma.featureFlag.upsert({
      where: { name },
      update: { isEnabled },
      create: { name, isEnabled, description },
    });
  }
}

export const systemRepository = new SystemRepository();
