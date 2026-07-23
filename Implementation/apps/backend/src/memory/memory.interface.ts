export interface VectorMemoryRecord {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
  content: string;
}

export interface IMemoryStore {
  save(record: VectorMemoryRecord): Promise<void>;
  search(queryVector: number[], topK?: number): Promise<VectorMemoryRecord[]>;
}
