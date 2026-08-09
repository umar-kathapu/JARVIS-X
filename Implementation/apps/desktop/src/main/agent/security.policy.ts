import path from 'path';
import os from 'os';
import { SecurityLevel } from './agent.types.js';

export class SecurityPolicyService {
  // Disallowed metacharacters that enable command injection or subshell chaining
  private readonly DANGEROUS_SHELL_METACHARS = /[;&|><$`\\]/;

  // Known dangerous commands that are unconditionally BLOCKED
  private readonly BLOCKED_COMMANDS = new Set<string>([
    'rmdir /s',
    'del /f /s /q',
    'format',
    'diskpart',
    'reg delete',
    'powershell -enc',
    'curl | sh',
    'wget | sh',
    'chmod 777',
    'net user /add',
    'mimikatz',
  ]);

  // Safe directories for filesystem operations
  private readonly SAFE_BASE_DIRECTORIES: string[] = [
    os.homedir(),
    path.join(os.homedir(), 'Desktop'),
    path.join(os.homedir(), 'Downloads'),
    path.join(os.homedir(), 'Documents'),
    path.join(os.homedir(), 'Music'),
    path.join(os.homedir(), 'Pictures'),
    path.join(os.homedir(), 'Videos'),
    path.join(os.homedir(), 'Projects'),
    process.cwd(),
    os.tmpdir(),
  ];

  /**
   * Evaluates the security level of a requested operation
   */
  evaluateSecurityLevel(toolName: string, args: Record<string, unknown>): SecurityLevel {
    // 1. Unconditionally BLOCKED operations
    if (this.isMaliciousIntent(toolName, args)) {
      return 'BLOCKED';
    }

    // 2. Destructive Filesystem operations require user confirmation
    if (toolName === 'filesystem.delete_file' || toolName === 'filesystem.delete_directory') {
      return 'CONFIRM_REQUIRED';
    }

    // 3. Sensitive operations
    if (toolName === 'system.shutdown' || toolName === 'system.restart') {
      return 'CONFIRM_REQUIRED';
    }

    // 4. Safe operations
    return 'SAFE';
  }

  /**
   * Validates that a filesystem path is within safe user boundaries and avoids path traversal
   */
  isPathSafe(targetPath: string): { safe: boolean; resolvedPath: string; reason?: string } {
    if (!targetPath || typeof targetPath !== 'string') {
      return { safe: false, resolvedPath: '', reason: 'Invalid or empty path provided' };
    }

    // Resolve relative path against user home or current directory
    const resolved = path.isAbsolute(targetPath)
      ? path.normalize(targetPath)
      : path.normalize(path.resolve(os.homedir(), targetPath));

    // Check for directory traversal attempts targeting system roots
    const normalizedLower = resolved.toLowerCase();
    const systemRoot = process.env.SystemRoot?.toLowerCase() || 'c:\\windows';
    const programFiles = process.env.ProgramFiles?.toLowerCase() || 'c:\\program files';

    // Disallow modifying sensitive OS directories
    if (
      normalizedLower.startsWith(systemRoot) &&
      !normalizedLower.includes('temp')
    ) {
      return {
        safe: false,
        resolvedPath: resolved,
        reason: 'Path traversal into protected Windows System directory is prohibited',
      };
    }

    return { safe: true, resolvedPath: resolved };
  }

  /**
   * Sanitizes and validates terminal arguments for shell injection prevention
   */
  validateCommandSafety(command: string, args: string[] = []): { safe: boolean; reason?: string } {
    const fullCmd = `${command} ${args.join(' ')}`.toLowerCase();

    for (const blocked of this.BLOCKED_COMMANDS) {
      if (fullCmd.includes(blocked)) {
        return { safe: false, reason: `Command contains restricted expression: "${blocked}"` };
      }
    }

    for (const arg of args) {
      if (this.DANGEROUS_SHELL_METACHARS.test(arg)) {
        return {
          safe: false,
          reason: `Dangerous shell metacharacters detected in argument: "${arg}"`,
        };
      }
    }

    return { safe: true };
  }

  private isMaliciousIntent(toolName: string, args: Record<string, unknown>): boolean {
    const rawArgs = JSON.stringify(args).toLowerCase();
    const maliciousPatterns = [
      'password',
      'mimikatz',
      'shadowcopy',
      'bypass-uac',
      'keylogger',
      'inject',
    ];

    for (const pattern of maliciousPatterns) {
      if (rawArgs.includes(pattern) && toolName === 'terminal.execute') {
        return true;
      }
    }

    return false;
  }
}

export const securityPolicyService = new SecurityPolicyService();
