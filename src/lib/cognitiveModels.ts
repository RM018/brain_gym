// Cognitive Models and Scoring Systems

export interface BrainMoveProfile {
  overallScore: number;
  cmiScore: number;
  leadershipScore: number;
  conflictEQScore: number;
  sensoryResilienceScore: number;
  creativityScore: number;
  cognitiveFingerprint: string;
  playerArchetype: string;
  timestamp: Date;
}

export class BrainMoveScoring {
  // Calculate overall Brain Move score
  static calculateOverallScore(
    cmi: number,
    leadership: number,
    conflict: number,
    sensory: number,
    creativity: number
  ): number {
    return (cmi * 0.25 + leadership * 0.2 + conflict * 0.2 + sensory * 0.15 + creativity * 0.2);
  }

  // Generate cognitive fingerprint
  static generateCognitiveFingerprint(profile: BrainMoveProfile): string {
    const scores = [
      profile.cmiScore,
      profile.leadershipScore,
      profile.conflictEQScore,
      profile.sensoryResilienceScore,
      profile.creativityScore,
    ];

    return scores.map(s => Math.round(s / 10)).join('-');
  }

  // Determine player archetype
  static determineArchetype(profile: Partial<BrainMoveProfile>): string {
    const {
      cmiScore = 0,
      leadershipScore = 0,
      conflictEQScore = 0,
      creativityScore = 0,
      sensoryResilienceScore = 0,
    } = profile;

    // Find dominant trait
    const scores = {
      'Strategic Commander': leadershipScore,
      'Creative Innovator': creativityScore,
      'Empathetic Mediator': conflictEQScore,
      'Precision Operator': cmiScore,
      'Resilient Performer': sensoryResilienceScore,
    };

    const maxScore = Math.max(...Object.values(scores));
    const archetype = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];

    return archetype || 'Balanced Learner';
  }
}

export class ReactionTimeAnalyzer {
  // Calculate processing speed score
  static calculateProcessingSpeed(reactionTimes: number[]): number {
    if (reactionTimes.length === 0) return 0;

    const avgRT = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;

    // Convert to score (lower RT = higher score)
    // Assume 200ms is excellent (100), 500ms is average (50), 1000ms+ is poor (0)
    const score = Math.max(0, 100 - (avgRT - 200) / 8);
    return Math.min(100, Math.max(0, score));
  }

  // Detect cognitive fatigue
  static detectCognitiveFatigue(reactionTimes: number[]): number {
    if (reactionTimes.length < 5) return 0;

    // Compare first half to second half
    const midpoint = Math.floor(reactionTimes.length / 2);
    const firstHalf = reactionTimes.slice(0, midpoint);
    const secondHalf = reactionTimes.slice(midpoint);

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    // Fatigue = performance degradation
    const degradation = ((avgSecond - avgFirst) / avgFirst) * 100;
    return Math.max(0, degradation);
  }
}

export class CognitiveLoadCalculator {
  // Calculate cognitive load based on task complexity and performance
  static calculateLoad(
    taskComplexity: number,
    performanceScore: number,
    timeSpent: number
  ): number {
    // High complexity + low performance + long time = high load
    const complexityFactor = taskComplexity / 100;
    const performanceFactor = (100 - performanceScore) / 100;
    const timeFactor = Math.min(1, timeSpent / 60000); // Normalize to 1 minute

    return (complexityFactor * 0.4 + performanceFactor * 0.4 + timeFactor * 0.2) * 100;
  }
}

export class FlowStateDetector {
  // Calculate flow state score
  static calculateFlowScore(
    challengeLevel: number,
    skillLevel: number,
    focusLevel: number
  ): number {
    // Flow occurs when challenge and skill are balanced
    const balance = 1 - Math.abs(challengeLevel - skillLevel);
    const flowScore = balance * focusLevel * 100;

    return Math.min(100, Math.max(0, flowScore));
  }

  // Determine flow state category
  static getFlowState(challengeLevel: number, skillLevel: number): string {
    if (challengeLevel > skillLevel + 0.2) return 'Anxiety';
    if (skillLevel > challengeLevel + 0.2) return 'Boredom';
    if (challengeLevel > 0.6 && skillLevel > 0.6) return 'Flow';
    return 'Apathy';
  }
}

export class AdaptiveDifficultyEngine {
  // Recommend difficulty adjustment
  static recommendDifficulty(
    currentDifficulty: number,
    performanceHistory: number[]
  ): number {
    if (performanceHistory.length < 3) return currentDifficulty;

    const recentPerf = performanceHistory.slice(-3);
    const avgPerf = recentPerf.reduce((a, b) => a + b, 0) / recentPerf.length;

    if (avgPerf > 80) {
      return Math.min(5, currentDifficulty + 0.5);
    } else if (avgPerf < 50) {
      return Math.max(1, currentDifficulty - 0.5);
    }

    return currentDifficulty;
  }
}
