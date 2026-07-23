import { ITool } from './tool.interface.js';
import { ToolDefinition } from '../types/provider.types.js';

export class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  registerTool(tool: ITool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  getAllDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found in registry`);
    }
    return tool.execute(args);
  }
}

export const toolRegistry = new ToolRegistry();
