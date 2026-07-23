import { ILLMProvider, AIProviderName } from '../types/provider.types.js';
import { openAIProvider } from './openai.provider.js';
import { geminiProvider } from './gemini.provider.js';
import { anthropicProvider } from './anthropic.provider.js';
import { ollamaProvider } from './ollama.provider.js';
import { lmStudioProvider } from './lm-studio.provider.js';
import { openRouterProvider } from './openrouter.provider.js';
import { aiConfig } from '../config/ai.config.js';
import { logger } from '../../utils/logger.js';

export class ProviderFactory {
  private static providers: Map<AIProviderName, ILLMProvider> = new Map([
    ['openai', openAIProvider],
    ['gemini', geminiProvider],
    ['anthropic', anthropicProvider],
    ['ollama', ollamaProvider],
    ['lm-studio', lmStudioProvider],
    ['openrouter', openRouterProvider],
  ]);

  static getProvider(name?: AIProviderName): ILLMProvider {
    const targetName = name || aiConfig.profiles.default.defaultProvider;
    const provider = this.providers.get(targetName);

    if (!provider) {
      logger.warn(`Provider '${targetName}' not found. Falling back to Ollama local provider.`);
      return ollamaProvider;
    }

    return provider;
  }

  static async getAvailableProvider(preferred?: AIProviderName): Promise<ILLMProvider> {
    if (preferred) {
      const p = this.providers.get(preferred);
      if (p && (await p.isAvailable())) {
        return p;
      }
    }

    // Try fallback chain
    for (const fallbackName of aiConfig.profiles.default.fallbackProviders) {
      const fallbackProvider = this.providers.get(fallbackName);
      if (fallbackProvider && (await fallbackProvider.isAvailable())) {
        logger.info(`Using fallback AI provider: ${fallbackName}`);
        return fallbackProvider;
      }
    }

    // Default to Ollama local provider
    return ollamaProvider;
  }
}
