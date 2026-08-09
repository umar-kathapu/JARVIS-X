import { describe, it, expect, vi } from 'vitest';
import { terminalService } from '../../../src/main/terminal/terminal.service.js';

describe('E2E System Error Recovery & IPC Failure Fault Tolerance', () => {
  it('1. Should block unauthorized command injection attempts and recover safely', async () => {
    const res = await terminalService.executeCommand({ command: 'format' });
    expect(res.exitCode).toBe(1);
    expect(res.output).toContain('restricted by system security policy');
  });

  it('2. Should sanitize dangerous argument characters without throwing uncaught exceptions', async () => {
    const res = await terminalService.executeCommand({
      command: 'echo',
      args: ['malicious_input; rm -rf /'],
    });

    expect(res.exitCode).toBe(1);
    expect(res.output).toBe('Security Alert: Dangerous characters detected in command arguments.');
  });
});
