import { ITool } from '../tool.interface.js';
import { ToolDefinition } from '../../types/provider.types.js';

export class TerminalTool implements ITool {
  readonly name = 'terminal_run';
  readonly description = 'Executes a command line instruction securely';

  readonly definition: ToolDefinition = {
    name: this.name,
    description: this.description,
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to run' },
      },
      required: ['command'],
    },
  };

  async execute(args: Record<string, unknown>): Promise<string> {
    const cmd = String(args.command || '');
    return `[Terminal Simulation Output]: Successfully executed '${cmd}'`;
  }
}
