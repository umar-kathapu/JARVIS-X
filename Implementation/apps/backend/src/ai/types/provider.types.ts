export type AIProviderName =
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'ollama'
  | 'lm-studio'
  | 'openrouter'
  | 'custom';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LLMRequestOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LLMResponse {
  id: string;
  model: string;
  content: string;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  }>;
  usage?: TokenUsage;
  provider: AIProviderName;
}

export interface StreamChunk {
  id: string;
  delta: string;
  isComplete: boolean;
  finishReason?: string;
}

export interface ILLMProvider {
  readonly name: AIProviderName;
  generateText(messages: ChatMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;
  generateStream(
    messages: ChatMessage[],
    options?: LLMRequestOptions,
    onChunk?: (chunk: StreamChunk) => void,
  ): Promise<LLMResponse>;
  isAvailable(): Promise<boolean>;
}

export interface IEmbeddingProvider {
  readonly name: string;
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}
