import { ChatMessage } from '../../ai/types/provider.types.js';

export class SummarizerService {
  summarizeConversation(messages: ChatMessage[]): string {
    const userMessages = messages.filter((m) => m.role === 'user');
    const assistantMessages = messages.filter((m) => m.role === 'assistant');

    return `Conversation Summary (${messages.length} messages): Discussed ${userMessages.length} user queries and generated ${assistantMessages.length} AI responses. Key topics covered.`;
  }

  summarizeText(text: string, maxLength = 200): string {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}... [Summary Compressed]`;
  }
}

export const summarizerService = new SummarizerService();
