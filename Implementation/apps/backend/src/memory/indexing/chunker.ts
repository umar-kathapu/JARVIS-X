import { ParsedDocumentChunk, DocumentSource } from '../types/knowledge.types.js';

export class SemanticChunker {
  chunkDocument(doc: DocumentSource, chunkSize = 400, overlap = 50): ParsedDocumentChunk[] {
    const chunks: ParsedDocumentChunk[] = [];
    const words = doc.content.split(/\s+/);
    let start = 0;
    let index = 0;

    while (start < words.length) {
      const end = Math.min(start + chunkSize, words.length);
      const chunkWords = words.slice(start, end);
      const text = chunkWords.join(' ');

      chunks.push({
        id: `chunk_${doc.id}_${index}`,
        documentId: doc.id,
        chunkIndex: index,
        text,
        tokenCount: Math.ceil(text.length / 4),
        metadata: {
          wordCount: chunkWords.length,
          sourceTitle: doc.title,
        },
      });

      start += chunkSize - overlap;
      index++;
    }

    return chunks;
  }
}

export const semanticChunker = new SemanticChunker();
