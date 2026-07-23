import { describe, it, expect } from 'vitest';
import { memoryEngine } from '../../src/memory/core/memory.engine.js';
import { documentParser } from '../../src/memory/indexing/document-parser.js';
import { semanticChunker } from '../../src/memory/indexing/chunker.js';
import { userProfileService } from '../../src/memory/profiles/user-profile.service.js';

describe('Memory & Knowledge Engine Unit Tests', () => {
  it('documentParser should extract text and metadata', () => {
    const doc = documentParser.parse({
      id: 'doc_101',
      title: 'JARVIS Architecture',
      content: 'JARVIS-X is built with pnpm workspaces and TurboRepo.',
      fileType: 'markdown',
    });

    expect(doc.title).toBe('JARVIS Architecture');
    expect(doc.metadata).toHaveProperty('wordCount');
  });

  it('semanticChunker should split text into overlapping chunks', () => {
    const doc = documentParser.parse({
      id: 'doc_102',
      title: 'Monorepo Guide',
      content: 'word '.repeat(500),
      fileType: 'txt',
    });

    const chunks = semanticChunker.chunkDocument(doc, 100, 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.tokenCount).toBeGreaterThan(0);
  });

  it('userProfileService should manage preferences and active goals', async () => {
    const profile = await userProfileService.getUserProfile('user_99');
    expect(profile.userId).toBe('user_99');

    await userProfileService.updatePreference('user_99', 'theme', 'dark', 'ui');
    const newGoal = await userProfileService.addGoal('user_99', 'Build AI Engine');

    expect(newGoal.description).toBe('Build AI Engine');
  });

  it('memoryEngine should remember and search knowledge', async () => {
    const memory = await memoryEngine.remember('test_key', 'Sample memory content', 'LONG_TERM', 0.9, ['tag1']);
    expect(memory.id).toBeTruthy();

    await memoryEngine.ingestKnowledgeDocument('doc_200', 'Doc Title', 'Knowledge base chunk text content', 'markdown');
    const searchResults = await memoryEngine.searchKnowledge('knowledge');

    expect(searchResults.length).toBeGreaterThan(0);
  });
});
