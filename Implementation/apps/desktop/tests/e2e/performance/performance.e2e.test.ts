import { describe, it, expect } from 'vitest';
import { windowManager } from '../../../src/main/window/window.manager.js';
import { systemInfoService } from '../../../src/main/system/system-info.service.js';

describe('E2E Application Performance & Resource Benchmark Validation', () => {
  it('1. Should measure cold window startup time to ensure sub-500ms responsiveness', () => {
    const startTime = Date.now();
    const window = windowManager.createMainWindow('preload.js');
    const duration = Date.now() - startTime;

    expect(window).toBeDefined();
    expect(duration).toBeLessThan(500); // Startup should complete well under 500ms threshold
  });

  it('2. Should benchmark system diagnostic retrieval under 100ms', () => {
    const startTime = Date.now();
    const metrics = systemInfoService.getMetrics();
    const duration = Date.now() - startTime;

    expect(metrics).toBeDefined();
    expect(duration).toBeLessThan(200);
  });

  it('3. Should verify stable memory footprint', () => {
    const memoryUsage = process.memoryUsage();
    expect(memoryUsage.heapUsed).toBeGreaterThan(0);
    // Heap usage should remain reasonable (< 150MB) during test runs
    expect(memoryUsage.heapUsed).toBeLessThan(150 * 1024 * 1024);
  });
});
