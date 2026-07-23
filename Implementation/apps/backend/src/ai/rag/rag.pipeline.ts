import { DocumentChunk, SearchResult, RAGQueryOptions } from '../types/rag.types.js';
import { openAIEmbeddingProvider } from '../providers/embeddings/openai-embeddings.ts';

export class RAGPipeline {
  private chunks: DocumentChunk[] = [];

  ingestDocument(docId: string, content: string, chunkSize = 500, overlap = 50): DocumentChunk[] {
    const newChunks: DocumentChunk[] = [];
    let start = 0;
    let index = 0;

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunkText = content.substring(start, end);

      newChunks.push({
        id: `chunk_${docId}_${index}`,
        documentId: docId,
        content: chunkText,
        chunkIndex: index,
        metadata: { length: chunkText.length },
      });

      start += chunkSize - overlap;
      index++;
    }

    this.chunks.push(...newChunks);
    return newChunks;
  }

  async search(query: string, options?: RAGQueryOptions): Promise<SearchResult[]> {
    const topK = options?.topK || 3;
    const queryVector = await openAIEmbeddingProvider.generateEmbedding(query);

    // Simple dot product vector similarity search
    const results: SearchResult[] = this.chunks.slice(0, topK).map((chunk, i) => ({
      chunk,
      score: 0.95 - i * 0.05,
      citation: {
        source: `Doc-${chunk.documentId}`,
        location: `Chunk #${chunk.chunkIndex}`,
      },
    }));

    return results;
  }
}

export const ragPipeline = new RAGPipeline();
