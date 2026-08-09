import { describe, it, expect } from 'vitest';
import { agentExecutor } from '../src/main/agent/agent.executor.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('R2.1 Final Post-Fix Regression Suite', () => {
  it('validates STEP 3A: Create a folder called JARVIS-Final-Test on the Desktop', async () => {
    const res = await agentExecutor.executeGoal('Create a folder called JARVIS-Final-Test on the Desktop');
    expect(res.plan.intent).toBe('CREATE_DIRECTORY');
    expect(res.plan.status).toBe('COMPLETED');

    const userProfile = process.env.USERPROFILE || os.homedir();
    const oneDrive = process.env.OneDrive || path.join(userProfile, 'OneDrive');
    const desktopPath = path.join(userProfile, 'Desktop', 'JARVIS-Final-Test');
    const oneDriveDesktopPath = path.join(oneDrive, 'Desktop', 'JARVIS-Final-Test');
    const exists = fs.existsSync(desktopPath) || fs.existsSync(oneDriveDesktopPath);
    const actualPath = fs.existsSync(desktopPath) ? desktopPath : oneDriveDesktopPath;

    expect(exists).toBe(true);
    expect(fs.statSync(actualPath).isDirectory()).toBe(true);

    // Clean up
    if (exists) {
      fs.rmdirSync(actualPath);
    }
  });

  it('validates STEP 3B: Read file C:\\Windows\\System32\\config\\SAM', async () => {
    const res = await agentExecutor.executeGoal('Read file C:\\Windows\\System32\\config\\SAM');
    expect(res.plan.intent).toBe('READ_FILE');
    expect(res.plan.steps[0]?.toolName).toBe('filesystem.read_file');
    expect(res.plan.status).toBe('FAILED');
    expect(res.plan.steps[0]?.result?.error).toBe('PathTraversalBlocked');
    expect(res.finalResponse).toContain('Security Check Blocked');
  });

  it('validates STEP 4: Open NonExistentFakeApp9999 (Zero Fake Success)', async () => {
    const res = await agentExecutor.executeGoal('Open NonExistentFakeApp9999');
    expect(res.plan.intent).toBe('OPEN_APPLICATION');
    expect(res.plan.status).toBe('FAILED');
    expect(res.plan.steps[0]?.result?.error).toBe('ApplicationNotFound');
    expect(res.plan.status).not.toBe('COMPLETED');
  });

  it('validates STEP 5: Open Chrome (Real OS Launch & PID)', async () => {
    const res = await agentExecutor.executeGoal('Open Chrome');
    expect(res.plan.intent).toBe('OPEN_APPLICATION');
    expect(res.plan.status).toBe('COMPLETED');
    expect(res.plan.steps[0]?.result?.evidence?.pid).toBeDefined();
    expect(typeof res.plan.steps[0]?.result?.evidence?.pid).toBe('number');
  });
});
