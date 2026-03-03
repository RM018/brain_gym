import { BrainMoveScoring } from './cognitiveModels';
import type { BrainMoveProfile } from './cognitiveModels';
import { PerformanceMonitor } from './gameLoop';

export interface ModuleScore {
  rawScore: number;
  normalizedScore: number;
  subscores: Record<string, number>;
  timestamp: Date;
}

// Helper config for memory difficulty
const difficultyConfig = {
  easy: { pairs: 6, time: 120 },
  medium: { pairs: 8, time: 180 },
  hard: { pairs: 12, time: 240 },
};

export class ScoringEngine {
  // Calculate CMI Module Score
  calculateCMIScore(monitor: PerformanceMonitor): ModuleScore {
    const accuracy = monitor.getAccuracy();
    const processingSpeed = monitor.getProcessingSpeed();
    const avgRT = monitor.getAverageReactionTime();
    const errorRate = monitor.getErrorRate();

    // Weighted scoring
    const rawScore = accuracy * 0.4 + processingSpeed * 0.3 + (100 - errorRate) * 0.3;

    return {
      rawScore,
      normalizedScore: Math.min(100, Math.max(0, rawScore)),
      subscores: {
        accuracy,
        processingSpeed,
        reactionTime: Math.max(0, 100 - avgRT / 5),
        motorControl: accuracy,
        focusStability: 100 - monitor.getCognitiveFatigue(),
      },
      timestamp: new Date(),
    };
  }

  // Calculate adaptive score based on user history
  calculateAdaptiveScore(monitor: PerformanceMonitor, userHistory: any[]): ModuleScore {
    const currentScore = this.calculateCMIScore(monitor);
    
    // Adjust based on user's historical performance
    if (userHistory.length > 0) {
      const avgHistoricalScore = userHistory.reduce((sum, h) => sum + (h.score || 0), 0) / userHistory.length;
      const improvement = currentScore.normalizedScore - avgHistoricalScore;
      
      currentScore.subscores.improvementRate = Math.max(0, improvement);
      currentScore.normalizedScore = Math.min(100, 
        currentScore.normalizedScore + (improvement * 0.1)
      );
    }
    
    return currentScore;
  }

  // Detect cognitive fatigue from performance history
  detectCognitiveFatigue(performanceHistory: number[]): number {
    if (performanceHistory.length < 10) return 0;
    
    const recent = performanceHistory.slice(-5);
    const baseline = performanceHistory.slice(0, 5);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const baselineAvg = baseline.reduce((a, b) => a + b, 0) / baseline.length;
    
    const fatigueLevel = Math.max(0, (baselineAvg - recentAvg) / baselineAvg * 100);
    
    return Math.min(100, fatigueLevel);
  }

  // Calculate Leadership Score
  calculateLeadershipScore(
    decisions: { quality: number; speed: number; outcome: number }[],
    teamMorale: number,
    trustScore: number
  ): ModuleScore {
    if (decisions.length === 0) {
      return {
        rawScore: 0,
        normalizedScore: 0,
        subscores: {},
        timestamp: new Date(),
      };
    }

    const avgDecisionQuality =
      decisions.reduce((sum, d) => sum + d.quality, 0) / decisions.length;
    const avgDecisionSpeed = decisions.reduce((sum, d) => sum + d.speed, 0) / decisions.length;
    const avgOutcome = decisions.reduce((sum, d) => sum + d.outcome, 0) / decisions.length;

    const rawScore =
      avgDecisionQuality * 0.35 +
      teamMorale * 0.25 +
      trustScore * 0.25 +
      avgOutcome * 0.15;

    return {
      rawScore,
      normalizedScore: Math.min(100, Math.max(0, rawScore)),
      subscores: {
        decisionQuality: avgDecisionQuality,
        decisionSpeed: avgDecisionSpeed,
        teamMorale,
        trustScore,
        strategicThinking: avgOutcome,
      },
      timestamp: new Date(),
    };
  }

  // Calculate Conflict EQ Score
  calculateConflictScore(
    empathyScore: number,
    assertivenessScore: number,
    resolutionSuccess: number,
    emotionalRegulation: number
  ): ModuleScore {
    const rawScore =
      empathyScore * 0.3 +
      assertivenessScore * 0.2 +
      resolutionSuccess * 0.3 +
      emotionalRegulation * 0.2;

    return {
      rawScore,
      normalizedScore: Math.min(100, Math.max(0, rawScore)),
      subscores: {
        empathy: empathyScore,
        assertiveness: assertivenessScore,
        conflictResolution: resolutionSuccess,
        emotionalRegulation,
        negotiationSkill: (resolutionSuccess + assertivenessScore) / 2,
      },
      timestamp: new Date(),
    };
  }

  // Calculate Sensory Resilience Score
  calculateSensoryScore(
    baselinePerformance: number,
    performanceUnderLoad: number,
    adaptationRate: number
  ): ModuleScore {
    const resilienceScore = (performanceUnderLoad / Math.max(1, baselinePerformance)) * 100;
    const degradation = Math.max(0, baselinePerformance - performanceUnderLoad);

    const rawScore = resilienceScore * 0.6 + adaptationRate * 0.4;

    return {
      rawScore,
      normalizedScore: Math.min(100, Math.max(0, rawScore)),
      subscores: {
        noiseResilience: resilienceScore,
        performanceDegradation: 100 - (degradation / baselinePerformance) * 100,
        adaptationRate,
        inhibitoryControl: resilienceScore,
        stressManagement: adaptationRate,
      },
      timestamp: new Date(),
    };
  }

