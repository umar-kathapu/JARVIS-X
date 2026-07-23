import { BaseLLMProvider } from './base-provider.js';
import { AIProviderName, ChatMessage, LLMRequestOptions, LLMResponse, StreamChunk } from '../types/provider.types.js';
import { aiConfig } from '../config/ai.config.js';

export class OllamaProvider extends BaseLLMProvider {
  readonly name: AIProviderName = 'ollama';

  async isAvailable(): Promise<boolean> {
    // Offline local provider is available if url configured
    return Boolean(aiConfig.providers.ollama.baseUrl);
  }

  async generateText(messages: ChatMessage[], options?: LLMRequestOptions): Promise<LLMResponse> {
    const model = options?.model || aiConfig.providers.ollama.defaultModel;
    this.logExecution(model, messages.length);

    const lastMsg = messages[messages.length - 1]?.content || '';
    const content = `[Local Ollama ${model} Response]: "${lastMsg.substring(0, 50)}..." generated offline.`;

    return {
      id: `ollama-${Date.now()}`,
      model,
      content,
      finishReason: 'stop',
      usage: {
        promptTokens: messages.length * 10,
        completionTokens: content.length / 4,
        totalTokens: messages.length * 10 + content.length / 4,
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

export const ollamaProvider = new OllamaProvider();
