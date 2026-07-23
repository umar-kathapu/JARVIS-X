import { IPlugin, PluginContext, PluginHealthStatus } from '../types/plugin.types.js';
import { logger } from '../../utils/logger.js';

export class SandboxRunner {
  static async executeSafe<T>(
    plugin: IPlugin,
    operationName: string,
    fn: () => Promise<T>,
    timeoutMs = 10000,
  ): Promise<T> {
    logger.info(`[Sandbox: ${plugin.manifest.id}] Executing '${operationName}' with timeout ${timeoutMs}ms`);

    let timer: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Sandbox Execution Timeout (${timeoutMs}ms) exceeded during '${operationName}' in plugin '${plugin.manifest.id}'`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (err) {
      logger.error({ error: err, pluginId: plugin.manifest.id, operationName }, `[Sandbox Error] Operation failed in plugin`);
      throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  static async getHealth(plugin: IPlugin): Promise<PluginHealthStatus> {
    if (plugin.onHealthCheck) {
      return plugin.onHealthCheck();
    }

    return {
      pluginId: plugin.manifest.id,
      state: 'ENABLED',
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
  }
}
