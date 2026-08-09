import { execFile } from 'child_process';
import { TerminalSession } from '../types/desktop.types.js';

export interface ExecutableCommandPayload {
  command: string;
  args?: string[];
}

export class TerminalService {
  // Pre-approved safe system commands allowlist
  private readonly ALLOWED_COMMANDS = new Set<string>([
    'ping',
    'dir',
    'ls',
    'echo',
    'node',
    'pnpm',
    'npm',
    'git',
    'systeminfo',
    'hostname',
    'whoami',
    'ver',
  ]);

  // Forbidden shell metacharacters that allow command chaining or subshell injection
  private readonly DANGEROUS_METACHARS_REGEX = /[;&|><$`\\]/;

  async executeCommand(payload: ExecutableCommandPayload): Promise<TerminalSession> {
    const rawCommand = payload.command.trim().toLowerCase();

    // 1. Validate Command against Allowlist
    if (!this.ALLOWED_COMMANDS.has(rawCommand)) {
      return {
        id: `term_denied_${Date.now()}`,
        command: `${payload.command} ${(payload.args || []).join(' ')}`.trim(),
        output: `Security Alert: Command "${payload.command}" is restricted by system security policy.`,
        exitCode: 1,
      };
    }

    // 2. Validate Command Arguments against Metacharacter Injection
    const args = payload.args || [];
    for (const arg of args) {
      if (this.DANGEROUS_METACHARS_REGEX.test(arg)) {
        return {
          id: `term_blocked_${Date.now()}`,
          command: `${payload.command} ${args.join(' ')}`,
          output: 'Security Alert: Dangerous characters detected in command arguments.',
          exitCode: 1,
        };
      }
    }

    // 3. Execute safely via execFile without subshell invocation
    return new Promise((resolve) => {
      execFile(
        payload.command,
        args,
        {
          timeout: 10000, // 10s maximum execution limit
          maxBuffer: 1024 * 1024 * 2, // 2MB output buffer
        },
        (error, stdout, stderr) => {
          resolve({
            id: `term_${Date.now()}`,
            command: `${payload.command} ${args.join(' ')}`.trim(),
            output: stdout || stderr || error?.message || 'Command executed with no output.',
            exitCode: error ? error.code || 1 : 0,
          });
        },
      );
    });
  }
}

export const terminalService = new TerminalService();
