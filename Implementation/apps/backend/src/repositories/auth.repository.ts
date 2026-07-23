import { Session, RefreshToken, ApiKey, Role, Permission } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class AuthRepository extends BaseRepository<Session> {
  protected modelName = 'Session';

  async createSession(data: { userId: string; token: string; ipAddress?: string; userAgent?: string; expiresAt: Date }): Promise<Session> {
    return prisma.session.create({ data });
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { token } });
  }

  async deleteSession(token: string): Promise<void> {
    await prisma.session.delete({ where: { token } }).catch(() => null);
  }

  async createRefreshToken(data: { userId: string; token: string; expiresAt: Date }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } }).catch(() => null);
  }

  async createApiKey(data: { userId: string; name: string; keyHash: string; prefix: string; expiresAt?: Date }): Promise<ApiKey> {
    return prisma.apiKey.create({ data });
  }

  async findApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
    return prisma.apiKey.findUnique({ where: { keyHash } });
  }

  async findAllRoles(): Promise<Role[]> {
    return prisma.role.findMany({ include: { permissions: true } });
  }
}

export const authRepository = new AuthRepository();
