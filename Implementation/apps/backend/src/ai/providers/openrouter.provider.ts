import { BaseLLMProvider } from './base-provider.js';
import { AIProviderName, ChatMessage, LLMRequestOptions, LLMResponse, StreamChunk } from '../types/provider.types.js';
import { aiConfig } from '../config/ai.config.js';

export class OpenRouterProvider extends BaseLLMProvider {
  readonly name: AIProviderName = 'openrouter';

  async isAvailable(): Promise<boolean> {
    return Boolean(aiConfig.providers.openrouter.apiKey);
  }

  async generateText(messages: ChatMessage[], options?: LLMRequestOptions): Promise<LLMResponse> {
    const model = options?.model || aiConfig.providers.openrouter.defaultModel;
    this.logExecution(model, messages.length);

    const lastMsg = messages[messages.length - 1]?.content || '';
    const content = `[OpenRouter ${model} Multi-Model Response]: Processed prompt "${lastMsg.substring(0, 50)}..."`;

    return {
      id: `or-${Date.now()}`,
      model,
      content,
      finishReason: 'stop',
      usage: {
        promptTokens: messages.length * 15,
        completionTokens: content.length / 4,
        totalTokens: messages.length * 15 + content.length / 4,
      },
      provider: this.name,
    };
  }

  async generateStream(
    messages: ChatMessage[],
    options?: LLMRequestOptions,
    onChunk?: (chunk: StreamChunk) => void,
  ): Promise<LLMResponse> {
    const full = await this.generateText(messages, options);
    onChunk?.({ id: full.id, delta: full.content, isComplete: true, finishReason: 'stop' });
    return full;
  }
}

export const openRouterProvider = new OpenRouterProvider();
