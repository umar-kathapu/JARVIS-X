import { ToolDefinition } from '../types/provider.types.js';

export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly definition: ToolDefinition;
  execute(args: Record<string, unknown>): Promise<string>;
}
