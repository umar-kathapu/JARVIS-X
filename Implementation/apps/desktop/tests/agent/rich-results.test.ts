import { describe, it, expect } from 'vitest';
import { agentExecutor } from '../../src/main/agent/agent.executor.js';
import { nluService } from '../../src/main/agent/nlu.service.js';
import { dynamicTaskPlanner } from '../../src/main/agent/planner.service.js';
import { toolRegistry } from '../../src/main/agent/tool.registry.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('R4.2 Rich Execution Results & Evidence UI Suite', () => {
  agentExecutor.initializeDefaultTools();

  it('1. Structured successful result exposes all required non-fabricated fields', async () => {
    const { plan } = await agentExecutor.executeGoal('Check whether Git is installed');

    expect(plan.status).toBe('COMPLETED');
    expect(plan.steps.length).toBeGreaterThanOrEqual(1);

    const step = plan.steps[0]!;
    expect(step.stepId).toBeDefined();
    expect(step.description).toBeDefined();
    expect(step.tool).toBe('system.check_software');
    expect(step.status).toBe('COMPLETED');
    expect(step.input).toBeDefined();
    expect(step.result).toBeDefined();
    expect(step.verified).toBe(true);
    expect(step.verificationDetails).toContain('git');
    expect(step.startedAt).toBeDefined();
    expect(step.completedAt).toBeDefined();
    expect(typeof step.duration).toBe('number');
    expect(step.duration).toBeGreaterThanOrEqual(0);
    expect(step.evidence).toBeDefined();
    expect(step.evidence?.verified).toBe(true);
  });

  it('2. Structured failed result exposes error, status FAILED, and verified false', async () => {
    const { plan, finalResponse } = await agentExecutor.executeGoal('Open FakeUnknownApp9999');

    expect(plan.status).toBe('FAILED');
    const step1 = plan.steps[0]!;
    expect(step1.status).toBe('FAILED');
    expect(step1.tool).toBe('application.resolve');
    expect(step1.error).toBe('ApplicationNotFound');
    expect(step1.verified).toBe(false);
    expect(step1.result?.success).toBe(false);
    expect(finalResponse).toContain('could not be found');
  });

  it('3. Verified evidence is preserved and authentic for screen capture', async () => {
    const { plan } = await agentExecutor.executeGoal('Take a screenshot');

    expect(plan.status).toBe('COMPLETED');
    const captureStep = plan.steps.find((s) => s.toolName === 'screen.capture');
    expect(captureStep).toBeDefined();
    expect(captureStep?.verified).toBe(true);
    expect(captureStep?.evidence?.resolvedPath).toBeDefined();
    expect(captureStep?.evidence?.fileSizeBytes).toBeGreaterThan(0);
    expect(captureStep?.evidence?.dimensions?.width).toBeGreaterThan(0);
    expect(captureStep?.evidence?.dimensions?.height).toBeGreaterThan(0);

    const verifyStep = plan.steps.find((s) => s.toolName === 'screen.verify');
    expect(verifyStep).toBeDefined();
    expect(verifyStep?.status).toBe('COMPLETED');
    expect(verifyStep?.verified).toBe(true);
  });

  it('4. Cancelled dependent steps are explicitly marked CANCELLED with no fake execution', async () => {
    const { plan } = await agentExecutor.executeGoal('Open CompletelyFakeApp12345');

    expect(plan.status).toBe('FAILED');
    expect(plan.steps[0]?.status).toBe('FAILED');
    expect(plan.steps[1]?.status).toBe('CANCELLED');
    expect(plan.steps[1]?.error).toBe('Cancelled due to prior step failure.');
    expect(plan.steps[1]?.verified).toBe(false);
    expect(plan.steps[2]?.status).toBe('CANCELLED');
    expect(plan.steps[2]?.verified).toBe(false);
  });

  it('5. Actual PID propagation for real application execution', async () => {
    const { plan } = await agentExecutor.executeGoal('Open Chrome');

    expect(plan.status).toBe('COMPLETED');
    const launchStep = plan.steps.find((s) => s.toolName === 'application.launch');
    expect(launchStep).toBeDefined();
    expect(typeof launchStep?.evidence?.pid).toBe('number');
    expect(launchStep?.evidence?.pid).toBeGreaterThan(0);

    const verifyStep = plan.steps.find((s) => s.toolName === 'application.verify');
    expect(verifyStep).toBeDefined();
    expect(verifyStep?.status).toBe('COMPLETED');
    expect(verifyStep?.toolArgs.pid || verifyStep?.input?.pid).toBe(launchStep?.evidence?.pid);
  });

  it('6. Actual filesystem path propagation for folder creation and verification', async () => {
    const folderName = `RichResultsTest_${Date.now()}`;
    const { plan } = await agentExecutor.executeGoal(`Create a folder called ${folderName} on the Desktop`);

    expect(plan.status).toBe('COMPLETED');
    const resolveStep = plan.steps.find((s) => s.toolName === 'filesystem.resolve_path');
    const createStep = plan.steps.find((s) => s.toolName === 'filesystem.create_directory');
    const verifyStep = plan.steps.find((s) => s.toolName === 'filesystem.verify_directory');

    expect(resolveStep?.evidence?.resolvedPath).toBeDefined();
    expect(createStep?.evidence?.resolvedPath).toBe(resolveStep?.evidence?.resolvedPath);
    expect(verifyStep?.evidence?.resolvedPath).toBe(resolveStep?.evidence?.resolvedPath);

    // Clean up created folder
    const targetPath = createStep?.evidence?.resolvedPath;
    if (targetPath && fs.existsSync(targetPath)) {
      try {
        fs.rmdirSync(targetPath);
      } catch {}
    }
  });

  it('7. Diagnostic metrics rendering exposes live system metrics from Node.js OS subsystem', async () => {
    const { plan } = await agentExecutor.executeGoal('Run system diagnostics');

    expect(plan.status).toBe('COMPLETED');
    const metricsStep = plan.steps.find((s) => s.toolName === 'system.get_metrics');
    expect(metricsStep).toBeDefined();
    expect(metricsStep?.evidence?.metrics).toBeDefined();
    const metrics = metricsStep?.evidence?.metrics as any;
    expect(typeof metrics?.totalMemoryMb).toBe('number');
    expect(typeof metrics?.freeMemoryMb).toBe('number');
    expect(metrics?.platform).toBe('win32');
  });

  it('8. Multi-step composite command decomposes into sequential real tools', async () => {
    const { plan } = await agentExecutor.executeGoal('Open Chrome and search for Python machine learning tutorials');

    expect(plan.status).toBe('COMPLETED');
    expect(plan.steps.length).toBe(4);
    expect(plan.steps[0]?.toolName).toBe('application.resolve');
    expect(plan.steps[1]?.toolName).toBe('application.launch');
    expect(plan.steps[2]?.toolName).toBe('application.verify');
    expect(plan.steps[3]?.toolName).toBe('browser.search_web');
    expect(plan.steps[3]?.toolArgs.query).toBe('Python machine learning tutorials');
  });

  it('9. Never shows SUCCESS when execution failed or was blocked', async () => {
    const { plan } = await agentExecutor.executeGoal('Read file C:\\Windows\\System32\\config\\SAM');

    expect(plan.status).toBe('FAILED');
    expect(plan.steps[0]?.status).toBe('FAILED');
    expect(plan.steps[0]?.result?.status).toBe('BLOCKED');
    expect(plan.status).not.toBe('COMPLETED');
  });
});
