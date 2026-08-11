import { describe, it, expect } from 'vitest';
import { agentExecutor } from '../../src/main/agent/agent.executor.js';
import { workflowPlanner } from '../../src/main/agent/workflow.planner.js';
import { workflowExecutor } from '../../src/main/agent/workflow.executor.js';
import { workflowRecoveryManager } from '../../src/main/agent/workflow.recovery.js';
import { WorkflowContext } from '../../src/main/agent/workflow.context.js';
import fs from 'fs';

describe('R4.3 Autonomous Multi-Step Workflow Engine Suite', () => {
  agentExecutor.initializeDefaultTools();

  it('1. Dependency Graph Creation & Topological Ordering', () => {
    const wf = workflowPlanner.planWorkflow('Prepare my desktop for coding');

    expect(wf.steps.length).toBeGreaterThanOrEqual(5);
    expect(wf.status).toBe('PENDING');

    const checkGit = wf.steps.find((s) => s.tool === 'system.check_software' && s.input.softwareName === 'git');
    const launchApp = wf.steps.find((s) => s.tool === 'application.launch');
    const verifyApp = wf.steps.find((s) => s.tool === 'application.verify');

    expect(checkGit?.dependencies).toEqual([]);
    expect(launchApp?.dependencies.length).toBeGreaterThan(0);
    expect(verifyApp?.dependencies).toContain(launchApp?.stepId);
  });

  it('2. Dependency Blocking on Prerequisite Failure', async () => {
    const wf = workflowPlanner.planWorkflow('Open NonExistentFakeApp9999');
    const executed = await workflowExecutor.executeWorkflow(wf);

    expect(executed.status).toBe('FAILED');
    const resolveStep = executed.steps.find((s) => s.tool === 'application.resolve');
    const launchStep = executed.steps.find((s) => s.tool === 'application.launch');
    const verifyStep = executed.steps.find((s) => s.tool === 'application.verify');

    expect(resolveStep?.status).toBe('FAILED');
    expect(resolveStep?.error).toBe('ApplicationNotFound');

    expect(launchStep?.status).toBe('BLOCKED');
    expect(launchStep?.error).toBe('DependencyBlocked');
    expect(launchStep?.blockedReason).toContain(resolveStep?.stepId);

    expect(verifyStep?.status).toBe('BLOCKED');
    expect(verifyStep?.error).toBe('DependencyBlocked');
  });

  it('3. Independent Step Execution When Unrelated Step Fails', async () => {
    const wf = workflowPlanner.planWorkflow('Open NonExistentFakeApp9999 and then take a screenshot');
    const executed = await workflowExecutor.executeWorkflow(wf);

    // Overall status is PARTIAL because app failed, but screenshot succeeded
    expect(executed.status).toBe('PARTIAL');

    const resolveStep = executed.steps.find((s) => s.tool === 'application.resolve');
    const launchStep = executed.steps.find((s) => s.tool === 'application.launch');
    const screenStep = executed.steps.find((s) => s.tool === 'screen.capture');
    const verifyScreenStep = executed.steps.find((s) => s.tool === 'screen.verify');

    expect(resolveStep?.status).toBe('FAILED');
    expect(launchStep?.status).toBe('BLOCKED');

    // Independent screenshot steps must have executed and succeeded
    expect(screenStep?.status).toBe('COMPLETED');
    expect(screenStep?.verified).toBe(true);
    expect(verifyScreenStep?.status).toBe('COMPLETED');
    expect(verifyScreenStep?.verified).toBe(true);
  });

  it('4. Real Output Propagation Across Dependency Chain', async () => {
    const context = new WorkflowContext();
    context.setStepResult(
      'step_1',
      {
        success: true,
        status: 'COMPLETED',
        tool: 'application.resolve',
        action: 'RESOLVE_APPLICATION',
        parameters: { appName: 'Chrome' },
        output: 'Resolved path',
        evidence: {
          resolvedPath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          method: 'APPLICATION_LAUNCH',
          verified: true,
          verificationDetails: 'Found',
        },
      },
      {
        stepId: 'step_1',
        description: 'Resolve Chrome',
        intent: 'OPEN_APPLICATION',
        tool: 'application.resolve',
        input: { appName: 'Chrome' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'COMPLETED',
      },
    );

    const step2 = {
      stepId: 'step_2',
      description: 'Launch Chrome',
      intent: 'OPEN_APPLICATION' as const,
      tool: 'application.launch',
      input: { appName: 'Chrome' },
      dependencies: ['step_1'],
      securityLevel: 'SAFE' as const,
      status: 'PENDING' as const,
    };

    const resolved = context.resolveInputs(step2);
    expect(resolved.resolvedPath).toBe('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
    expect(resolved.targetPath).toBe('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');
    expect(resolved.method).toBe('APPLICATION_LAUNCH');
  });

  it('5. Recovery and Retry Management', async () => {
    let attempts = 0;
    const testStep = {
      stepId: 'step_test',
      description: 'Test Retry',
      intent: 'OPEN_APPLICATION' as const,
      tool: 'application.launch',
      input: {},
      dependencies: [],
      securityLevel: 'SAFE' as const,
      status: 'PENDING' as const,
      retryable: true,
      maxRetries: 1,
    };

    const { result, retryCount } = await workflowRecoveryManager.executeWithRecovery(
      testStep,
      async () => {
        attempts++;
        if (attempts === 1) {
          return {
            success: false,
            status: 'FAILED',
            tool: 'application.launch',
            action: 'LAUNCH',
            parameters: {},
            output: 'Temporary glitch',
            error: 'TemporaryTimeout',
            evidence: { verified: false, verificationDetails: 'Glitch' },
          };
        }
        return {
          success: true,
          status: 'COMPLETED',
          tool: 'application.launch',
          action: 'LAUNCH',
          parameters: {},
          output: 'Success on retry',
          evidence: { verified: true, verificationDetails: 'Recovered' },
        };
      },
    );

    expect(attempts).toBe(2);
    expect(retryCount).toBe(1);
    expect(result.success).toBe(true);
  });

  it('6. Security Policy Blocking Before Execution', async () => {
    const wf = workflowPlanner.planWorkflow('Read C:\\Windows\\System32\\config\\SAM and then create a folder called JARVIS-SecTest');
    const executed = await workflowExecutor.executeWorkflow(wf);

    const readStep = executed.steps.find((s) => s.tool === 'filesystem.read_file');
    const createStep = executed.steps.find((s) => s.tool === 'filesystem.create_directory');

    expect(readStep?.status).toBe('BLOCKED');
    expect(readStep?.error).toBe('PathTraversalBlocked');
    expect(readStep?.verified).toBe(false);

    // Clean up folder if created
    const createdPath = createStep?.evidence?.resolvedPath;
    if (createdPath && fs.existsSync(createdPath)) {
      try {
        fs.rmdirSync(createdPath);
      } catch {}
    }
  });

  it('7. Idempotency Handling for Existing Directories', async () => {
    const folderName = `WorkflowIdempotent_${Date.now()}`;
    const wf1 = workflowPlanner.planWorkflow(`Create a folder called ${folderName} on my Desktop`);
    const exec1 = await workflowExecutor.executeWorkflow(wf1);

    expect(exec1.status).toBe('COMPLETED');
    const createStep1 = exec1.steps.find((s) => s.tool === 'filesystem.create_directory');
    expect(createStep1?.status).toBe('COMPLETED');
    expect(createStep1?.verified).toBe(true);

    // Second execution on already existing folder
    const wf2 = workflowPlanner.planWorkflow(`Create a folder called ${folderName} on my Desktop`);
    const exec2 = await workflowExecutor.executeWorkflow(wf2);

    expect(exec2.status).toBe('COMPLETED');
    const createStep2 = exec2.steps.find((s) => s.tool === 'filesystem.create_directory');
    expect(createStep2?.status).toBe('COMPLETED');
    expect(createStep2?.output).toContain('already exists');
    expect(createStep2?.verified).toBe(true);

    // Clean up
    const targetPath = createStep1?.evidence?.resolvedPath;
    if (targetPath && fs.existsSync(targetPath)) {
      try {
        fs.rmdirSync(targetPath);
      } catch {}
    }
  });

  // ==========================================
  // 8. TARGET REAL-WORLD ACCEPTANCE WORKFLOWS
  // ==========================================

  it('Scenario 1: Check whether Git and Python are installed', async () => {
    const wf = workflowPlanner.planWorkflow('Check whether Git and Python are installed');
    const executed = await workflowExecutor.executeWorkflow(wf);

    expect(executed.status).toBe('COMPLETED');
    expect(executed.steps.length).toBe(2);
    expect(executed.steps[0]?.tool).toBe('system.check_software');
    expect(executed.steps[1]?.tool).toBe('system.check_software');
    expect(executed.steps[0]?.status).toBe('COMPLETED');
    expect(executed.steps[1]?.status).toBe('COMPLETED');
    expect(executed.finalResult?.isSuccess).toBe(true);
    expect(executed.finalResult?.evidence.some((e) => e.includes('git'))).toBe(true);
  });

  it('Scenario 2: Launch VS Code and verify that it is running', async () => {
    const wf = workflowPlanner.planWorkflow('Launch VS Code and verify that it is running');
    const executed = await workflowExecutor.executeWorkflow(wf);

    expect(executed.status).toBe('COMPLETED');
    const launchStep = executed.steps.find((s) => s.tool === 'application.launch');
    const verifyStep = executed.steps.find((s) => s.tool === 'application.verify');

    expect(launchStep?.status).toBe('COMPLETED');
    expect(typeof launchStep?.evidence?.pid).toBe('number');
    expect(verifyStep?.status).toBe('COMPLETED');
    expect(verifyStep?.evidence?.verified).toBe(true);
  });

  it('Scenario 3: Create a folder called JARVIS-Workflow-Test on my Desktop and verify it exists', async () => {
    const wf = workflowPlanner.planWorkflow('Create a folder called JARVIS-Workflow-Test on my Desktop and verify it exists');
    const executed = await workflowExecutor.executeWorkflow(wf);

    expect(executed.status).toBe('COMPLETED');
    const createStep = executed.steps.find((s) => s.tool === 'filesystem.create_directory');
    const verifyStep = executed.steps.find((s) => s.tool === 'filesystem.verify_directory');

    expect(createStep?.status).toBe('COMPLETED');
    expect(verifyStep?.status).toBe('COMPLETED');
    expect(verifyStep?.evidence?.verified).toBe(true);

    // Clean up
    const targetPath = createStep?.evidence?.resolvedPath;
    if (targetPath && fs.existsSync(targetPath)) {
      try {
        fs.rmdirSync(targetPath);
      } catch {}
    }
  });

  it('Scenario 4: Take a screenshot and verify the screenshot file', async () => {
    const wf = workflowPlanner.planWorkflow('Take a screenshot and verify the screenshot file');
    const executed = await workflowExecutor.executeWorkflow(wf);

    expect(executed.status).toBe('COMPLETED');
    const captureStep = executed.steps.find((s) => s.tool === 'screen.capture');
    const verifyStep = executed.steps.find((s) => s.tool === 'screen.verify');

    expect(captureStep?.status).toBe('COMPLETED');
    expect(captureStep?.evidence?.resolvedPath).toBeDefined();
    expect(captureStep?.evidence?.fileSizeBytes).toBeGreaterThan(0);
    expect(verifyStep?.status).toBe('COMPLETED');
    expect(verifyStep?.verified).toBe(true);
  });

  it('Scenario 5: Open Chrome and search for Python machine learning tutorials', async () => {
    const wf = workflowPlanner.planWorkflow('Open Chrome and search for Python machine learning tutorials');
    const executed = await workflowExecutor.executeWorkflow(wf);

    expect(executed.status).toBe('COMPLETED');
    expect(executed.steps.length).toBe(4);
    const searchStep = executed.steps.find((s) => s.tool === 'browser.search_web');
    expect(searchStep?.status).toBe('COMPLETED');
    expect(searchStep?.input.query).toBe('Python machine learning tutorials');
  });

  it('Scenario 6: Prepare my desktop for coding', async () => {
    const wf = workflowPlanner.planWorkflow('Prepare my desktop for coding');
    const executed = await workflowExecutor.executeWorkflow(wf);

    expect(executed.status).toBe('COMPLETED');
    expect(executed.steps.length).toBe(8);

    const checkGit = executed.steps.find((s) => s.tool === 'system.check_software' && s.input.softwareName === 'git');
    const checkPython = executed.steps.find((s) => s.tool === 'system.check_software' && s.input.softwareName === 'python');
    const launchVSCode = executed.steps.find((s) => s.tool === 'application.launch');
    const createWorkspace = executed.steps.find((s) => s.tool === 'filesystem.create_directory');

    expect(checkGit?.status).toBe('COMPLETED');
    expect(checkPython?.status).toBe('COMPLETED');
    expect(launchVSCode?.status).toBe('COMPLETED');
    expect(createWorkspace?.status).toBe('COMPLETED');

    // Clean up created workspace folder
    const targetPath = createWorkspace?.evidence?.resolvedPath;
    if (targetPath && fs.existsSync(targetPath)) {
      try {
        fs.rmdirSync(targetPath);
      } catch {}
    }
  });

  it('TEST H: Workflow Cancellation Support', async () => {
    const wf = workflowPlanner.planWorkflow('Prepare my desktop for coding');
    let cancelled = false;
    const executed = await workflowExecutor.executeWorkflow(wf, (update) => {
      if (update.currentStepId === 'step_2' && !cancelled) {
        cancelled = true;
        workflowExecutor.cancelWorkflow(wf.workflowId);
      }
    });

    expect(executed.status).toBe('CANCELLED');
    const completed = executed.steps.filter((s) => s.status === 'COMPLETED').length;
    const cancelledSteps = executed.steps.filter((s) => s.status === 'CANCELLED').length;
    expect(completed).toBeGreaterThanOrEqual(1);
    expect(cancelledSteps).toBeGreaterThanOrEqual(1);
  });

  it('TEST C: Create a new folder called JARVIS-R43-Final-Test on Desktop and verify it exists', async () => {
    const folderName = `JARVIS-R43-Final-Test-${Date.now()}`;
    const wf = workflowPlanner.planWorkflow(`Create a folder called ${folderName} on my Desktop and verify it exists`);
    const executed = await workflowExecutor.executeWorkflow(wf);

    expect(executed.status).toBe('COMPLETED');
    const createStep = executed.steps.find((s) => s.tool === 'filesystem.create_directory');
    const verifyStep = executed.steps.find((s) => s.tool === 'filesystem.verify_directory');

    expect(createStep?.status).toBe('COMPLETED');
    expect(verifyStep?.status).toBe('COMPLETED');
    expect(verifyStep?.evidence?.verified).toBe(true);

    const createdPath = createStep?.evidence?.resolvedPath;
    expect(createdPath).toBeDefined();
    if (createdPath && fs.existsSync(createdPath)) {
      expect(fs.statSync(createdPath).isDirectory()).toBe(true);
      try {
        fs.rmdirSync(createdPath);
      } catch {}
    }
  });

  it('TEST J: Idempotency Handling for Repeated Directory Creation', async () => {
    const folderName = `JARVIS-R43-Idempotency-${Date.now()}`;
    const wf1 = workflowPlanner.planWorkflow(`Create a folder called ${folderName} on my Desktop`);
    const exec1 = await workflowExecutor.executeWorkflow(wf1);

    expect(exec1.status).toBe('COMPLETED');
    const createStep1 = exec1.steps.find((s) => s.tool === 'filesystem.create_directory');
    expect(createStep1?.status).toBe('COMPLETED');

    const wf2 = workflowPlanner.planWorkflow(`Create a folder called ${folderName} on my Desktop`);
    const exec2 = await workflowExecutor.executeWorkflow(wf2);

    expect(exec2.status).toBe('COMPLETED');
    const createStep2 = exec2.steps.find((s) => s.tool === 'filesystem.create_directory');
    expect(createStep2?.status).toBe('COMPLETED');
    expect(createStep2?.output).toContain('already exists');

    const targetPath = createStep1?.evidence?.resolvedPath;
    if (targetPath && fs.existsSync(targetPath)) {
      try {
        fs.rmdirSync(targetPath);
      } catch {}
    }
  });
});
