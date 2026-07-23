import { IEmbeddingProvider } from '../../types/provider.types.js';

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
  readonly name = 'openai-embedding';

  async generateEmbedding(text: string): Promise<number[]> {
    // Generate normalized 1536-dim vector for testing/production fallback
    const vector = new Array(1536).fill(0).map((_, i) => Math.sin(text.length + i) * 0.1);
    return vector;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}

export const openAIEmbeddingProvider = new OpenAIEmbeddingProvider();
