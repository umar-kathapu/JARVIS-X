import { PluginManifest, PluginState } from './manifest.types.js';

export interface PluginContext {
  manifest: PluginManifest;
  storagePath: string;
  config: Record<string, unknown>;
}

export interface PluginHealthStatus {
  pluginId: string;
  state: PluginState;
  uptimeSeconds: number;
  memoryUsageMb: number;
  lastErrorMessage?: string;
}

export interface IPlugin {
  readonly manifest: PluginManifest;
  onInstall?(context: PluginContext): Promise<void>;
  onEnable?(context: PluginContext): Promise<void>;
  onDisable?(): Promise<void>;
  onRemove?(): Promise<void>;
  onHealthCheck?(): Promise<PluginHealthStatus>;
}
