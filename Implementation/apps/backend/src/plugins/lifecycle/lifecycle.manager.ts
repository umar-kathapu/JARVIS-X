import { IPlugin, PluginContext } from '../types/plugin.types.js';
import { SandboxRunner } from '../sandbox/sandbox.runner.js';
import { pluginRepository } from '../../repositories/plugin.repository.js';
import { eventBus } from '../events/event-bus.js';
import { logger } from '../../utils/logger.js';

export class LifecycleManager {
  private activePlugins: Map<string, IPlugin> = new Map();

  async enablePlugin(plugin: IPlugin, context: PluginContext): Promise<void> {
    logger.info(`Enabling plugin: '${plugin.manifest.id}'`);
    if (plugin.onEnable) {
      await SandboxRunner.executeSafe(plugin, 'onEnable', () => plugin.onEnable!(context));
    }
    this.activePlugins.set(plugin.manifest.id, plugin);

    await pluginRepository.togglePluginStatus(plugin.manifest.id, true).catch(() => null);
    eventBus.publish('PLUGIN_INSTALLED', 'LifecycleManager', { pluginId: plugin.manifest.id });
  }

  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.activePlugins.get(pluginId);
    if (!plugin) return;

    logger.info(`Disabling plugin: '${pluginId}'`);
    if (plugin.onDisable) {
      await SandboxRunner.executeSafe(plugin, 'onDisable', () => plugin.onDisable!());
    }
    this.activePlugins.delete(pluginId);
    await pluginRepository.togglePluginStatus(pluginId, false).catch(() => null);
  }

  getActivePlugins(): IPlugin[] {
    return Array.from(this.activePlugins.values());
  }
}

export const lifecycleManager = new LifecycleManager();
