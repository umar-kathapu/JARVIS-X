import { describe, it, expect } from 'vitest';
import { applicationResolver } from '../../src/main/agent/application.resolver.js';

describe('Windows Multi-Source Application Resolver Suite', () => {
  it('normalizes application names and aliases correctly', () => {
    expect(applicationResolver.normalizeAppName('Open VS Code')).toBe('vs code');
    expect(applicationResolver.normalizeAppName('Visual Studio Code.exe')).toBe('visual studio code');
    expect(applicationResolver.normalizeAppName('please launch Google Chrome app')).toBe('google chrome');
    expect(applicationResolver.normalizeAppName('Notepad')).toBe('notepad');
  });

  it('resolves Notepad from Windows System32', () => {
    const res = applicationResolver.resolve('Notepad');
    expect(res.found).toBe(true);
    expect(res.method).toBe('APPLICATION_LAUNCH');
    expect(res.executablePath?.toLowerCase()).toContain('notepad.exe');
  });

  it('resolves Calculator from Windows System32', () => {
    const res = applicationResolver.resolve('calculator');
    expect(res.found).toBe(true);
    expect(res.method).toBe('APPLICATION_LAUNCH');
    expect(res.executablePath?.toLowerCase()).toContain('calc.exe');
  });

  it('resolves Windows Settings via URI protocol', () => {
    const res = applicationResolver.resolve('Settings');
    expect(res.found).toBe(true);
    expect(res.method).toBe('URI_LAUNCH');
    expect(res.executablePath).toBe('ms-settings:');
  });

  it('gracefully falls back to browser URL for web-first service Instagram', () => {
    const res = applicationResolver.resolve('Instagram');
    expect(res.found).toBe(true);
    expect(res.method).toBe('BROWSER_FALLBACK');
    expect(res.targetUrl).toBe('https://www.instagram.com/');
  });

  it('returns found: false for unknown application', () => {
    const res = applicationResolver.resolve('completely_unknown_app_xyz_99999');
    expect(res.found).toBe(false);
    expect(res.source).toBe('UNKNOWN');
  });

  it('executes launch on resolved app and returns structured evidence', async () => {
    const resolved = applicationResolver.resolve('notepad');
    const launchRes = await applicationResolver.launch(resolved);

    expect(launchRes.success).toBe(true);
    expect(launchRes.verified).toBe(true);
    expect(launchRes.method).toBe('APPLICATION_LAUNCH');
    expect(launchRes.pid).toBeDefined();

    // Clean up launched test process
    if (launchRes.pid) {
      try {
        process.kill(launchRes.pid);
      } catch {}
    }
  });
});
