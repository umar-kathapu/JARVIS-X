import { describe, it, expect } from 'vitest';
import { agentExecutor } from '../../src/main/agent/agent.executor.js';

describe('Agent Executor End-to-End Suite', () => {
  it('executes system diagnostics goal end-to-end with real evidence', async () => {
    const { plan, finalResponse } = await agentExecutor.executeGoal('Run system diagnostics');

    expect(plan.status).toBe('COMPLETED');
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0]?.status).toBe('COMPLETED');
    expect(plan.steps[1]?.status).toBe('COMPLETED');
    expect(plan.steps[1]?.result?.evidence?.verified).toBe(true);
    expect(finalResponse).toContain('JARVIS-X SYSTEM DIAGNOSTIC REPORT');
  }, 15000);

  it('executes software verification goal for Node.js', async () => {
    const { plan, finalResponse } = await agentExecutor.executeGoal('Check whether Node.js is installed');

    expect(plan.status).toBe('COMPLETED');
    expect(plan.steps[0]?.result?.evidence?.verified).toBe(true);
    expect(finalResponse.toLowerCase()).toContain('node');
  }, 15000);

  it('reports truthful failure when attempting to launch unknown application', async () => {
    const { plan, finalResponse } = await agentExecutor.executeGoal('Open unknown_app_xyz_999');

    expect(plan.status).toBe('FAILED');
    expect(plan.steps[0]?.status).toBe('FAILED');
    expect(finalResponse.toLowerCase()).toContain('could not be found');
  }, 15000);

  it('executes sandboxed terminal commands with real stdout', async () => {
    const { plan } = await agentExecutor.executeGoal('Run git status in the JARVIS-X project');

    expect(plan.steps[0]?.toolName).toBe('terminal.execute');
    expect(plan.steps[0]?.result?.evidence?.verified).toBe(true);
  }, 15000);
});
