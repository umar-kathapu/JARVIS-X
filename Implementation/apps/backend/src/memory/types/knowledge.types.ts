export type DocumentFileType = 'pdf' | 'docx' | 'txt' | 'markdown' | 'csv' | 'json' | 'html' | 'code';

export interface DocumentSource {
  id: string;
  title: string;
  fileType: DocumentFileType;
  content: string;
  collectionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ParsedDocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface HybridSearchResult {
  chunk: ParsedDocumentChunk;
  score: number;
  semanticSim: number;
  keywordMatch: number;
  citation: {
    documentId: string;
    sourceTitle: string;
    chunkIndex: number;
  };
}
