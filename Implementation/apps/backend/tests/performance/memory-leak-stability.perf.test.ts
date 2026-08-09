import { describe, it, expect } from 'vitest';
import { EventBus } from '../../src/plugins/events/event-bus.js';
import { jobQueue } from '../../src/automation/queue/job.queue.js';

describe('Performance Benchmark: Memory Leak & Heap Stability (Area 7)', () => {
  it('1. Should maintain stable memory heap usage over 1,000 pub/sub event cycles (< 10MB growth)', () => {
    const bus = new EventBus();
    const initialHeap = process.memoryUsage().heapUsed;

    for (let i = 0; i < 1000; i++) {
      const unsub = bus.subscribe('MEMORY_STORED', () => {});
      bus.publish('MEMORY_STORED', 'test', { iteration: i });
      unsub();
    }

    const finalHeap = process.memoryUsage().heapUsed;
    const growthMb = (finalHeap - initialHeap) / (1024 * 1024);

    // Heap growth after 1,000 unsubscribed cycles should be negligible (< 10MB)
    expect(growthMb).toBeLessThan(10);
  });

  it('2. Should maintain stable heap usage during continuous playlist allocations (1,000 playlist cycles)', () => {
    const initialHeap = process.memoryUsage().heapUsed;
    const playlistMap = new Map<string, string[]>();

    for (let i = 0; i < 1000; i++) {
      const plId = `pl_${i}`;
      playlistMap.set(plId, Array.from({ length: 50 }, (_, j) => `track_${i}_${j}`));
      if (i % 2 === 0) {
        playlistMap.delete(plId);
      }
    }

    playlistMap.clear();
    const finalHeap = process.memoryUsage().heapUsed;
    const growthMb = (finalHeap - initialHeap) / (1024 * 1024);

    expect(growthMb).toBeLessThan(10);
  });

  it('3. Should maintain bounded heap during sustained job queue cycles (1,000 enqueued & drained jobs)', () => {
    const initialHeap = process.memoryUsage().heapUsed;

    for (let i = 0; i < 1000; i++) {
      jobQueue.enqueue(`wf_sustained_${i}`, { step: i, payload: 'data_chunk' }, 'NORMAL');
    }

    expect(jobQueue.getQueueLength()).toBe(1000);

    let drained = 0;
    while (jobQueue.getQueueLength() > 0) {
      jobQueue.dequeue();
      drained++;
    }

    expect(drained).toBe(1000);
    const finalHeap = process.memoryUsage().heapUsed;
    const growthMb = (finalHeap - initialHeap) / (1024 * 1024);

    expect(growthMb).toBeLessThan(10);
  });
});
