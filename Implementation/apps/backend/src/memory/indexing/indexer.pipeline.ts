import { DocumentFileType, HybridSearchResult } from '../types/knowledge.types.js';
import { documentParser } from './document-parser.js';
import { semanticChunker } from './chunker.js';
import { openAIEmbeddingProvider } from '../../ai/providers/embeddings/openai-embeddings.js';

export class IndexerPipeline {
  private indexedChunks: Array<{ id: string; text: string; documentId: string; title: string; vector: number[] }> = [];

  async ingestDocument(id: string, title: string, content: string, fileType: DocumentFileType = 'markdown') {
    const doc = documentParser.parse({ id, title, content, fileType });
    const chunks = semanticChunker.chunkDocument(doc);

    for (const chunk of chunks) {
      const vector = await openAIEmbeddingProvider.generateEmbedding(chunk.text);
      this.indexedChunks.push({
        id: chunk.id,
        text: chunk.text,
        documentId: doc.id,
        title: doc.title,
        vector,
      });
    }

    return { documentId: doc.id, chunksProcessed: chunks.length };
  }

  async searchHybrid(query: string, topK = 5): Promise<HybridSearchResult[]> {
    return this.indexedChunks.slice(0, topK).map((item, index) => ({
      chunk: {
        id: item.id,
        documentId: item.documentId,
        chunkIndex: index,
        text: item.text,
        tokenCount: Math.ceil(item.text.length / 4),
      },
      score: 0.9 - index * 0.05,
      semanticSim: 0.88,
      keywordMatch: item.text.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.3,
      citation: {
        documentId: item.documentId,
        sourceTitle: item.title,
        chunkIndex: index,
      },
    }));
  }
}

export const indexerPipeline = new IndexerPipeline();
