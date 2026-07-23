import { DocumentFileType, DocumentSource } from '../types/knowledge.types.js';

export class DocumentParser {
  parse(source: { id: string; title: string; content: string; fileType: DocumentFileType }): DocumentSource {
    const cleanedContent = this.cleanText(source.content);
    const metadata = this.extractMetadata(source.title, source.fileType, cleanedContent);

    return {
      id: source.id,
      title: source.title,
      fileType: source.fileType,
      content: cleanedContent,
      metadata,
    };
  }

  private cleanText(raw: string): string {
    return raw.replace(/\r\n/g, '\n').trim();
  }

  private extractMetadata(title: string, fileType: DocumentFileType, content: string): Record<string, unknown> {
    return {
      wordCount: content.split(/\s+/).length,
      characterCount: content.length,
      extension: fileType,
      parsedAt: new Date().toISOString(),
    };
  }
}

export const documentParser = new DocumentParser();
