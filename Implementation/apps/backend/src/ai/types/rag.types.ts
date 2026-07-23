export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
  citation: {
    source: string;
    location?: string;
  };
}

export interface RAGQueryOptions {
  topK?: number;
  similarityThreshold?: number;
  filterMetadata?: Record<string, unknown>;
}
