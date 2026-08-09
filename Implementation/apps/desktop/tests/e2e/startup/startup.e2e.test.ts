import { describe, it, expect, beforeEach, vi } from 'vitest';
import { windowManager } from '../../../src/main/window/window.manager.js';
import { systemInfoService } from '../../../src/main/system/system-info.service.js';

describe('E2E Application Startup & IPC Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should launch main window with strict Electron security preferences', async () => {
    const window = windowManager.createMainWindow('preload.js');

    expect(window).toBeDefined();
    const webPreferences = window.webPreferences;
    expect(webPreferences.sandbox).toBe(true);
    expect(webPreferences.webSecurity).toBe(true);
    expect(webPreferences.contextIsolation).toBe(true);
    expect(webPreferences.nodeIntegration).toBe(false);
  });

  it('2. Should retrieve valid system diagnostic metrics on startup', () => {
    const metrics = systemInfoService.getMetrics();

    expect(metrics).toBeDefined();
    expect(metrics.platform).toBeDefined();
    expect(metrics.arch).toBeDefined();
    expect(metrics.totalMemoryMb).toBeGreaterThan(0);
    expect(metrics.freeMemoryMb).toBeGreaterThanOrEqual(0);
    expect(metrics.cpuUsagePercentage).toBeGreaterThanOrEqual(0);
  });

  it('3. Should handle window state query when window is open', () => {
    const window = windowManager.createMainWindow('preload.js');
    expect(windowManager.getMainWindow()).toBe(window);

    const state = windowManager.getWindowState();
    expect(state.width).toBe(1280);
    expect(state.height).toBe(800);
  });
});
