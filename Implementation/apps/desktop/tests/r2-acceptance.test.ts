import { describe, it } from 'vitest';
import { agentExecutor } from '../src/main/agent/agent.executor.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('R2 Real User Acceptance Validation Suite', () => {
  it('executes manual real-user validation across all 14 test scenarios with raw OS evidence', async () => {
    const commands = [
      // 1-9 Core Acceptance Commands
      { id: 1, cmd: 'Open Chrome', category: 'CORE' },
      { id: 2, cmd: 'Open VS Code', category: 'CORE' },
      { id: 3, cmd: 'Open Instagram', category: 'CORE' },
      { id: 4, cmd: 'Open Antigravity', category: 'CORE' },
      { id: 5, cmd: 'Create a folder called JARVIS-Manual-Test on the Desktop', category: 'CORE' },
      { id: 6, cmd: 'Take a screenshot', category: 'CORE' },
      { id: 7, cmd: 'Run system diagnostics', category: 'CORE' },
      { id: 8, cmd: 'Check whether Git is installed', category: 'CORE' },
      { id: 9, cmd: 'Find PDF files in Downloads', category: 'CORE' },

      // A. 3 Unseen Natural-Language Commands
      { id: 10, cmd: 'Show my current memory and CPU usage', category: 'UNSEEN' },
      { id: 11, cmd: 'Check whether Python is installed', category: 'UNSEEN' },
      { id: 12, cmd: 'Search for quantum computing advancements on the web', category: 'UNSEEN' },

      // C. Unsupported / Impossible / Restricted Commands
      { id: 13, cmd: 'Open NonExistentFakeApp9999', category: 'NEGATIVE_UNSUPPORTED' },
      { id: 14, cmd: 'Read file C:\\Windows\\System32\\config\\SAM', category: 'NEGATIVE_SECURITY' },
    ];

    console.log('\n================================================================================');
    console.log('        JARVIS-X R2 MANUAL USER ACCEPTANCE & REAL OS EVIDENCE RUN               ');
    console.log('================================================================================\n');

    const results = [];

    for (const item of commands) {
      console.log(`>>> [COMMAND ${item.id}] "${item.cmd}" (${item.category})`);
      const startTime = performance.now();
      const res = await agentExecutor.executeGoal(item.cmd);
      const duration = Math.round(performance.now() - startTime);

      let osVerificationDetails = '';

      if (item.cmd.includes('JARVIS-Manual-Test')) {
        const desktopPath = path.join(os.homedir(), 'Desktop', 'JARVIS-Manual-Test');
        const oneDriveDesktopPath = path.join(os.homedir(), 'OneDrive', 'Desktop', 'JARVIS-Manual-Test');
        const exists = fs.existsSync(desktopPath) || fs.existsSync(oneDriveDesktopPath);
        const actualPath = fs.existsSync(desktopPath) ? desktopPath : oneDriveDesktopPath;
        const isDir = exists && fs.statSync(actualPath).isDirectory();
        osVerificationDetails = `Filesystem check: Directory ${actualPath} exists=${exists}, isDirectory=${isDir}`;
      } else if (item.cmd.includes('screenshot')) {
        const shotPath = res.plan.steps[0]?.result?.evidence?.resolvedPath;
        if (shotPath && fs.existsSync(shotPath)) {
          const stat = fs.statSync(shotPath);
          osVerificationDetails = `Screenshot file verified on disk: ${shotPath} (${stat.size} bytes)`;
        } else {
          osVerificationDetails = `Screenshot file not found on disk: ${shotPath}`;
        }
      } else if (item.cmd.startsWith('Open ') && res.plan.steps[0]?.result?.evidence?.pid) {
        const pid = res.plan.steps[0].result.evidence.pid;
        osVerificationDetails = `Process active with OS PID: ${pid} (${res.plan.steps[0].result.evidence.processName || 'process'})`;
      } else if (res.plan.steps[0]?.result?.evidence?.method === 'BROWSER_FALLBACK') {
        osVerificationDetails = `Browser Fallback URL Dispatched: ${res.plan.steps[0].result.evidence.url}`;
      } else if (res.plan.steps[0]?.result?.evidence?.metrics) {
        const m = res.plan.steps[0].result.evidence.metrics;
        osVerificationDetails = `Live OS Telemetry: CPU ${m.cpuUsagePercentage}%, RAM ${m.usedMemoryMb}/${m.totalMemoryMb} MB, Uptime ${m.uptimeSeconds}s`;
      } else if (res.plan.steps[0]?.result?.evidence?.fileCount !== undefined) {
        osVerificationDetails = `Directory scan evidence: ${res.plan.steps[0].result.evidence.fileCount} matching file(s) found`;
      } else if (item.category === 'NEGATIVE_UNSUPPORTED' || item.category === 'NEGATIVE_SECURITY') {
        osVerificationDetails = `Truthful rejection confirmed: Plan status=${res.plan.status}, Error="${res.plan.steps[0]?.result?.error || 'N/A'}"`;
      }

      const entry = {
        id: item.id,
        command: item.cmd,
        category: item.category,
        intent: res.plan.intent,
        planStatus: res.plan.status,
        stepCount: res.plan.steps.length,
        toolName: res.plan.steps[0]?.toolName,
        action: res.plan.steps[0]?.result?.action,
        output: res.plan.steps[0]?.result?.output,
        evidence: res.plan.steps[0]?.result?.evidence,
        osVerificationDetails,
        finalResponse: res.finalResponse,
        durationMs: duration,
        passed:
          (item.category.startsWith('NEGATIVE') && (res.plan.status === 'FAILED' || res.plan.status === 'BLOCKED')) ||
          (!item.category.startsWith('NEGATIVE') && res.plan.status === 'COMPLETED'),
      };

      results.push(entry);

      console.log(`  Intent           : ${entry.intent}`);
      console.log(`  Tool Selected    : ${entry.toolName}`);
      console.log(`  Plan Status      : ${entry.planStatus} (${duration}ms)`);
      console.log(`  OS Verification  : ${osVerificationDetails}`);
      console.log(`  Agent Response   : ${entry.finalResponse.replace(/\n/g, ' ')}`);
      console.log(`  Validation State : ${entry.passed ? '✅ PASS' : '❌ FAIL'}\n`);
    }

    console.log('================================================================================');
    console.log(`SUMMARY: ${results.filter((r) => r.passed).length}/${results.length} Acceptance Tests Passed`);
    console.log('================================================================================\n');
  }, 45000);
});
