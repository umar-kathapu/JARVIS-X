import { describe, it, expect } from 'vitest';
import { screenService } from '../src/main/screen/screen.service.js';

describe('Screen Service Diagnostic', () => {
  it('captures screen', async () => {
    const res = await screenService.capturePrimaryScreen();
    console.log('Diagnostic Screen Result:', res);
    expect(res).toBeDefined();
    expect(res?.sizeBytes).toBeGreaterThan(0);
  });
});
