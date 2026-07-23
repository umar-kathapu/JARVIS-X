import { PluginManifest } from '../types/manifest.types.js';
import { validatePluginManifest } from '../manifest/validator.js';
import { logger } from '../../utils/logger.js';

export class PluginLoader {
  loadManifest(rawManifestJson: unknown): PluginManifest {
    logger.info('Validating raw plugin manifest format');
    return validatePluginManifest(rawManifestJson);
  }

  checkCompatibility(manifest: PluginManifest, currentHostVersion = '1.0.0'): boolean {
    if (manifest.minJarvisVersion > currentHostVersion) {
      logger.warn(`Plugin '${manifest.id}' requires JARVIS version >= ${manifest.minJarvisVersion}`);
      return false;
    }
    return true;
  }
}

export const pluginLoader = new PluginLoader();
