import { describe, it, expect } from 'vitest';
import { env } from '../../../src/config/env.js';
import { appConfig } from '../../../src/config/app.config.js';

describe('Configuration System Subsystem Integration Tests', () => {
  it('1. Should parse and validate environment variables with strict schema rules', () => {
    expect(env).toBeDefined();
    expect(env.PORT).toBeGreaterThan(0);
    expect(env.HOST).toBeDefined();
    expect(env.NODE_ENV).toBeDefined();
    expect(env.DATABASE_URL).toBeDefined();
  });

  it('2. Should provide runtime appConfig with security & CORS boundaries', () => {
    expect(appConfig).toBeDefined();
    expect(appConfig.name).toContain('JARVIS-X');
    expect(appConfig.security.jwtSecret).toBeDefined();
    expect(appConfig.security.jwtSecret.length).toBeGreaterThanOrEqual(32);
    expect(appConfig.cors.credentials).toBe(true);
    expect(Array.isArray(appConfig.cors.origin)).toBe(true);
  });
});
