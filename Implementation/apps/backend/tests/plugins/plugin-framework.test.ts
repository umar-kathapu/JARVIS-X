import { describe, it, expect } from 'vitest';
import { validatePluginManifest } from '../../src/plugins/manifest/validator.js';
import { PermissionGuard } from '../../src/plugins/permissions/permission.guard.js';
import { SandboxRunner } from '../../src/plugins/sandbox/sandbox.runner.js';
import { eventBus } from '../../src/plugins/events/event-bus.js';
import { DiagnosticPlugin } from '../../src/plugins/sample/diagnostic-plugin.ts';
import { pluginEngine } from '../../src/plugins/core/plugin.engine.js';

describe('Plugin Framework Unit Tests', () => {
  it('validatePluginManifest should validate valid manifest object', () => {
    const raw = {
      id: 'test-plugin',
      name: 'Test Plugin',
      description: 'A valid test plugin description',
      author: 'Test Dev',
      version: '1.0.0',
      license: 'MIT',
      category: 'UTILITY',
      keywords: ['test'],
      entryPoint: 'index.js',
      permissions: ['AI_ACCESS'],
      minJarvisVersion: '1.0.0',
      supportedPlatforms: ['win32', 'darwin', 'linux'],
    };

    const manifest = validatePluginManifest(raw);
    expect(manifest.id).toBe('test-plugin');
  });

  it('PermissionGuard should throw security error if permission not in manifest', () => {
    const diagnostic = new DiagnosticPlugin();
    expect(() => {
      PermissionGuard.assertPermission(diagnostic.manifest, 'SHELL_EXECUTE');
    }).toThrow('Security Error');
  });

  it('SandboxRunner should execute operations safely and catch timeouts', async () => {
    const diagnostic = new DiagnosticPlugin();
    const result = await SandboxRunner.executeSafe(diagnostic, 'testOp', async () => 'SUCCESS', 1000);
    expect(result).toBe('SUCCESS');
  });

  it('EventBus should handle subscribe and publish correctly', () => {
    let receivedData: unknown = null;
    const unsubscribe = eventBus.subscribe('CUSTOM_TEST_EVENT', (payload) => {
      receivedData = payload.data;
    });

    eventBus.publish('CUSTOM_TEST_EVENT', 'UnitTest', { key: 'value' });
    expect(receivedData).toEqual({ key: 'value' });

    unsubscribe();
  });

  it('PluginEngine should initialize default sample plugin', async () => {
    await pluginEngine.initializeDefaultPlugins();
    const active = pluginEngine.getActivePlugins();
    expect(active.length).toBeGreaterThan(0);
    expect(active[0]?.manifest.id).toBe('system-diagnostics');
  });
});
