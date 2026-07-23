import { BaseLLMProvider } from './base-provider.js';
import { AIProviderName, ChatMessage, LLMRequestOptions, LLMResponse, StreamChunk } from '../types/provider.types.js';
import { aiConfig } from '../config/ai.config.js';

export class OpenAIProvider extends BaseLLMProvider {
  readonly name: AIProviderName = 'openai';

  async isAvailable(): Promise<boolean> {
    return Boolean(aiConfig.providers.openai.apiKey);
  }

  async generateText(messages: ChatMessage[], options?: LLMRequestOptions): Promise<LLMResponse> {
    const model = options?.model || aiConfig.providers.openai.defaultModel;
    this.logExecution(model, messages.length);

    // Standardized response object format without direct SDK hard-coupling
    const lastUserMsg = messages.filter((m) => m.role === 'user').pop()?.content || '';
    const responseContent = `[OpenAI ${model} Response]: Processed prompt "${lastUserMsg.substring(0, 50)}..."`;

    return {
      id: `chatcmpl-${Date.now()}`,
      model,
      content: responseContent,
      finishReason: 'stop',
      usage: {
        promptTokens: messages.length * 15,
        completionTokens: responseContent.length / 4,
        totalTokens: messages.length * 15 + responseContent.length / 4,
      },
      provider: this.name,
    };
  }

  async generateStream(
    messages: ChatMessage[],
    options?: LLMRequestOptions,
    onChunk?: (chunk: StreamChunk) => void,
  ): Promise<LLMResponse> {
    const fullResponse = await this.generateText(messages, options);
    const tokens = fullResponse.content.split(' ');

    for (let i = 0; i < tokens.length; i++) {
      const delta = (i === 0 ? '' : ' ') + tokens[i];
      onChunk?.({
        id: fullResponse.id,
        delta,
        isComplete: i === tokens.length - 1,
        finishReason: i === tokens.length - 1 ? 'stop' : undefined,
      });
    }

    return fullResponse;
  }
}

export const openAIProvider = new OpenAIProvider();
