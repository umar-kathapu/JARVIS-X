import { IPlugin, PluginContext, PluginHealthStatus } from '../types/plugin.types.js';
import { PluginManifest } from '../types/manifest.types.js';
import { PluginAPIBridge } from '../api/plugin-api.impl.js';

export class DiagnosticPlugin implements IPlugin {
  readonly manifest: PluginManifest = {
    id: 'system-diagnostics',
    name: 'System Diagnostic Assistant',
    description: 'Monitors CPU, Memory, and System Health metrics for JARVIS-X',
    author: 'JARVIS-X Core Team',
    version: '1.0.0',
    license: 'MIT',
    category: 'UTILITY',
    keywords: ['diagnostics', 'health', 'metrics'],
    entryPoint: 'index.js',
    permissions: ['AI_ACCESS', 'MEMORY_ACCESS'],
    minJarvisVersion: '1.0.0',
    supportedPlatforms: ['win32', 'darwin', 'linux'],
  };

  private apiBridge!: PluginAPIBridge;

  async onInstall(context: PluginContext): Promise<void> {
    this.apiBridge = new PluginAPIBridge(this.manifest);
    this.apiBridge.logInfo(`Plugin '${this.manifest.name}' installed successfully at ${context.storagePath}`);
  }

  async onEnable(_context: PluginContext): Promise<void> {
    this.apiBridge = new PluginAPIBridge(this.manifest);
    this.apiBridge.logInfo(`Plugin '${this.manifest.name}' enabled.`);
    await this.apiBridge.remember('diagnostic_status', 'System diagnostic plugin is active');
  }

  async onDisable(): Promise<void> {
    if (this.apiBridge) {
      this.apiBridge.logInfo(`Plugin '${this.manifest.name}' disabled.`);
    }
  }

  async onHealthCheck(): Promise<PluginHealthStatus> {
    return {
      pluginId: this.manifest.id,
      state: 'ENABLED',
      uptimeSeconds: 120,
      memoryUsageMb: 14,
    };
  }
}
