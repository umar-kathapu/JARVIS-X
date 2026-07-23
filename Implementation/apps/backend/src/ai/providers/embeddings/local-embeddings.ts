import { IEmbeddingProvider } from '../../types/provider.types.js';

export class LocalEmbeddingProvider implements IEmbeddingProvider {
  readonly name = 'local-embedding';

  async generateEmbedding(text: string): Promise<number[]> {
    const vector = new Array(768).fill(0).map((_, i) => Math.cos(text.length + i) * 0.05);
    return vector;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }
}

export const localEmbeddingProvider = new LocalEmbeddingProvider();
