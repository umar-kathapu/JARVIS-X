import { describe, it, expect, vi, beforeEach } from 'vitest';
import { terminalService } from '../src/main/terminal/terminal.service.js';
import { registerIpcHandlers } from '../src/main/ipc/ipc.handlers.js';
import { ipcMain } from 'electron';

// Mock child_process.execFile to prevent spawning actual system processes during unit testing
vi.mock('child_process', () => ({
  execFile: vi.fn((cmd: string, args: string[], _opts: any, callback: any) => {
    callback(null, `Mock output for ${cmd} ${(args || []).join(' ')}`.trim(), '');
  }),
}));

describe('Electron IPC Terminal Security Unit Tests', () => {
  const ipcHandlerMap = new Map<string, (event: any, ...args: any[]) => Promise<any>>();

  beforeEach(() => {
    vi.clearAllMocks();
    ipcHandlerMap.clear();

    // Mock ipcMain.handle to capture registered handlers
    vi.spyOn(ipcMain, 'handle').mockImplementation((channel: string, handler: any) => {
      ipcHandlerMap.set(channel, handler);
    });

    registerIpcHandlers();
  });

  describe('1. Allowlisted Commands Execution', () => {

      it('should allow "node" command execution', async () => {
      const res = await terminalService.executeCommand({ command: 'node', args: ['--version'] });
      expect(res.exitCode).toBe(0);
      expect(res.output).toContain('Mock output for node --version');
    });

    it('should allow "git" command execution', async () => {
      const res = await terminalService.executeCommand({ command: 'git', args: ['status'] });
      expect(res.exitCode).toBe(0);
      expect(res.output).toContain('Mock output for git status');
    });

    it('should allow "pnpm" command execution', async () => {
      const res = await terminalService.executeCommand({ command: 'pnpm', args: ['-v'] });
      expect(res.exitCode).toBe(0);
      expect(res.output).toContain('Mock output for pnpm -v');
    });

    it('should allow "ping" command execution', async () => {
      const res = await terminalService.executeCommand({ command: 'ping', args: ['127.0.0.1'] });
      expect(res.exitCode).toBe(0);
      expect(res.output).toContain('Mock output for ping 127.0.0.1');
    });

    it('should allow "dir" command execution', async () => {
      const res = await terminalService.executeCommand({ command: 'dir' });
      expect(res.exitCode).toBe(0);
      expect(res.output).toContain('Mock output for dir');
    });
  });

  describe('2. Non-Allowlisted Commands Rejection', () => {
    it('should reject unapproved system binaries', async () => {
      const forbiddenCommands = ['powershell', 'cmd', 'bash', 'curl', 'wget', 'rmdir', 'format'];

      for (const cmd of forbiddenCommands) {
        const res = await terminalService.executeCommand({ command: cmd });
        expect(res.exitCode).toBe(1);
        expect(res.output).toContain(`Security Alert: Command "${cmd}" is restricted by system security policy.`);
      }
    });
  });

  describe('3. Shell Metacharacter Injection Rejection', () => {
    it('should block command arguments containing forbidden metacharacters', async () => {
      const dangerousArgs = [
        'arg1; rm -rf /',
        'arg1 & calc.exe',
        'arg1 | grep secret',
        'arg1 > output.txt',
        'arg1 < input.txt',
        'arg1 $ENV_VAR',
        'arg1 `whoami`',
        'arg1 && shutdown /s',
        'arg1 \\ dangerous',
      ];

      for (const dangerousArg of dangerousArgs) {
        const res = await terminalService.executeCommand({
          command: 'echo',
          args: [dangerousArg],
        });

        expect(res.exitCode).toBe(1);
        expect(res.output).toBe('Security Alert: Dangerous characters detected in command arguments.');
      }
    });
  });

  describe('4. Empty Command & Whitespace Handling', () => {
    it('should reject empty or whitespace-only command strings', async () => {
      const resEmpty = await terminalService.executeCommand({ command: '' });
      expect(resEmpty.exitCode).toBe(1);
      expect(resEmpty.output).toContain('restricted by system security policy');

      const resSpace = await terminalService.executeCommand({ command: '   ' });
      expect(resSpace.exitCode).toBe(1);
      expect(resSpace.output).toContain('restricted by system security policy');
    });
  });

  describe('5. Invalid Arguments Handling', () => {
    it('should handle missing or empty arguments array gracefully', async () => {
      const res = await terminalService.executeCommand({ command: 'echo' });
      expect(res.exitCode).toBe(0);
      expect(res.command).toBe('echo');
    });
  });

  describe('6. Zod Validation Failures via IPC Handler', () => {
    it('should throw Zod validation error if command field is missing', async () => {
      const handler = ipcHandlerMap.get('EXECUTE_TERMINAL');
      expect(handler).toBeDefined();

      const mockEvent = { senderFrame: {} };
      await expect(handler!(mockEvent, { args: ['-v'] })).rejects.toThrow();
    });

    it('should throw Zod validation error if command exceeds 100 characters', async () => {
      const handler = ipcHandlerMap.get('EXECUTE_TERMINAL');
      expect(handler).toBeDefined();

      const mockEvent = { senderFrame: {} };
      const longCommand = 'node'.repeat(30); // 120 chars
      await expect(handler!(mockEvent, { command: longCommand })).rejects.toThrow();
    });
  });

  describe('7. IPC Sender Validation Failures', () => {
    it('should reject execution if event.senderFrame is missing or null', async () => {
      const handler = ipcHandlerMap.get('EXECUTE_TERMINAL');
      expect(handler).toBeDefined();

      const mockInvalidEvent = { senderFrame: null };
      const res = await handler!(mockInvalidEvent, { command: 'node' });

      expect(res.exitCode).toBe(1);
      expect(res.output).toBe('Security Alert: Invalid IPC Sender Frame');
    });
  });
});
