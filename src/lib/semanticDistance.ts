// Semantic Distance Calculator for Divergent Association Task (DAT)

export interface WordPair {
  word1: string;
  word2: string;
  distance: number;
}

export interface DATResults {
  score: number;
  percentile: number;
  averageDistance: number;
  profile: {
    semanticDistance: number;
    divergentThinking: number;
    originalityScore: number;
    insights: string[];
  };
}

export class SemanticDistanceCalculator {
  // Simplified semantic distance calculation
  // In production, this would use word embeddings or external API
  static calculateDistance(word1: string, word2: string): number {
    word1 = word1.toLowerCase().trim();
    word2 = word2.toLowerCase().trim();

    // Same word = 0 distance
    if (word1 === word2) return 0;

    // Simple heuristic based on string similarity

    // Check for common prefixes/suffixes (related words)
    const commonPrefix = this.getCommonPrefixLength(word1, word2);
    const commonSuffix = this.getCommonSuffixLength(word1, word2);

    // Base distance (0-100 scale)
    let distance = 50;

    // Reduce distance for similar words
    if (commonPrefix > 2 || commonSuffix > 2) {
      distance -= 20;
    }

    // Add randomness for variety (in production, use actual embeddings)
    distance += Math.random() * 30;

    // Normalize to 0-100
    return Math.max(10, Math.min(100, distance));
  }

  private static getCommonPrefixLength(str1: string, str2: string): number {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return i;
  }

  private static getCommonSuffixLength(str1: string, str2: string): number {
    let i = 0;
    while (
      i < str1.length &&
      i < str2.length &&
      str1[str1.length - 1 - i] === str2[str2.length - 1 - i]
    ) {
      i++;
    }
    return i;
  }

  // Calculate all pairwise distances
  static calculateAllDistances(words: string[]): WordPair[] {
    const pairs: WordPair[] = [];

    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        pairs.push({
          word1: words[i],
          word2: words[j],
          distance: this.calculateDistance(words[i], words[j]),
        });
      }
    }

    return pairs;
  }

  // Calculate average semantic distance
  static calculateAverageDistance(words: string[]): number {
    const pairs = this.calculateAllDistances(words);
    if (pairs.length === 0) return 0;

    const sum = pairs.reduce((acc, pair) => acc + pair.distance, 0);
    return sum / pairs.length;
  }
}

export class DATEngine {
  // Validate words
  static validateWords(words: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if all 10 words are filled
    const filledWords = words.filter(w => w.trim()).length;
    if (filledWords < 10) {
      errors.push(`Please enter all 10 words (${10 - filledWords} remaining)`);
    }

    // Check for duplicates
    const uniqueWords = new Set(words.map(w => w.toLowerCase().trim()));
    if (uniqueWords.size < words.length) {
      errors.push('All words must be unique');
    }

    // Check for multi-word entries
    words.forEach((word, i) => {
      if (word.trim().includes(' ')) {
        errors.push(`Word ${i + 1} must be a single word (no spaces)`);
      }
    });

    // Check for very short words
    words.forEach((word, i) => {
      if (word.trim().length < 2) {
        errors.push(`Word ${i + 1} is too short`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Score the DAT
  static scoreDAT(words: string[]): DATResults {
    const validation = this.validateWords(words);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const avgDistance = SemanticDistanceCalculator.calculateAverageDistance(words);

    // Calculate divergent thinking score
    const divergentThinking = this.calculateDivergentThinking(words);

    // Calculate originality score
    const originalityScore = this.calculateOriginality(words);

    // Overall creativity score (weighted average)
    const score = avgDistance * 0.5 + divergentThinking * 0.3 + originalityScore * 0.2;

    // Calculate percentile (simplified)
    const percentile = this.calculatePercentile(score);

    // Generate insights
    const insights = this.generateInsights(score, avgDistance, divergentThinking, originalityScore);

    return {
      score,
      percentile,
      averageDistance: avgDistance,
      profile: {
        semanticDistance: avgDistance / 100,
        divergentThinking,
        originalityScore,
        insights,
      },
    };
  }

  private static calculateDivergentThinking(words: string[]): number {
    // Measure how spread out the words are across different categories
    const categories = this.categorizeWords(words);
    const categorySpread = Object.keys(categories).length;

    // More categories = better divergent thinking
    return Math.min(100, categorySpread * 15);
  }

  private static calculateOriginality(words: string[]): number {
    // Simple heuristic: longer, less common words score higher
    const avgLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const lengthScore = Math.min(100, avgLength * 7);

    // Add randomness to simulate uniqueness check
    const uniquenessBonus = Math.random() * 30;

    return Math.min(100, lengthScore + uniquenessBonus);
  }

  private static categorizeWords(words: string[]): Record<string, string[]> {
    // Simplified categorization (in production, use NLP/taxonomy)
    const categories: Record<string, string[]> = {
      abstract: [],
      concrete: [],
      nature: [],
      technology: [],
      emotion: [],
      action: [],
      other: [],
    };

    // Simple keyword matching
    words.forEach(word => {
      const lower = word.toLowerCase();
      if (['love', 'joy', 'fear', 'anger', 'sadness'].some(e => lower.includes(e))) {
        categories.emotion.push(word);
      } else if (['tree', 'ocean', 'mountain', 'flower', 'animal'].some(n => lower.includes(n))) {
        categories.nature.push(word);
      } else if (['computer', 'robot', 'data', 'code', 'tech'].some(t => lower.includes(t))) {
        categories.technology.push(word);
      } else if (word.length > 8) {
        categories.abstract.push(word);
      } else {
        categories.concrete.push(word);
      }
    });

    return categories;
  }

  private static calculatePercentile(score: number): number {
    // Simplified percentile calculation
    // Based on normal distribution approximation
    if (score < 40) return 10;
    if (score < 50) return 25;
    if (score < 60) return 50;
    if (score < 70) return 70;
    if (score < 80) return 85;
    return 95;
  }

  private static generateInsights(
    score: number,
    semanticDistance: number,
    divergentThinking: number,
    originality: number
  ): string[] {
    const insights: string[] = [];

    if (score > 75) {
      insights.push('Exceptional creative thinking - you excel at making unique connections');
    } else if (score > 60) {
      insights.push('Strong creative abilities - good conceptual diversity');
    } else if (score > 45) {
      insights.push('Moderate creativity - consider exploring more diverse concepts');
    } else {
      insights.push('Growing creative potential - practice thinking across different domains');
    }

    if (semanticDistance > 70) {
      insights.push('Your words span highly diverse semantic spaces');
    } else if (semanticDistance < 50) {
      insights.push('Try selecting words from more varied categories and contexts');
    }

    if (divergentThinking > 70) {
      insights.push('Excellent divergent thinking - you explore many conceptual domains');
    }

    if (originality > 70) {
      insights.push('High originality score - you think outside common patterns');
    }

    return insights;
  }
}
