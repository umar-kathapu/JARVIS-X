import { describe, it, expect } from 'vitest';
import { aiEngine } from '../../src/ai/core/ai.engine.js';
import { ProviderFactory } from '../../src/ai/providers/provider.factory.js';
import { PromptTemplate } from '../../src/ai/prompts/prompt.template.js';
import { ragPipeline } from '../../src/ai/rag/rag.pipeline.js';
import { toolRegistry } from '../../src/ai/tools/registry.js';

describe('AI Core Engine Unit Tests', () => {
  it('ProviderFactory should select available provider or fallback to Ollama', async () => {
    const provider = await ProviderFactory.getAvailableProvider('openai');
    expect(provider).toBeDefined();
    expect(provider.name).toBeTruthy();
  });

  it('PromptTemplate should substitute variables correctly', () => {
    const template = new PromptTemplate('Hello {{ name }}, welcome to {{ system }}!');
    const rendered = template.render({ name: 'User', system: 'JARVIS-X' });
    expect(rendered).toBe('Hello User, welcome to JARVIS-X!');
  });

  it('RAGPipeline should ingest documents into chunks and perform vector search', async () => {
    ragPipeline.ingestDocument('doc1', 'JARVIS-X is an autonomous AI assistant powered by multi-provider LLMs.');
    const results = await ragPipeline.search('autonomous AI');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.citation.source).toBe('Doc-doc1');
  });

  it('AIEngine chat should generate structured LLM response', async () => {
    const response = await aiEngine.chat([
      { role: 'system', content: 'You are an AI assistant.' },
      { role: 'user', content: 'Hello JARVIS-X' },
    ]);

    expect(response.content).toBeTruthy();
    expect(response.provider).toBeTruthy();
  });

  it('AIEngine executeAutonomousGoal should plan and run tools', async () => {
    const result = await aiEngine.executeAutonomousGoal('Run system diagnostics');
    expect(result).toContain('Plan execution finished');
  });
});
