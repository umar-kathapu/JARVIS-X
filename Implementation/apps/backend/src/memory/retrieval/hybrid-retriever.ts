import { MemoryRecord, MemoryRankScore } from '../types/memory.types.js';
import { rankingEngine } from './ranking.engine.js';
import { prismaMemoryStore } from '../storage/prisma-memory.store.js';

export class HybridRetriever {
  async retrieveHybrid(query: string, limit = 5): Promise<MemoryRankScore[]> {
    const records = await prismaMemoryStore.queryMemories();

    const ranked = records.map((record) => {
      // Calculate individual scores
      const semanticSimilarity = rankingEngine.calculateSemanticSim(query, record.content);
      const keywordScore = rankingEngine.calculateKeywordMatch(query, record.content);
      const recencyScore = rankingEngine.calculateRecencyScore(record.createdAt);
      const importanceScore = record.importance;

      // Composite hybrid score formula
      const finalScore =
        0.45 * semanticSimilarity +
        0.25 * keywordScore +
        0.15 * recencyScore +
        0.15 * importanceScore;

      return {
        record,
        semanticSimilarity,
        keywordScore,
        recencyScore,
        importanceScore,
        finalScore,
      };
    });

    // Sort by composite score descending and slice limit
    return ranked.sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);
  }
}

export const hybridRetriever = new HybridRetriever();
