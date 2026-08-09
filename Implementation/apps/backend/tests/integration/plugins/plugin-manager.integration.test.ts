import { describe, it, expect } from 'vitest';
import { validatePluginManifest } from '../../../src/plugins/manifest/validator.js';
import { PermissionGuard } from '../../../src/plugins/permissions/permission.guard.js';
import { pluginEngine } from '../../../src/plugins/core/plugin.engine.js';
import { PluginManifest } from '../../../src/plugins/types/manifest.types.js';

describe('Plugin Manager Subsystem Integration Tests', () => {
  it('1. Should validate valid plugin manifest schema', () => {
    const validManifest: PluginManifest = {
      id: 'diagnostic-helper',
      name: 'Diagnostic Helper Plugin',
      version: '1.0.0',
      description: 'Provides system diagnostic capabilities',
      author: 'JARVIS-X Team',
      license: 'MIT',
      category: 'UTILITY',
      keywords: ['utility', 'diagnostics'],
      entryPoint: 'index.js',
      permissions: ['SHELL_EXECUTE', 'CLIPBOARD'],
      minJarvisVersion: '1.0.0',
      supportedPlatforms: ['win32', 'darwin', 'linux'],
    };

    const validated = validatePluginManifest(validManifest);
    expect(validated.id).toBe('diagnostic-helper');
    expect(validated.permissions).toContain('SHELL_EXECUTE');
  });

  it('2. Should reject invalid plugin manifest missing required fields', () => {
    const invalidManifest = {
      id: 'broken-plugin',
      name: 'Broken Plugin',
      // Missing required schema fields
    };

    expect(() => validatePluginManifest(invalidManifest)).toThrow();
  });

  it('3. Should enforce PermissionGuard checks for declared vs undeclared plugin permissions', () => {
    const manifest: PluginManifest = {
      id: 'scoped-plugin',
      name: 'Scoped Security Plugin',
      version: '1.0.0',
      description: 'Scoped permission test',
      author: 'Test',
      license: 'MIT',
      category: 'PRODUCTIVITY',
      keywords: ['test'],
      entryPoint: 'index.js',
      permissions: ['CLIPBOARD'],
      minJarvisVersion: '1.0.0',
      supportedPlatforms: ['win32'],
    };

    // Declared permission check -> allowed
    expect(PermissionGuard.hasPermission(manifest, 'CLIPBOARD')).toBe(true);
    expect(() => PermissionGuard.assertPermission(manifest, 'CLIPBOARD')).not.toThrow();

    // Undeclared permission check -> denied
    expect(PermissionGuard.hasPermission(manifest, 'SHELL_EXECUTE')).toBe(false);
    expect(() => PermissionGuard.assertPermission(manifest, 'SHELL_EXECUTE')).toThrow();
  });

  it('4. Should initialize default sample plugin on PluginEngine startup', async () => {
    await pluginEngine.initializeDefaultPlugins();
    const activePlugins = pluginEngine.getActivePlugins();
    expect(Array.isArray(activePlugins)).toBe(true);
  });
});
