import { describe, it, expect, afterAll } from 'vitest';
import { applicationResolver } from '../../src/main/agent/application.resolver.js';
import { agentExecutor } from '../../src/main/agent/agent.executor.js';

describe('Application Launch Deduplication & Process Integrity Suite', () => {
  const launchedPidsToCleanup: number[] = [];

  afterAll(() => {
    // Clean up any test-spawned processes
    for (const pid of launchedPidsToCleanup) {
      try {
        process.kill(pid);
      } catch {}
    }
  });

  it('Test A: Application not running -> one launch -> one new process with valid PID', async () => {
    const resolved = applicationResolver.resolve('notepad');
    expect(resolved.found).toBe(true);

    const initialPids = await applicationResolver.findRunningProcesses(resolved);
    const launchRes = await applicationResolver.launch(resolved);

    expect(launchRes.success).toBe(true);
    expect(launchRes.verified).toBe(true);
    expect(launchRes.pid).toBeDefined();
    if (launchRes.pid) launchedPidsToCleanup.push(launchRes.pid);

    if (initialPids.length === 0) {
      expect(launchRes.launchMethod).toBe('FRESH_LAUNCH');
      expect(launchRes.output).toContain('started successfully');
    } else {
      expect(launchRes.launchMethod).toBe('ALREADY_RUNNING');
      expect(launchRes.output).toContain('already running');
    }
  });

  it('Test B: Application already running -> no new process spawned -> existing PID returned', async () => {
    const resolved = applicationResolver.resolve('notepad');
    expect(resolved.found).toBe(true);

    // Ensure at least one process is running
    const firstLaunch = await applicationResolver.launch(resolved);
    if (firstLaunch.pid) launchedPidsToCleanup.push(firstLaunch.pid);

    const pidsBefore = await applicationResolver.findRunningProcesses(resolved);
    expect(pidsBefore.length).toBeGreaterThan(0);

    // Second launch attempt
    const secondLaunch = await applicationResolver.launch(resolved);

    expect(secondLaunch.success).toBe(true);
    expect(secondLaunch.verified).toBe(true);
    expect(secondLaunch.launchMethod).toBe('ALREADY_RUNNING');
    expect(pidsBefore).toContain(secondLaunch.pid);
    expect(secondLaunch.verificationDetails).toContain('already running');
    expect(secondLaunch.output).toContain('already running');

    const pidsAfter = await applicationResolver.findRunningProcesses(resolved);
    // Process count must remain strictly identical
    expect(pidsAfter.length).toBe(pidsBefore.length);
  });

  it('Test C: Repeated "Open VS Code" requests -> must not continuously spawn new processes', async () => {
    const resolved = applicationResolver.resolve('VS Code');
    if (!resolved.found) {
      // If VS Code is not installed on this machine, test truthful resolution
      expect(resolved.found).toBe(false);
      return;
    }

    const pidsBefore = await applicationResolver.findRunningProcesses(resolved);

    // Issue 5 repeated launches
    const results = await Promise.all([
      applicationResolver.launch(resolved),
      applicationResolver.launch(resolved),
      applicationResolver.launch(resolved),
      applicationResolver.launch(resolved),
      applicationResolver.launch(resolved),
    ]);

    for (const res of results) {
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      if (res.pid) launchedPidsToCleanup.push(res.pid);
    }

    // All 5 requests must agree on the same target PID due to mutex lock & deduplication
    const returnedPids = new Set(results.map((r) => r.pid).filter(Boolean));
    expect(returnedPids.size).toBeLessThanOrEqual(1);

    const pidsAfter = await applicationResolver.findRunningProcesses(resolved);
    if (pidsBefore.length > 0) {
      expect(pidsAfter.length).toBe(pidsBefore.length);
    }
  });

  it('Test D: Repeated "Open Chrome" requests -> must not continuously spawn new processes', async () => {
    const resolved = applicationResolver.resolve('Chrome');
    if (!resolved.found) {
      expect(resolved.found).toBe(false);
      return;
    }

    const pidsBefore = await applicationResolver.findRunningProcesses(resolved);

    // Execute 3 repeated launches
    const res1 = await applicationResolver.launch(resolved);
    const res2 = await applicationResolver.launch(resolved);
    const res3 = await applicationResolver.launch(resolved);

    if (res1.pid) launchedPidsToCleanup.push(res1.pid);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res3.success).toBe(true);

    if (pidsBefore.length > 0) {
      expect(res1.launchMethod).toBe('ALREADY_RUNNING');
      expect(res2.launchMethod).toBe('ALREADY_RUNNING');
      expect(res3.launchMethod).toBe('ALREADY_RUNNING');
    }

    const pidsAfter = await applicationResolver.findRunningProcesses(resolved);
    if (pidsBefore.length > 0) {
      expect(pidsAfter.length).toBe(pidsBefore.length);
    }
  });

  it('Test E: Repeated "Open Antigravity" requests -> must not continuously spawn new processes', async () => {
    const resolved = applicationResolver.resolve('Antigravity');
    if (!resolved.found) {
      expect(resolved.found).toBe(false);
      return;
    }

    const pidsBefore = await applicationResolver.findRunningProcesses(resolved);

    const res1 = await applicationResolver.launch(resolved);
    const res2 = await applicationResolver.launch(resolved);

    if (res1.pid) launchedPidsToCleanup.push(res1.pid);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);

    if (pidsBefore.length > 0) {
      expect(res1.launchMethod).toBe('ALREADY_RUNNING');
      expect(res2.launchMethod).toBe('ALREADY_RUNNING');
      const pidsAfter = await applicationResolver.findRunningProcesses(resolved);
      expect(pidsAfter.length).toBe(pidsBefore.length);
    }
  });

  it('Test F: Concurrent duplicate launch requests -> only one actual launch operation via mutex lock', async () => {
    const resolved = applicationResolver.resolve('notepad');
    expect(resolved.found).toBe(true);

    // Fire 10 concurrent requests at the exact same millisecond
    const promises = Array.from({ length: 10 }, () => applicationResolver.launch(resolved));
    const results = await Promise.all(promises);

    expect(results.length).toBe(10);
    for (const res of results) {
      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      if (res.pid) launchedPidsToCleanup.push(res.pid);
    }

    // All results must agree on PID and executable path
    const pids = results.map((r) => r.pid).filter(Boolean);
    const uniquePids = new Set(pids);
    expect(uniquePids.size).toBeLessThanOrEqual(1);
  });

  it('Test G: Non-existent application -> truthful ApplicationNotFound failure', async () => {
    const resolved = applicationResolver.resolve('DefinitelyNonExistentApp_XYZ_123456');
    expect(resolved.found).toBe(false);

    const launchRes = await applicationResolver.launch(resolved);
    expect(launchRes.success).toBe(false);
    expect(launchRes.verified).toBe(false);
    expect(launchRes.error).toBe('ApplicationNotFound');
    expect(launchRes.output).toContain('is not installed or could not be found');
  });

  it('Test 14: Integration test verifying process count before and after "Open <application>" request', async () => {
    const resolved = applicationResolver.resolve('notepad');
    expect(resolved.found).toBe(true);

    // Step 1: Initial state
    const initialPids = await applicationResolver.findRunningProcesses(resolved);

    // Step 2: First Goal Execution through full AgentExecutor pipeline
    const { plan: plan1 } = await agentExecutor.executeGoal('Open Notepad');
    expect(plan1.status).toBe('COMPLETED');

    const step1 = plan1.steps.find((s) => s.tool === 'application.launch');
    expect(step1?.status).toBe('COMPLETED');
    if (step1?.evidence?.pid) launchedPidsToCleanup.push(step1.evidence.pid as number);

    const midPids = await applicationResolver.findRunningProcesses(resolved);
    expect(midPids.length).toBeGreaterThan(0);

    // Step 3: Second Goal Execution through full AgentExecutor pipeline
    const { plan: plan2 } = await agentExecutor.executeGoal('Open Notepad');
    expect(plan2.status).toBe('COMPLETED');

    const step2 = plan2.steps.find((s) => s.tool === 'application.launch');
    expect(step2?.status).toBe('COMPLETED');
    expect(step2?.evidence?.launchMethod).toBe('ALREADY_RUNNING');
    expect(step2?.output).toContain('already running');

    // Step 4: Final process count must be identical to mid process count (ZERO new processes)
    const finalPids = await applicationResolver.findRunningProcesses(resolved);
    expect(finalPids.length).toBe(midPids.length);
  }, 45000);
});
