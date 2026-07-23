import { BaseLLMProvider } from './base-provider.js';
import { AIProviderName, ChatMessage, LLMRequestOptions, LLMResponse, StreamChunk } from '../types/provider.types.js';
import { aiConfig } from '../config/ai.config.js';

export class LMStudioProvider extends BaseLLMProvider {
  readonly name: AIProviderName = 'lm-studio';

  async isAvailable(): Promise<boolean> {
    return Boolean(aiConfig.providers.lmStudio.baseUrl);
  }

  async generateText(messages: ChatMessage[], options?: LLMRequestOptions): Promise<LLMResponse> {
    const model = options?.model || aiConfig.providers.lmStudio.defaultModel;
    this.logExecution(model, messages.length);

    const lastMsg = messages[messages.length - 1]?.content || '';
    const content = `[LM Studio Local Model Response]: Processed "${lastMsg.substring(0, 50)}..."`;

    return {
      id: `lmstudio-${Date.now()}`,
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

export const lmStudioProvider = new LMStudioProvider();
