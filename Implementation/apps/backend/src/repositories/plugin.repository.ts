import { Plugin } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class PluginRepository extends BaseRepository<Plugin> {
  protected modelName = 'Plugin';

  async findAllPlugins(): Promise<Plugin[]> {
    try {
      const dbPromise = prisma.plugin.findMany({
        include: { settings: true, permissions: true },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      return [];
    }
  }

  async findPluginByName(name: string): Promise<Plugin | null> {
    try {
      const dbPromise = prisma.plugin.findUnique({
        where: { name },
        include: { settings: true, permissions: true },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      return null;
    }
  }

  async togglePluginStatus(id: string, enabled: boolean): Promise<Plugin> {
    try {
      const dbPromise = prisma.plugin.update({
        where: { id },
        data: { enabled },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      return await Promise.race([dbPromise, timeoutPromise]);
    } catch (err) {
      return {
        id,
        name: id,
        version: '1.0.0',
        description: 'Offline plugin placeholder',
        author: 'JARVIS-X',
        enabled,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }
}

export const pluginRepository = new PluginRepository();
