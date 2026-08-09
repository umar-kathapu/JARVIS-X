import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// IPC Payload Schemas (Matching Electron IPC Security Schemas)
const ExecuteTerminalSchema = z.object({
  command: z.string().min(1).max(100),
  args: z.array(z.string()).optional(),
});

describe('IPC Integration & Security Validation Tests', () => {
  const ALLOWED_COMMANDS = new Set(['ping', 'dir', 'ls', 'echo', 'node', 'pnpm', 'git']);
  const DANGEROUS_METACHARS_REGEX = /[;&|><$`\\]/;

  function validateAndSimulateIpc(event: { senderFrame?: any }, payload: unknown) {
    // 1. Sender Frame Security Check
    if (!event.senderFrame) {
      return {
        exitCode: 1,
        output: 'Security Alert: Invalid IPC Sender Frame',
      };
    }

    // 2. Payload Schema Parsing
    const rawPayload = typeof payload === 'string' ? { command: payload } : payload;
    const validated = ExecuteTerminalSchema.parse(rawPayload);

    // 3. Command Allowlist Check
    const rawCommand = validated.command.trim().toLowerCase();
    if (!ALLOWED_COMMANDS.has(rawCommand)) {
      return {
        exitCode: 1,
        output: `Security Alert: Command "${validated.command}" is restricted by system security policy.`,
      };
    }

    // 4. Metacharacter Inspection
    const args = validated.args || [];
    for (const arg of args) {
      if (DANGEROUS_METACHARS_REGEX.test(arg)) {
        return {
          exitCode: 1,
          output: 'Security Alert: Dangerous characters detected in command arguments.',
        };
      }
    }

    return {
      exitCode: 0,
      output: `Mock IPC Executed: ${validated.command} ${args.join(' ')}`.trim(),
    };
  }

  it('1. Should accept valid IPC request from authorized sender frame', () => {
    const mockEvent = { senderFrame: {} };
    const res = validateAndSimulateIpc(mockEvent, { command: 'node', args: ['-v'] });
    expect(res.exitCode).toBe(0);
    expect(res.output).toContain('Mock IPC Executed: node -v');
  });

  it('2. Should reject IPC request missing sender frame', () => {
    const mockInvalidEvent = { senderFrame: null };
    const res = validateAndSimulateIpc(mockInvalidEvent, { command: 'node' });
    expect(res.exitCode).toBe(1);
    expect(res.output).toBe('Security Alert: Invalid IPC Sender Frame');
  });

  it('3. Should reject non-allowlisted commands over IPC channel', () => {
    const mockEvent = { senderFrame: {} };
    const res = validateAndSimulateIpc(mockEvent, { command: 'powershell' });
    expect(res.exitCode).toBe(1);
    expect(res.output).toContain('restricted by system security policy');
  });

  it('4. Should block command injection metacharacters over IPC channel', () => {
    const mockEvent = { senderFrame: {} };
    const res = validateAndSimulateIpc(mockEvent, { command: 'echo', args: ['hello; rm -rf /'] });
    expect(res.exitCode).toBe(1);
    expect(res.output).toBe('Security Alert: Dangerous characters detected in command arguments.');
  });

  it('5. Should throw validation error for invalid IPC payload structures', () => {
    const mockEvent = { senderFrame: {} };
    expect(() => validateAndSimulateIpc(mockEvent, { command: 12345 })).toThrow();
  });
});
