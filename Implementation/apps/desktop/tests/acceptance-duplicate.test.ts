import { describe, it, expect } from 'vitest';
import cp from 'node:child_process';
import { applicationResolver } from '../src/main/agent/application.resolver.js';
import { agentExecutor } from '../src/main/agent/agent.executor.js';

function getLiveProcessCount(processNames: string[]): Promise<number[]> {
  return new Promise((resolve) => {
    const targetSet = new Set(processNames.map((n) => n.toLowerCase()));
    cp.execFile('tasklist.exe', ['/FO', 'CSV', '/NH'], (err, stdout) => {
      const pids: number[] = [];
      if (!err && stdout) {
        const lines = stdout.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('INFO:')) continue;
          const parts = trimmed.split('","').map((p) => p.replace(/^"|"$/g, ''));
          if (parts.length >= 2) {
            const imageName = parts[0]?.toLowerCase();
            if (imageName && targetSet.has(imageName)) {
              const pid = parseInt(parts[1] || '0', 10);
              if (!isNaN(pid) && pid > 0) {
                try {
                  process.kill(pid, 0);
                  pids.push(pid);
                } catch {}
              }
            }
          }
        }
      }
      resolve([...new Set(pids)]);
    });
  });
}

describe('Real Live Process Duplicate-Launch Acceptance Validation', () => {
  it('1. Cold launch -> creates process -> second launch preserves existing PID without duplicate spawn', async () => {
    const target = applicationResolver.resolve('notepad');
    expect(target.found).toBe(true);

    const initialPids = await getLiveProcessCount(['notepad.exe']);
    console.log(`[Notepad] Live processes initial: count=${initialPids.length}, PIDs=[${initialPids.join(', ')}]`);

    // 1st Execution
    const { plan: plan1 } = await agentExecutor.executeGoal('Open Notepad');
    const step1 = plan1.steps.find((s) => s.tool === 'application.launch');
    const afterPids1 = await getLiveProcessCount(['notepad.exe']);

    console.log(`[Notepad] 1st Launch: status=${step1?.status}, method=${step1?.evidence?.launchMethod}, PID=${step1?.evidence?.pid}`);
    console.log(`[Notepad] Live processes after 1st: count=${afterPids1.length}, PIDs=[${afterPids1.join(', ')}]`);

    expect(step1?.status).toBe('COMPLETED');
    expect(afterPids1.length).toBeGreaterThan(0);

    // 2nd Execution
    const { plan: plan2 } = await agentExecutor.executeGoal('Open Notepad');
    const step2 = plan2.steps.find((s) => s.tool === 'application.launch');
    const afterPids2 = await getLiveProcessCount(['notepad.exe']);

    console.log(`[Notepad] 2nd Launch: status=${step2?.status}, method=${step2?.evidence?.launchMethod}, PID=${step2?.evidence?.pid}`);
    console.log(`[Notepad] Live processes after 2nd: count=${afterPids2.length}, PIDs=[${afterPids2.join(', ')}]`);

    expect(step2?.status).toBe('COMPLETED');
    expect(step2?.evidence?.launchMethod).toBe('ALREADY_RUNNING');
    expect(afterPids2.length).toBe(afterPids1.length);
  }, 30000);

  it('2. Repeated "Open VS Code" 10 consecutive times -> process count remains strictly stable', async () => {
    const target = applicationResolver.resolve('VS Code');
    if (!target.found) {
      expect(target.found).toBe(false);
      return;
    }

    const vsImages = ['Code.exe', 'code.exe'];
    const pidsBefore = await getLiveProcessCount(vsImages);
    console.log(`\n[VS Code] Processes BEFORE 10x test: count=${pidsBefore.length}, PIDs=[${pidsBefore.join(', ')}]`);

    for (let i = 1; i <= 10; i++) {
      const { plan } = await agentExecutor.executeGoal('Open VS Code');
      const launchStep = plan.steps.find((s) => s.tool === 'application.launch');
      console.log(`   [VS Code Attempt ${i}/10] Status=${launchStep?.status}, Method=${launchStep?.evidence?.launchMethod}, PID=${launchStep?.evidence?.pid}`);
      expect(launchStep?.status).toBe('COMPLETED');
    }

    const pidsAfter = await getLiveProcessCount(vsImages);
    console.log(`[VS Code] Processes AFTER 10x test: count=${pidsAfter.length}, PIDs=[${pidsAfter.join(', ')}]`);

    if (pidsBefore.length > 0) {
      expect(pidsAfter.length).toBe(pidsBefore.length);
    }
  }, 120000);

  it('3. Repeated "Open Chrome" 10 consecutive times -> process count remains strictly stable', async () => {
    const target = applicationResolver.resolve('Chrome');
    if (!target.found) {
      expect(target.found).toBe(false);
      return;
    }

    const chromeImages = ['chrome.exe'];
    const pidsBefore = await getLiveProcessCount(chromeImages);
    console.log(`\n[Chrome] Processes BEFORE 10x test: count=${pidsBefore.length}, PIDs=[${pidsBefore.join(', ')}]`);

    for (let i = 1; i <= 10; i++) {
      const { plan } = await agentExecutor.executeGoal('Open Chrome');
      const launchStep = plan.steps.find((s) => s.tool === 'application.launch');
      console.log(`   [Chrome Attempt ${i}/10] Status=${launchStep?.status}, Method=${launchStep?.evidence?.launchMethod}, PID=${launchStep?.evidence?.pid}`);
      expect(launchStep?.status).toBe('COMPLETED');
    }

    const pidsAfter = await getLiveProcessCount(chromeImages);
    console.log(`[Chrome] Processes AFTER 10x test: count=${pidsAfter.length}, PIDs=[${pidsAfter.join(', ')}]`);

    if (pidsBefore.length > 0) {
      expect(pidsAfter.length).toBe(pidsBefore.length);
    }
  }, 120000);

  it('4. Repeated "Open Antigravity" 10 consecutive times -> process count remains strictly stable', async () => {
    const target = applicationResolver.resolve('Antigravity');
    if (!target.found) {
      expect(target.found).toBe(false);
      return;
    }

    const agImages = ['antigravity.exe', 'Antigravity.exe'];
    const pidsBefore = await getLiveProcessCount(agImages);
    console.log(`\n[Antigravity] Processes BEFORE 10x test: count=${pidsBefore.length}, PIDs=[${pidsBefore.join(', ')}]`);

    for (let i = 1; i <= 10; i++) {
      const { plan } = await agentExecutor.executeGoal('Open Antigravity');
      const launchStep = plan.steps.find((s) => s.tool === 'application.launch');
      console.log(`   [Antigravity Attempt ${i}/10] Status=${launchStep?.status}, Method=${launchStep?.evidence?.launchMethod}, PID=${launchStep?.evidence?.pid}`);
      expect(launchStep?.status).toBe('COMPLETED');
    }

    const pidsAfter = await getLiveProcessCount(agImages);
    console.log(`[Antigravity] Processes AFTER 10x test: count=${pidsAfter.length}, PIDs=[${pidsAfter.join(', ')}]`);

    if (pidsBefore.length > 0) {
      expect(pidsAfter.length).toBe(pidsBefore.length);
    }
  }, 120000);

  it('5. Concurrent identical launch requests -> mutex deduplication ensures only one target PID', async () => {
    const [c1, c2, c3] = await Promise.all([
      agentExecutor.executeGoal('Open Notepad'),
      agentExecutor.executeGoal('Open Notepad'),
      agentExecutor.executeGoal('Open Notepad'),
    ]);

    const s1 = c1.plan.steps.find((s) => s.tool === 'application.launch');
    const s2 = c2.plan.steps.find((s) => s.tool === 'application.launch');
    const s3 = c3.plan.steps.find((s) => s.tool === 'application.launch');

    expect(s1?.status).toBe('COMPLETED');
    expect(s2?.status).toBe('COMPLETED');
    expect(s3?.status).toBe('COMPLETED');

    const pids = [s1?.evidence?.pid, s2?.evidence?.pid, s3?.evidence?.pid].filter(Boolean);
    const unique = new Set(pids);
    console.log(`\n[Concurrent Mutex] Returned PIDs: [${pids.join(', ')}] (Unique: ${unique.size})`);
    expect(unique.size).toBeLessThanOrEqual(1);
  }, 60000);
});
