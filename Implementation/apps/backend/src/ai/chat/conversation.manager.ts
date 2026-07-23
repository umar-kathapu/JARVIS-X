import { ChatMessage } from '../types/provider.types.js';

export class ConversationManager {
  private messages: ChatMessage[] = [];

  constructor(systemPrompt?: string) {
    if (systemPrompt) {
      this.messages.push({ role: 'system', content: systemPrompt });
    }
  }

  addUserMessage(content: string): void {
    this.messages.push({ role: 'user', content });
  }

  addAssistantMessage(content: string): void {
    this.messages.push({ role: 'assistant', content });
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  // Truncates conversation to fit context window limits
  getTruncatedContext(maxTokens = 4000): ChatMessage[] {
    let currentEstTokens = 0;
    const result: ChatMessage[] = [];

    // Always preserve system prompt if present
    const systemMsg = this.messages.find((m) => m.role === 'system');
    if (systemMsg) {
      result.push(systemMsg);
      currentEstTokens += systemMsg.content.length / 4;
    }

    const nonSystemMsgs = this.messages.filter((m) => m.role !== 'system').reverse();

    for (const msg of nonSystemMsgs) {
      const msgTokens = msg.content.length / 4;
      if (currentEstTokens + msgTokens > maxTokens) break;
      result.splice(systemMsg ? 1 : 0, 0, msg);
      currentEstTokens += msgTokens;
    }

    return result;
  }
}
