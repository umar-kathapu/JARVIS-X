import { PluginManifest } from '../types/manifest.types.js';
import { PermissionGuard } from '../permissions/permission.guard.js';
import { aiEngine } from '../../ai/core/ai.engine.js';
import { memoryEngine } from '../../memory/core/memory.engine.js';
import { eventBus, SystemEventType } from '../events/event-bus.js';
import { logger } from '../../utils/logger.js';

export interface IPluginAPI {
  generateText(prompt: string): Promise<string>;
  remember(key: string, content: string): Promise<void>;
  recall(query: string): Promise<unknown[]>;
  publishEvent(type: SystemEventType, data: unknown): void;
  subscribeEvent(type: SystemEventType, handler: (payload: unknown) => void): () => void;
  logInfo(message: string): void;
}

export class PluginAPIBridge implements IPluginAPI {
  private manifest: PluginManifest;

  constructor(manifest: PluginManifest) {
    this.manifest = manifest;
  }

  async generateText(prompt: string): Promise<string> {
    PermissionGuard.assertPermission(this.manifest, 'AI_ACCESS');
    const response = await aiEngine.chat([
      { role: 'system', content: `Request from plugin ${this.manifest.name}` },
      { role: 'user', content: prompt },
    ]);
    return response.content;
  }

  async remember(key: string, content: string): Promise<void> {
    PermissionGuard.assertPermission(this.manifest, 'MEMORY_ACCESS');
    await memoryEngine.remember(key, content, 'LONG_TERM', 0.9, [`plugin:${this.manifest.id}`]);
  }

  async recall(query: string): Promise<unknown[]> {
    PermissionGuard.assertPermission(this.manifest, 'MEMORY_ACCESS');
    return memoryEngine.recall(query);
  }

  publishEvent(type: SystemEventType, data: unknown): void {
    eventBus.publish(type, `plugin:${this.manifest.id}`, data);
  }

  subscribeEvent(type: SystemEventType, handler: (payload: unknown) => void): () => void {
    return eventBus.subscribe(type, handler);
  }

  logInfo(message: string): void {
    logger.info(`[Plugin API: ${this.manifest.id}] ${message}`);
  }
}
