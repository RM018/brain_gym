// Brain Metrics Aggregator - Track and analyze training performance

export interface SessionData {
  timestamp: Date;
  moduleType:
    | "cmi"
    | "leadership"
    | "conflict"
    | "sensory"
    | "voicevalue"
    | "creativity"
    | "memory"
    | "pattern";
    
  score: number;
  duration: number;
  subscores?: Record<string, number>;
}

export interface PerformanceTrend {
  date: Date;
  score: number;
  moduleType: string;
}

export interface StressToleranceProfile {
  baselinePerformance: number;
  performanceUnderStress: number;
  stressResilience: number;
  recoveryRate: number;
}

export class BrainMetricsAggregator {
  private sessions: SessionData[] = [];
  private storageKey: string;

  constructor(userId: string = 'default-user') {
    this.storageKey = `brain_gym_metrics_${userId}`;
    this.loadFromStorage();
  }

  // Add a new session
  addSession(session: SessionData): void {
    this.sessions.push(session);
    this.saveToStorage();
  }

  // Get all sessions
  getSessions(): SessionData[] {
    return [...this.sessions];
  }

  // Get sessions by module type
  getSessionsByModule(moduleType: string): SessionData[] {
    return this.sessions.filter((s) => s.moduleType === moduleType);
  }

  // Calculate average scores per module (rounded to 2 decimal places)
  getAverageScores(): Record<string, number> {
    const modules = [
      "cmi",
      "leadership",
      "conflict",
      "sensory",
      "creativity",
      "memory",
      "pattern",
    ];
    const averages: Record<string, number> = {};

    modules.forEach((module) => {
      const moduleSessions = this.getSessionsByModule(module);
      if (moduleSessions.length > 0) {
        const sum = moduleSessions.reduce((acc, s) => acc + s.score, 0);
        averages[module] = Math.round((sum / moduleSessions.length) * 100) / 100;
      } else {
        averages[module] = 0;
      }
    });

    return averages;
  }

  // Get performance trend over time
  getPerformanceTrend(): PerformanceTrend[] {
    return this.sessions.map((s) => ({
      date: s.timestamp,
      score: s.score,
      moduleType: s.moduleType,
    }));
  }

  // Calculate improvement rate (rounded to 2 decimal places)
  getImprovementRate(): number {
    if (this.sessions.length < 2) return 0;

    const firstSession = this.sessions[0];
    const lastSession = this.sessions[this.sessions.length - 1];

    const improvement =
      ((lastSession.score - firstSession.score) / firstSession.score) * 100;
    return Math.round(improvement * 100) / 100;
  }

  // Get stress tolerance profile (rounded to 2 decimal places)
  getStressToleranceProfile(): StressToleranceProfile {
    const normalSessions = this.sessions.filter(
      (s) => s.moduleType !== "sensory" && s.score > 0,
    );
    const stressSessions = this.getSessionsByModule("sensory");

    const baselinePerformance =
      normalSessions.length > 0
        ? Math.round((normalSessions.reduce((sum, s) => sum + s.score, 0) /
          normalSessions.length) * 100) / 100
        : 0;

    const performanceUnderStress =
      stressSessions.length > 0
        ? Math.round((stressSessions.reduce((sum, s) => sum + s.score, 0) /
          stressSessions.length) * 100) / 100
        : 0;

    const stressResilience =
      baselinePerformance > 0
        ? Math.round((performanceUnderStress / baselinePerformance) * 10000) / 100
        : 0;

    // Calculate recovery rate (improvement over stress sessions)
    let recoveryRate = 0;
    if (stressSessions.length > 1) {
      const firstStress = stressSessions[0].score;
      const lastStress = stressSessions[stressSessions.length - 1].score;
      recoveryRate = Math.round(((lastStress - firstStress) / firstStress) * 10000) / 100;
    }

    return {
      baselinePerformance,
      performanceUnderStress,
      stressResilience,
      recoveryRate,
    };
  }

  // Generate report data
  generateReportData(): {
    totalSessions: number;
    averageScores: Record<string, number>;
    improvementRate: number;
    performanceTrend: PerformanceTrend[];
    stressProfile: StressToleranceProfile;
  } {
    return {
      totalSessions: this.sessions.length,
      averageScores: this.getAverageScores(),
      improvementRate: this.getImprovementRate(),
      performanceTrend: this.getPerformanceTrend(),
      stressProfile: this.getStressToleranceProfile(),
    };
  }

  // Export data as JSON
  exportJSON(): string {
    return JSON.stringify(this.generateReportData(), null, 2);
  }

  // Clear all data
  clearData(): void {
    this.sessions = [];
    this.saveToStorage();
  }

  // Save to localStorage
  private saveToStorage(): void {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(this.sessions));
      }
    } catch (error) {
      console.error("Failed to save metrics to storage:", error);
    }
  }

  // Load from localStorage
  loadFromStorage(): void {
    try {
      if (typeof window !== "undefined") {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
          const parsed = JSON.parse(data);
          // Convert timestamp strings back to Date objects
          this.sessions = parsed.map((s: any) => ({
            ...s,
            timestamp: new Date(s.timestamp),
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load metrics from storage:", error);
      this.sessions = [];
    }
  }
}
