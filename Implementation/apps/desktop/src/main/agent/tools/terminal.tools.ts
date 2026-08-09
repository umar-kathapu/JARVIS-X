import { IAgentTool, ToolDefinition, ToolExecutionResult } from '../agent.types.js';
import { terminalService } from '../../terminal/terminal.service.js';
import { securityPolicyService } from '../security.policy.js';

export class TerminalExecuteTool implements IAgentTool {
  readonly definition: ToolDefinition = {
    name: 'terminal.execute',
    description: 'Executes sandboxed terminal commands (e.g. git status, node -v, dir) with security allowlisting',
    category: 'TERMINAL',
    parameters: [
      { name: 'command', type: 'string', description: 'Command binary (e.g. git, node, echo)', required: true },
      { name: 'args', type: 'array', description: 'Command arguments (e.g. ["status"])', required: false },
    ],
    securityLevel: 'SAFE',
  };

  async execute(args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const command = String(args.command || '').trim();
    const commandArgs: string[] = Array.isArray(args.args)
      ? args.args.map((a) => String(a))
      : typeof args.args === 'string'
        ? String(args.args).split(' ')
        : [];

    if (!command) {
      return {
        success: false,
        status: 'FAILED',
        tool: this.definition.name,
        action: 'EXECUTE_TERMINAL',
        parameters: args,
        output: 'No command specified.',
        error: 'MissingCommand',
        evidence: { verified: false, verificationDetails: 'Missing required command' },
      };
    }

    // 1. Security Check
    const { safe, reason } = securityPolicyService.validateCommandSafety(command, commandArgs);
    if (!safe) {
      return {
        success: false,
        status: 'BLOCKED',
        tool: this.definition.name,
        action: 'EXECUTE_TERMINAL',
        parameters: { command, args: commandArgs },
        output: `Security Alert: ${reason}`,
        error: 'CommandPolicyViolation',
        evidence: {
          exitCode: 1,
          verified: false,
          verificationDetails: reason || 'Blocked by security policy',
        },
      };
    }

    // 2. Execute through terminal service
    const session = await terminalService.executeCommand({
      command,
      args: commandArgs,
    });

    const isSuccess = session.exitCode === 0;
    return {
      success: isSuccess,
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      tool: this.definition.name,
      action: 'EXECUTE_TERMINAL',
      parameters: { command, args: commandArgs },
      output: session.output,
      evidence: {
        command: session.command,
        exitCode: session.exitCode,
        verified: isSuccess,
        verificationDetails: `Process exited with code ${session.exitCode}`,
      },
    };
  }

  async verify(result: ToolExecutionResult): Promise<boolean> {
    return result.evidence?.exitCode === 0;
  }
}
