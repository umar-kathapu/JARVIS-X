import { IAction, ActionDefinition, ActionResult } from '../../types/action.types.js';

export class TerminalAction implements IAction {
  readonly definition: ActionDefinition = {
    id: 'terminal_command',
    name: 'Terminal Command',
    description: 'Executes a command-line script',
    category: 'System',
    parametersSchema: {
      command: { type: 'string', required: true },
    },
  };

  async execute(params: Record<string, unknown>): Promise<ActionResult> {
    const startTime = Date.now();
    const command = String(params.command || '');

    return {
      success: true,
      data: { command, output: `[Terminal Action Output]: Executed '${command}'` },
      executionTimeMs: Date.now() - startTime,
    };
  }
}
