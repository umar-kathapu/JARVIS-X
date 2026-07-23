import { Plugin } from '@prisma/client';
import { prisma } from '../database/prisma.js';
import { BaseRepository } from './base.repository.js';

export class PluginRepository extends BaseRepository<Plugin> {
  protected modelName = 'Plugin';

  async findAllPlugins(): Promise<Plugin[]> {
    return prisma.plugin.findMany({
      include: { settings: true, permissions: true },
    });
  }

  async findPluginByName(name: string): Promise<Plugin | null> {
    return prisma.plugin.findUnique({
      where: { name },
      include: { settings: true, permissions: true },
    });
  }

  async togglePluginStatus(id: string, enabled: boolean): Promise<Plugin> {
    return prisma.plugin.update({
      where: { id },
      data: { enabled },
    });
  }
}

export const pluginRepository = new PluginRepository();
