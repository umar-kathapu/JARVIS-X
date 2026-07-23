export type MemoryCategory =
  | 'WORKING'
  | 'SHORT_TERM'
  | 'LONG_TERM'
  | 'SEMANTIC'
  | 'PROCEDURAL'
  | 'EPISODIC'
  | 'CONVERSATION'
  | 'PREFERENCE'
  | 'TASK'
  | 'KNOWLEDGE';

export interface MemoryRecord {
  id: string;
  category: MemoryCategory;
  key: string;
  content: string;
  importance: number; // 0.0 to 1.0
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryQueryOptions {
  category?: MemoryCategory;
  tags?: string[];
  limit?: number;
  minImportance?: number;
  includeVector?: boolean;
}

export interface MemoryRankScore {
  record: MemoryRecord;
  semanticSimilarity: number;
  keywordScore: number;
  recencyScore: number;
  importanceScore: number;
  finalScore: number;
}
