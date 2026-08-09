import { IAgentTool, ToolDefinition, ToolExecutionResult } from './agent.types.js';

export class ToolRegistry {
  private tools: Map<string, IAgentTool> = new Map();

  registerTool(tool: IAgentTool): void {
    this.tools.set(tool.definition.name, tool);
  }

  getTool(name: string): IAgentTool | undefined {
    return this.tools.get(name);
  }

  getAllDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.definition);
  }

  getToolsByCategory(category: ToolDefinition['category']): IAgentTool[] {
    return Array.from(this.tools.values()).filter((t) => t.definition.category === category);
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<ToolExecutionResult> {
    const tool = this.getTool(name);
    if (!tool) {
      return {
        success: false,
        output: `Tool "${name}" is not registered in the agent registry.`,
        error: `ToolNotFound: ${name}`,
      };
    }

    try {
      const result = await tool.execute(args);

      // Execute verification method if defined on the tool
      if (tool.verify && result.success) {
        const verified = await tool.verify(result);
        if (result.evidence) {
          result.evidence.verified = verified;
        }
      }

      return result;
    } catch (err: any) {
      return {
        success: false,
        output: `Execution error in tool "${name}": ${err.message}`,
        error: err.message,
      };
    }
  }
}

export const toolRegistry = new ToolRegistry();
