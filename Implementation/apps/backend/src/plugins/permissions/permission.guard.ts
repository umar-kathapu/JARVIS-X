import { PluginManifest, PluginPermissionType } from '../types/manifest.types.js';
import { logger } from '../../utils/logger.js';

export class PermissionGuard {
  static assertPermission(manifest: PluginManifest, required: PluginPermissionType): void {
    if (!manifest.permissions.includes(required)) {
      const err = `Security Error: Plugin '${manifest.id}' attempted to access '${required}' without declaring permission in manifest.`;
      logger.error(err);
      throw new Error(err);
    }
  }

  static hasPermission(manifest: PluginManifest, required: PluginPermissionType): boolean {
    return manifest.permissions.includes(required);
  }
}
