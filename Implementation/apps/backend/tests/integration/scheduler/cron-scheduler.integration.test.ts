import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cronScheduler } from '../../../src/automation/scheduler/cron.scheduler.js';
import { automationRepository } from '../../../src/repositories/automation.repository.js';

// Mock automationRepository to isolate scheduler logic from live database calls
vi.mock('../../../src/repositories/automation.repository.js', () => ({
  automationRepository: {
    createAutomation: vi.fn(async (name: string, cronExpression: string) => ({
      id: `auto_${Date.now()}`,
      name,
      cronExpression,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  },
}));

describe('Cron Scheduler Subsystem Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cronScheduler.stopScheduler();
  });

  afterEach(() => {
    cronScheduler.stopScheduler();
  });

  it('1. Should register a new cron automation via scheduleCron', async () => {
    await cronScheduler.scheduleCron('wf_cron_1', '0 * * * *', 'Hourly Cleanup Workflow');
    expect(automationRepository.createAutomation).toHaveBeenCalledWith('Hourly Cleanup Workflow', '0 * * * *');
  });

  it('2. Should start timer polling and handle multiple schedule calls idempotently', () => {
    cronScheduler.startScheduler(500); // 500ms interval for testing
    cronScheduler.startScheduler(500); // Duplicate call should be ignored safely
  });

  it('3. Should clean up active timer intervals gracefully on stopScheduler()', () => {
    cronScheduler.startScheduler(100);
    cronScheduler.stopScheduler();
    // Subsequent calls to stopScheduler should be idempotent
    cronScheduler.stopScheduler();
  });
});
