import { ReactionTimeAnalyzer, FlowStateDetector } from './cognitiveModels';

export interface GameLoopState {
  isRunning: boolean;
  currentTime: number;
  deltaTime: number;
  frameCount: number;
  fps: number;
}

export type GameLoopCallback = (state: GameLoopState) => void;

export class GameLoop {
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private startTime: number = 0;
  private frameCount: number = 0;
  private callbacks: GameLoopCallback[] = [];
  private isRunning: boolean = false;

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.frameCount = 0;

    this.loop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.frameCount++;

    const state: GameLoopState = {
      isRunning: this.isRunning,
      currentTime: currentTime - this.startTime,
      deltaTime,
      frameCount: this.frameCount,
      fps: 1000 / deltaTime,
    };

    this.callbacks.forEach(callback => callback(state));

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  onUpdate(callback: GameLoopCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  getState(): GameLoopState {
    return {
      isRunning: this.isRunning,
      currentTime: performance.now() - this.startTime,
      deltaTime: 0,
      frameCount: this.frameCount,
      fps: 60,
    };
  }
}

// Adaptive Difficulty System
export class AdaptiveDifficultySystem {
  private performanceHistory: number[] = [];
  private currentDifficulty: number = 3; // 1-5
  private adjustmentThreshold: number = 5; // number of samples before adjustment

  updatePerformance(score: number): void {
    this.performanceHistory.push(score);

    // Keep only recent history
    if (this.performanceHistory.length > 20) {
      this.performanceHistory.shift();
    }

    // Adjust difficulty if enough data
    if (this.performanceHistory.length >= this.adjustmentThreshold) {
      this.adjustDifficulty();
    }
  }

  private adjustDifficulty(): void {
    const recentPerformance = this.performanceHistory.slice(-this.adjustmentThreshold);
    const avgPerformance = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length;

    // Increase difficulty if performing well
    if (avgPerformance > 80 && this.currentDifficulty < 5) {
      this.currentDifficulty = Math.min(5, this.currentDifficulty + 0.5);
    }
    // Decrease if struggling
    else if (avgPerformance < 50 && this.currentDifficulty > 1) {
      this.currentDifficulty = Math.max(1, this.currentDifficulty - 0.5);
    }
  }

  getDifficulty(): number {
    return Math.round(this.currentDifficulty);
  }

  getDifficultyMultiplier(): number {
    return 0.5 + (this.currentDifficulty / 5) * 0.5; // 0.5 to 1.0
  }

  reset(): void {
    this.performanceHistory = [];
    this.currentDifficulty = 3;
  }
}

// Challenge Generator
export class ChallengeGenerator {
  generateCMIChallenge(difficulty: number): {
    targetCount: number;
    speed: number;
    duration: number;
    distractions: number;
  } {
    return {
      targetCount: 3 + Math.floor(difficulty * 1.5),
      speed: 1 + difficulty * 0.3,
      duration: 60000 - difficulty * 5000,
      distractions: Math.floor(difficulty * 2),
    };
  }

  generateLeadershipScenario(difficulty: number): {
    agentCount: number;
    conflictLevel: number;
    timeConstraint: number;
    complexityScore: number;
  } {
    return {
      agentCount: 5 + Math.floor(difficulty * 0.6),
      conflictLevel: difficulty * 20,
      timeConstraint: 120 - difficulty * 15,
      complexityScore: difficulty * 20,
    };
  }

  generateConflictScenario(difficulty: number): {
    emotionalIntensity: number;
    stakeholders: number;
    ethicalDilemma: boolean;
  } {
    return {
      emotionalIntensity: difficulty * 20,
      stakeholders: 2 + Math.floor(difficulty * 0.4),
      ethicalDilemma: difficulty > 3,
    };
  }

  generateSensoryChallenge(difficulty: number): {
    noiseLevel: number;
    distractionFrequency: number;
    duration: number;
  } {
    return {
      noiseLevel: difficulty * 20,
      distractionFrequency: 1000 / difficulty,
      duration: 45000,
    };
  }
}

// Performance Monitor
export class PerformanceMonitor {
  private samples: number[] = [];
  private reactionTimes: number[] = [];
  private errors: number = 0;
  private successes: number = 0;

  recordReactionTime(time: number): void {
    this.reactionTimes.push(time);
  }

  recordSuccess(): void {
    this.successes++;
  }

  recordError(): void {
    this.errors++;
  }

  recordSample(value: number): void {
    this.samples.push(value);
  }

  getAccuracy(): number {
    const total = this.successes + this.errors;
    if (total === 0) return 100;
    return (this.successes / total) * 100;
  }

  getAverageReactionTime(): number {
    if (this.reactionTimes.length === 0) return 0;
    return this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
  }

  getProcessingSpeed(): number {
    return ReactionTimeAnalyzer.calculateProcessingSpeed(this.reactionTimes);
  }

  getCognitiveFatigue(): number {
    return ReactionTimeAnalyzer.detectCognitiveFatigue(this.reactionTimes);
  }

  getErrorRate(): number {
    const total = this.successes + this.errors;
    if (total === 0) return 0;
    return (this.errors / total) * 100;
  }

  getFlowState(challengeLevel: number, skillLevel: number): number {
    const focusLevel = Math.min(100, this.getAccuracy()) / 100;
    return FlowStateDetector.calculateFlowScore(challengeLevel / 100, skillLevel / 100, focusLevel);
  }

  getSummary(): {
    accuracy: number;
    averageRT: number;
    processingSpeed: number;
    cognitiveFatigue: number;
    errorRate: number;
  } {
    return {
      accuracy: this.getAccuracy(),
      averageRT: this.getAverageReactionTime(),
      processingSpeed: this.getProcessingSpeed(),
      cognitiveFatigue: this.getCognitiveFatigue(),
      errorRate: this.getErrorRate(),
    };
  }

  reset(): void {
    this.samples = [];
    this.reactionTimes = [];
    this.errors = 0;
    this.successes = 0;
  }
}
