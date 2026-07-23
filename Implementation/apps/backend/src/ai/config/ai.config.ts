import { AIProviderName } from '../types/provider.types.js';

export interface AIProfile {
  defaultProvider: AIProviderName;
  fallbackProviders: AIProviderName[];
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}

export const aiConfig = {
  activeProfile: 'default',
  profiles: {
    default: {
      defaultProvider: 'openai' as AIProviderName,
      fallbackProviders: ['anthropic', 'gemini', 'ollama'] as AIProviderName[],
      defaultModel: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
    },
    offline: {
      defaultProvider: 'ollama' as AIProviderName,
      fallbackProviders: ['lm-studio'] as AIProviderName[],
      defaultModel: 'llama3:latest',
      temperature: 0.5,
      maxTokens: 2048,
    },
  },
  providers: {
    openai: {
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      apiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: 'gpt-4o',
    },
    gemini: {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: process.env.GEMINI_API_KEY || '',
      defaultModel: 'gemini-1.5-flash',
    },
    anthropic: {
      baseUrl: 'https://api.anthropic.com/v1',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      defaultModel: 'claude-3-5-sonnet-20240620',
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      defaultModel: 'llama3',
    },
    lmStudio: {
      baseUrl: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1',
      defaultModel: 'local-model',
    },
    openrouter: {
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      defaultModel: 'auto',
    },
  },
};
