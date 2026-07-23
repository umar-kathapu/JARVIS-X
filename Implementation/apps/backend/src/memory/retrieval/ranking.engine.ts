export class RankingEngine {
  calculateSemanticSim(query: string, content: string): number {
    const qWords = new Set(query.toLowerCase().split(/\s+/));
    const cWords = content.toLowerCase().split(/\s+/);
    let match = 0;
    for (const w of cWords) {
      if (qWords.has(w)) match++;
    }
    return Math.min(1.0, match / (qWords.size || 1));
  }

  calculateKeywordMatch(query: string, content: string): number {
    return query && content.toLowerCase().includes(query.toLowerCase()) ? 1.0 : 0.2;
  }

  calculateRecencyScore(createdAtIso: string): number {
    const created = new Date(createdAtIso).getTime();
    const now = Date.now();
    const ageHours = (now - created) / (1000 * 3600);
    // Exponential decay curve for recency
    return Math.exp(-0.01 * ageHours);
  }
}

export const rankingEngine = new RankingEngine();
