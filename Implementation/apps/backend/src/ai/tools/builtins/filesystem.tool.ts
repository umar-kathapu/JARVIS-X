import { ITool } from '../tool.interface.js';
import { ToolDefinition } from '../../types/provider.types.js';

export class FilesystemTool implements ITool {
  readonly name = 'filesystem_read';
  readonly description = 'Reads text file content';

  readonly definition: ToolDefinition = {
    name: this.name,
    description: this.description,
    parameters: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Absolute file path' },
      },
      required: ['filePath'],
    },
  };

  async execute(args: Record<string, unknown>): Promise<string> {
    const path = String(args.filePath || '');
    return `[Filesystem Read Output]: Contents of file at '${path}'`;
  }
}
