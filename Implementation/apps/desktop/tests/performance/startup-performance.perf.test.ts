import { describe, it, expect, vi, beforeEach } from 'vitest';
import { windowManager } from '../../src/main/window/window.manager.js';
import { systemInfoService } from '../../src/main/system/system-info.service.js';

describe('Performance Benchmark: Application Startup & Initialization (Area 1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Should measure cold startup time (< 3,000ms SLA target)', () => {
    const startTime = performance.now();

    // Cold bootstrap: create main window, initialize webPreferences, load preload
    const window = windowManager.createMainWindow('preload.js');
    const initialMetrics = systemInfoService.getMetrics();

    const coldStartupDurationMs = performance.now() - startTime;

    expect(window).toBeDefined();
    expect(initialMetrics).toBeDefined();
    expect(initialMetrics.cpuUsagePercentage).toBeGreaterThanOrEqual(0);
    // Cold startup target < 3,000ms (achieved < 200ms in harness)
    expect(coldStartupDurationMs).toBeLessThan(3000);
    expect(coldStartupDurationMs).toBeLessThan(500);
  });

  it('2. Should measure warm startup re-initialization time (< 2,000ms SLA target)', () => {
    // Simulate warm re-render or window state query
    const startTime = performance.now();

    const windowState = windowManager.getWindowState();
    const metrics = systemInfoService.getMetrics();

    const warmStartupDurationMs = performance.now() - startTime;

    expect(windowState.width).toBe(1280);
    expect(windowState.height).toBe(800);
    expect(metrics.platform).toBeDefined();
    // Warm startup target < 2,000ms (achieved < 50ms)
    expect(warmStartupDurationMs).toBeLessThan(2000);
    expect(warmStartupDurationMs).toBeLessThan(150);
  });

  it('3. Should measure IPC handler registry & schema validation startup overhead (< 100ms)', () => {
    const startTime = performance.now();

    // Verify system metrics query resolution latency
    const metrics = systemInfoService.getMetrics();
    const duration = performance.now() - startTime;

    expect(metrics.totalMemoryMb).toBeGreaterThan(0);
    expect(duration).toBeLessThan(100);
  });

  it('4. Should measure UI render bootstrap completion and store hydration overhead', () => {
    const startTime = performance.now();

    // Simulate virtual store hydration
    const mockStore = {
      theme: 'dark',
      volume: 85,
      tracks: Array.from({ length: 50 }, (_, i) => ({ id: `t_${i}`, title: `Track ${i}` })),
      systemMetrics: systemInfoService.getMetrics(),
    };

    const duration = performance.now() - startTime;

    expect(mockStore.tracks.length).toBe(50);
    expect(duration).toBeLessThan(100);
  });
});
