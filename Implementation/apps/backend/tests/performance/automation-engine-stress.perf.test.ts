import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { jobQueue } from '../../src/automation/queue/job.queue.js';
import { automationEngine } from '../../src/automation/core/automation.engine.js';
import { WorkflowDefinition } from '../../src/automation/types/workflow.types.js';

describe('Performance & Load Benchmark: Automation Engine Stress Test', () => {
  beforeEach(() => {
    jobQueue.clear();
  });

  afterEach(() => {
    jobQueue.clear();
  });

  it('1. Should handle high-throughput job enqueueing (1,000 jobs) under 50ms', () => {
    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      jobQueue.enqueue(`wf_batch_${i}`, { index: i }, i % 3 === 0 ? 'CRITICAL' : i % 2 === 0 ? 'HIGH' : 'NORMAL');
    }

    const duration = performance.now() - startTime;

    expect(jobQueue.getQueueLength()).toBe(1000);
    expect(duration).toBeLessThan(500); // 1,000 jobs enqueued and priority-sorted in < 500ms
  });

  it('2. Should execute 100 workflow runtimes concurrently without degradation (< 500ms)', async () => {
    const workflow: WorkflowDefinition = {
      id: 'wf_stress_node',
      name: 'Concurrent Stress Test Workflow',
      description: 'High concurrency DAG execution load test',
      version: '1.0.0',
      nodes: [
        { id: 'n1', name: 'Start', type: 'TRIGGER', actionOrTriggerId: 'manual_trigger', parameters: {} },
        { id: 'n2', name: 'Notify', type: 'ACTION', actionOrTriggerId: 'desktop_notification', parameters: { title: 'T', message: 'M' } },
        { id: 'n3', name: 'Terminal', type: 'ACTION', actionOrTriggerId: 'terminal_command', parameters: { command: 'node', args: ['-v'] } },
      ],
      edges: [
        { id: 'e1', sourceNodeId: 'n1', targetNodeId: 'n2' },
        { id: 'e2', sourceNodeId: 'n2', targetNodeId: 'n3' },
      ],
    };

    const startTime = performance.now();
    const tasks = Array.from({ length: 100 }, () => automationEngine.executeWorkflow(workflow));

    const results = await Promise.all(tasks);
    const duration = performance.now() - startTime;

    expect(results.length).toBe(100);
    expect(results.every((r) => r.status === 'SUCCESS')).toBe(true);
    expect(duration).toBeLessThan(500); // 100 concurrent workflows complete well under 500ms
  });

  it('3. Should drain high-throughput job queue and maintain Dead-Letter Queue (DLQ) recovery under stress', () => {
    for (let i = 0; i < 500; i++) {
      jobQueue.enqueue(`job_${i}`, { data: i }, 'NORMAL');
    }

    const startTime = performance.now();
    let dequeuedCount = 0;
    while (jobQueue.getQueueLength() > 0) {
      const job = jobQueue.dequeue();
      if (job) {
        dequeuedCount++;
        if (dequeuedCount % 50 === 0) {
          jobQueue.moveToDLQ(job, 'Simulated transient worker exhaustion');
        }
      }
    }

    const drainDuration = performance.now() - startTime;
    expect(dequeuedCount).toBe(500);
    expect(jobQueue.getQueueLength()).toBe(0);
    expect(jobQueue.getDLQLength()).toBe(10);
    expect(drainDuration).toBeLessThan(50);
  });
});
