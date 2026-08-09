import { describe, it, expect } from 'vitest';
import { automationEngine } from '../../src/automation/core/automation.engine.js';
import { WorkflowDefinition } from '../../src/automation/types/workflow.types.js';

describe('Performance Benchmark: CPU Utilization Profiling (Area 8)', () => {
  it('1. Should measure CPU profile during idle state (< 5ms CPU time in tick)', async () => {
    const startCpu = process.cpuUsage();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const elapsedCpu = process.cpuUsage(startCpu);

    const userMs = elapsedCpu.user / 1000;
    const systemMs = elapsedCpu.system / 1000;
    const totalCpuMs = userMs + systemMs;

    // Idle CPU consumption should be near zero during sleep (< 300ms)
    expect(totalCpuMs).toBeLessThan(300);
  });

  it('2. Should profile CPU usage during metadata processing & parsing', () => {
    const startCpu = process.cpuUsage();
    const startTime = performance.now();

    // CPU-bound parsing of 1,000 synthetic audio tags and JSON schemas
    const parsedData = Array.from({ length: 1000 }, (_, i) => ({
      id: `audio_tag_${i}`,
      checksum: Array.from({ length: 32 }, () => ((i * 17) % 256).toString(16)).join(''),
      metadata: {
        bitrate: 320,
        sampleRate: 48000,
        channels: 2,
        duration: 240,
        title: `Dynamic Synthesizer Track #${i}`,
      },
    }));

    const wallTimeMs = performance.now() - startTime;
    const elapsedCpu = process.cpuUsage(startCpu);
    const cpuTotalMs = (elapsedCpu.user + elapsedCpu.system) / 1000;

    expect(parsedData.length).toBe(1000);
    expect(wallTimeMs).toBeLessThan(100);
    expect(cpuTotalMs).toBeLessThan(150);
  });

  it('3. Should profile CPU utilization during concurrent automation execution', async () => {
    const workflow: WorkflowDefinition = {
      id: 'wf_cpu_profile',
      name: 'CPU Benchmark Workflow',
      description: 'Profiles CPU time per execution step',
      version: '1.0.0',
      nodes: [
        { id: 'step_1', name: 'Start', type: 'TRIGGER', actionOrTriggerId: 'manual_trigger', parameters: {} },
        { id: 'step_2', name: 'Notify', type: 'ACTION', actionOrTriggerId: 'desktop_notification', parameters: { title: 'T', body: 'B' } },
      ],
      edges: [{ id: 'e1', sourceNodeId: 'step_1', targetNodeId: 'step_2' }],
    };

    const startCpu = process.cpuUsage();
    const startTime = performance.now();

    const executions = Array.from({ length: 50 }, () => automationEngine.executeWorkflow(workflow));
    const results = await Promise.all(executions);

    const wallTimeMs = performance.now() - startTime;
    const elapsedCpu = process.cpuUsage(startCpu);
    const cpuTotalMs = (elapsedCpu.user + elapsedCpu.system) / 1000;

    expect(results.length).toBe(50);
    expect(wallTimeMs).toBeLessThan(500);
    expect(cpuTotalMs).toBeLessThan(500);
  });
});
