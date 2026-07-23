import { ChatMessage, LLMRequestOptions, LLMResponse, StreamChunk, AIProviderName } from '../types/provider.types.js';
import { ProviderFactory } from '../providers/provider.factory.js';
import { ragPipeline } from '../rag/rag.pipeline.js';
import { taskPlanner } from '../agents/planner.js';
import { reasoningEngine } from '../agents/reasoning.engine.ts';
import { toolRegistry } from '../tools/registry.js';
import { TerminalTool } from '../tools/builtins/terminal.tool.js';
import { FilesystemTool } from '../tools/builtins/filesystem.tool.js';
import { SearchTool } from '../tools/builtins/search.tool.js';
import { logger } from '../../utils/logger.js';

export class AIEngine {
  private static instance: AIEngine;

  private constructor() {
    // Register built-in tools
    toolRegistry.registerTool(new TerminalTool());
    toolRegistry.registerTool(new FilesystemTool());
    toolRegistry.registerTool(new SearchTool());
    logger.info('🧠 JARVIS-X AI Core Engine initialized');
  }

  public static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine();
    }
    return AIEngine.instance;
  }

  async chat(messages: ChatMessage[], options?: LLMRequestOptions, preferredProvider?: AIProviderName): Promise<LLMResponse> {
    const provider = await ProviderFactory.getAvailableProvider(preferredProvider);
    return provider.generateText(messages, options);
  }

  async chatStream(
    messages: ChatMessage[],
    options?: LLMRequestOptions,
    onChunk?: (chunk: StreamChunk) => void,
    preferredProvider?: AIProviderName,
  ): Promise<LLMResponse> {
    const provider = await ProviderFactory.getAvailableProvider(preferredProvider);
    return provider.generateStream(messages, options, onChunk);
  }

  async executeAutonomousGoal(goal: string): Promise<string> {
    const plan = taskPlanner.createPlan(goal);
    return reasoningEngine.executePlan(plan);
  }

  async searchKnowledge(query: string) {
    return ragPipeline.search(query);
  }
}

export const aiEngine = AIEngine.getInstance();
