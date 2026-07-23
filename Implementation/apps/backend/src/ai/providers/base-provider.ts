import { ILLMProvider, AIProviderName, ChatMessage, LLMRequestOptions, LLMResponse, StreamChunk } from '../types/provider.types.js';
import { logger } from '../../utils/logger.js';

export abstract class BaseLLMProvider implements ILLMProvider {
  abstract readonly name: AIProviderName;

  abstract generateText(messages: ChatMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;

  abstract generateStream(
    messages: ChatMessage[],
    options?: LLMRequestOptions,
    onChunk?: (chunk: StreamChunk) => void,
  ): Promise<LLMResponse>;

  abstract isAvailable(): Promise<boolean>;

  protected logExecution(model: string, messageCount: number) {
    logger.info(`[AI Provider: ${this.name}] Executing model '${model}' with ${messageCount} messages`);
  }
}
