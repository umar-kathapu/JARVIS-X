import { IPlugin, PluginContext } from '../types/plugin.types.js';
import { lifecycleManager } from '../lifecycle/lifecycle.manager.js';
import { DiagnosticPlugin } from '../sample/diagnostic-plugin.js';
import { marketplaceService } from '../marketplace/marketplace.service.js';
import { logger } from '../../utils/logger.js';

export class PluginEngine {
  private static instance: PluginEngine;

  private constructor() {
    logger.info('🔌 JARVIS-X Plugin Engine initialized');
  }

  public static getInstance(): PluginEngine {
    if (!PluginEngine.instance) {
      PluginEngine.instance = new PluginEngine();
    }
    return PluginEngine.instance;
  }

  async initializeDefaultPlugins(): Promise<void> {
    const diagnosticPlugin = new DiagnosticPlugin();
    const context: PluginContext = {
      manifest: diagnosticPlugin.manifest,
      storagePath: '/plugins/system-diagnostics',
      config: {},
    };

    if (diagnosticPlugin.onInstall) {
      await diagnosticPlugin.onInstall(context);
    }
    await lifecycleManager.enablePlugin(diagnosticPlugin, context);
  }

  async disablePlugin(pluginId: string): Promise<void> {
    await lifecycleManager.disablePlugin(pluginId);
  }

  getActivePlugins(): IPlugin[] {
    return lifecycleManager.getActivePlugins();
  }

  async searchMarketplace(query?: string) {
    return marketplaceService.searchPlugins(query);
  }
}

export const pluginEngine = PluginEngine.getInstance();