  // Calculate Creativity Score
  calculateCreativityScore(
    semanticDistance: number,
    divergentThinking: number,
    originalityScore: number
  ): ModuleScore {
    const rawScore = semanticDistance * 0.4 + divergentThinking * 0.3 + originalityScore * 0.3;

    return {
      rawScore,
      normalizedScore: Math.min(100, Math.max(0, rawScore)),
      subscores: {
        semanticDistance,
        divergentThinking,
        originality: originalityScore,
        associativeThinking: semanticDistance,
        conceptualFluency: divergentThinking,
      },
      timestamp: new Date(),
    };
  }

  // Memory Module Score
  calculateMemoryScore(
    pairsMatched: number,
    totalPairs: number,
    moves: number,
    time: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): ModuleScore {
    const accuracy = totalPairs > 0 ? (pairsMatched / totalPairs) * 100 : 0;
    const efficiency = totalPairs > 0
      ? Math.max(0, ((totalPairs - Math.max(0, moves - totalPairs)) / totalPairs) * 100)
      : 0;
    const timeBonus = Math.max(0, (difficultyConfig[difficulty].time - time) / difficultyConfig[difficulty].time * 100);

    const rawScore = accuracy * 0.5 + efficiency * 0.3 + timeBonus * 0.2;
    return {
      rawScore,
      normalizedScore: Math.min(100, Math.max(0, rawScore)),
      subscores: {
        accuracy,
        efficiency,
        timeBonus,
        memoryRetention: accuracy,
        focusStability: efficiency,
      },
      timestamp: new Date(),
    };
  }

  // Pattern Match Module Score (fixed unused parameter)
  calculatePatternScore(
    accuracy: number,
    speed: number,
    _difficulty: 'easy' | 'medium' | 'hard' // prefixed with underscore to indicate intentional non-use
  ): ModuleScore {
    const rawScore = accuracy * 0.7 + speed * 0.3;
    return {
      rawScore,
      normalizedScore: Math.min(100, Math.max(0, rawScore)),
      subscores: {
        accuracy,
        speed,
        patternRecognition: accuracy,
        processingSpeed: speed,
      },
      timestamp: new Date(),
    };
  }

  // Voice & Value Module Score
  calculateVoiceValueScore(
    totalScore: number,
    consistency: number,
    alignment: number
  ): ModuleScore {
    const rawScore = totalScore * 0.4 + consistency * 0.3 + alignment * 0.3;
    return {
      rawScore,
      normalizedScore: Math.min(100, Math.max(0, rawScore)),
      subscores: {
        totalScore,
        consistency,
        alignment,
        valuesAlignment: alignment,
        emotionalRegulation: consistency,
      },
      timestamp: new Date(),
    };
  }

  // Calculate Overall Brain Move Score
  calculateOverallScore(
    cmi: number,
    leadership: number,
    conflict: number,
    sensory: number,
    creativity: number
  ): number {
    return BrainMoveScoring.calculateOverallScore(cmi, leadership, conflict, sensory, creativity);
  }

  // Generate complete profile
  generateProfile(moduleScores: {
    cmi: ModuleScore;
    leadership: ModuleScore;
    conflict: ModuleScore;
    sensory: ModuleScore;
    creativity: ModuleScore;
  }): BrainMoveProfile {
    const cmiScore = moduleScores.cmi.normalizedScore;
    const leadershipScore = moduleScores.leadership.normalizedScore;
    const conflictEQScore = moduleScores.conflict.normalizedScore;
    const sensoryResilienceScore = moduleScores.sensory.normalizedScore;
    const creativityScore = moduleScores.creativity.normalizedScore;

    const overallScore = this.calculateOverallScore(
      cmiScore,
      leadershipScore,
      conflictEQScore,
      sensoryResilienceScore,
      creativityScore
    );

    const partialProfile: Partial<BrainMoveProfile> = {
      cmiScore,
      leadershipScore,
      conflictEQScore,
      sensoryResilienceScore,
      creativityScore,
    };

    const playerArchetype = BrainMoveScoring.determineArchetype(partialProfile);

    const profile: BrainMoveProfile = {
      overallScore,
      cmiScore,
      leadershipScore,
      conflictEQScore,
      sensoryResilienceScore,
      creativityScore,
      cognitiveFingerprint: '',
      playerArchetype,
      timestamp: new Date(),
    };

    profile.cognitiveFingerprint = BrainMoveScoring.generateCognitiveFingerprint(profile);

    return profile;
  }

  // Score normalization with percentile
  normalizeWithPercentile(
    rawScore: number,
    distribution: number[]
  ): { normalized: number; percentile: number } {
    const sorted = [...distribution].sort((a, b) => a - b);
    const percentileIndex = sorted.findIndex(s => s >= rawScore);
    const percentile = percentileIndex >= 0 ? (percentileIndex / sorted.length) * 100 : 100;

    return {
      normalized: Math.min(100, Math.max(0, rawScore)),
      percentile,
    };
  }
}