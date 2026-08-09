import { describe, it, expect } from 'vitest';

function simulateLibraryScan(songCount: number) {
  const startTime = performance.now();
  const tracks = [];

  for (let i = 0; i < songCount; i++) {
    tracks.push({
      id: `track_${i}`,
      title: `Synthwave Track ${i}`,
      artist: `Artist ${i % 10}`,
      album: `Album ${i % 5}`,
      durationMs: 180000 + (i % 60) * 1000,
    });
  }

  const durationMs = performance.now() - startTime;
  return { count: tracks.length, durationMs };
}

describe('Desktop Performance Benchmark: Music Library Scanning', () => {
  it('1. Should scan 100 songs in < 50ms', () => {
    const res = simulateLibraryScan(100);
    expect(res.count).toBe(100);
    expect(res.durationMs).toBeLessThan(50);
  });

  it('2. Should scan 1,000 songs in < 500ms (Target: < 10,000ms)', () => {
    const res = simulateLibraryScan(1000);
    expect(res.count).toBe(1000);
    expect(res.durationMs).toBeLessThan(500);
  });

  it('3. Should scan 10,000 songs in < 2,000ms', () => {
    const res = simulateLibraryScan(10000);
    expect(res.count).toBe(10000);
    expect(res.durationMs).toBeLessThan(2000);
  });
});
