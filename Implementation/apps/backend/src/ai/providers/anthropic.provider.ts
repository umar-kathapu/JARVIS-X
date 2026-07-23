import { BaseLLMProvider } from './base-provider.js';
import { AIProviderName, ChatMessage, LLMRequestOptions, LLMResponse, StreamChunk } from '../types/provider.types.js';
import { aiConfig } from '../config/ai.config.js';

export class AnthropicProvider extends BaseLLMProvider {
  readonly name: AIProviderName = 'anthropic';

  async isAvailable(): Promise<boolean> {
    return Boolean(aiConfig.providers.anthropic.apiKey);
  }

  async generateText(messages: ChatMessage[], options?: LLMRequestOptions): Promise<LLMResponse> {
    const model = options?.model || aiConfig.providers.anthropic.defaultModel;
    this.logExecution(model, messages.length);

    const lastMsg = messages[messages.length - 1]?.content || '';
    const content = `[Claude ${model} Response]: "${lastMsg.substring(0, 50)}..." processed with Anthropic reasoning.`;

    return {
      id: `msg_claude_${Date.now()}`,
      model,
      content,
      finishReason: 'stop',
      usage: {
        promptTokens: messages.length * 14,
        completionTokens: content.length / 4,
        totalTokens: messages.length * 14 + content.length / 4,
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

export const anthropicProvider = new AnthropicProvider();
