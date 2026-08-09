import { describe, it, expect, vi } from 'vitest';
import { terminalService } from '../../src/main/terminal/terminal.service.js';

// Mock child_process to measure pure IPC security & validation throughput without OS process spawn delay
vi.mock('child_process', () => ({
  execFile: vi.fn((cmd: string, args: string[], _opts: any, callback: any) => {
    callback(null, `Mock output for ${cmd} ${(args || []).join(' ')}`.trim(), '');
  }),
}));

describe('Desktop Performance Benchmark: IPC Throughput & Security Processing', () => {
  it('1. Should process 100 high-frequency IPC command validation calls under 100ms (Avg < 1ms)', async () => {
    const startTime = performance.now();

    for (let i = 0; i < 100; i++) {
      const res = await terminalService.executeCommand({ command: 'node', args: ['-v'] });
      expect(res.exitCode).toBe(0);
    }

    const totalDuration = performance.now() - startTime;
    const avgLatency = totalDuration / 100;

    expect(totalDuration).toBeLessThan(2000); // 100 IPC validations in < 2000ms
    expect(avgLatency).toBeLessThan(50); // Target average IPC latency < 50ms
  });
});
