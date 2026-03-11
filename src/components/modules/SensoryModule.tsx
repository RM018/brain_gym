'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Zap, Target } from 'lucide-react';
import { ScoringEngine } from '@/lib/scoringEngine';
import { BrainMetricsAggregator } from '@/lib/brainMetrics';
import { useUser } from '@/lib/userContext';

export interface SensoryModuleProps {
  onComplete: (score: number, profile: any) => void;
  onBack?: () => void;
}

interface Target {
  id: number;
  x: number;
  y: number;
  type: 'correct' | 'distractor';
  size: number;
  isVisible: boolean;
  spawnTime: number;
  value: number;
  color: string;
}

interface GameStats {
  correct: number;
  total: number;
  reactionTimes: number[];
  misses: number;
}

export default function SensoryModule({ onComplete, onBack }: SensoryModuleProps) {
  const { currentUser } = useUser();
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [phase, setPhase] = useState<'baseline' | 'loaded'>('baseline');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [stressLevel, setStressLevel] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [currentTargetValue, setCurrentTargetValue] = useState<number | null>(null);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [finalResults, setFinalResults] = useState<any>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statsRef = useRef<{ baseline: GameStats; loaded: GameStats }>({
    baseline: { correct: 0, total: 0, reactionTimes: [], misses: 0 },
    loaded: { correct: 0, total: 0, reactionTimes: [], misses: 0 },
  });

  const difficultyMap = { easy: 1, medium: 2, hard: 3 };
  const difficultyLevel = difficulty ? difficultyMap[difficulty] : 2;

  const gameConfig = {
    baseline: {
      spawnInterval: 1500 - (difficultyLevel * 100),
      targetDuration: 2000,
      targetSize: 100 - (difficultyLevel * 10),
      distractorRatio: 0.2 + (difficultyLevel * 0.1),
    },
    loaded: {
      spawnInterval: 1200 - (difficultyLevel * 100),
      targetDuration: 1800,
      targetSize: 90 - (difficultyLevel * 10),
      distractorRatio: 0.3 + (difficultyLevel * 0.15),
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const clearTimers = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
  };

  const startPhase = (phaseName: 'baseline' | 'loaded', diffLevel?: 'easy' | 'medium' | 'hard') => {
    const actualDiffLevel = diffLevel || difficulty;
    
    setPhase(phaseName);
    setTargets([]);
    setScore(0);
    setTimeLeft(30);
    setCurrentTargetValue(null);
    setGameActive(true);

    if (phaseName === 'loaded' && actualDiffLevel) {
      const difficultyMultiplier = { easy: 1, medium: 2, hard: 3 }[actualDiffLevel];
      const loadLevel = 20 + difficultyMultiplier * 15;
      setStressLevel(loadLevel);
    } else {
      setStressLevel(0);
    }

    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endPhase(phaseName);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    startSpawningTargets(phaseName);
  };

  const startSpawningTargets = (phaseName: 'baseline' | 'loaded') => {
    const config = gameConfig[phaseName];
    
    spawnTimerRef.current = setInterval(() => {
      spawnTarget(phaseName);
    }, config.spawnInterval);
  };

  const spawnTarget = (phaseName: 'baseline' | 'loaded') => {
    if (!gameAreaRef.current) return;

    const config = gameConfig[phaseName];
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    
    const isDistractor = Math.random() < config.distractorRatio;
    const targetValue = Math.floor(Math.random() * 9) + 1;
    
    const newTarget: Target = {
      id: Date.now() + Math.random(),
      x: Math.random() * (gameArea.width - config.targetSize - 40) + 20,
      y: Math.random() * (gameArea.height - config.targetSize - 40) + 20,
      type: isDistractor ? 'distractor' : 'correct',
      size: config.targetSize,
      isVisible: true,
      spawnTime: Date.now(),
      value: targetValue,
      color: isDistractor ? '#EF4444' : '#10B981',
    };

    setTargets(prev => [...prev, newTarget]);

    if (!isDistractor) {
      setCurrentTargetValue(targetValue);
    }

    setTimeout(() => {
      setTargets(prev => {
        const updated = prev.map(t => 
          t.id === newTarget.id ? { ...t, isVisible: false } : t
        );
        
        if (newTarget.type === 'correct' && updated.find(t => t.id === newTarget.id)?.isVisible === false) {
          const stats = statsRef.current[phaseName];
          statsRef.current[phaseName] = {
            ...stats,
            misses: stats.misses + 1,
            total: stats.total + 1,
          };
        }
        
        return updated;
      });
    }, config.targetDuration);
  };

  const handleTargetClick = (target: Target) => {
    if (!gameActive || !target.isVisible) return;

    const reactionTime = Date.now() - target.spawnTime;
    const stats = statsRef.current[phase];

    if (target.type === 'correct') {
      const timeBonus = Math.max(0, 1000 - reactionTime);
      const scoreToAdd = 100 + Math.floor(timeBonus / 10);
      
      setScore(prev => prev + scoreToAdd);
      
      statsRef.current[phase] = {
        ...stats,
        correct: stats.correct + 1,
        total: stats.total + 1,
        reactionTimes: [...stats.reactionTimes, reactionTime],
      };

      setCurrentTargetValue(null);
    } else {
      setScore(prev => Math.max(0, prev - 50));
      statsRef.current[phase] = {
        ...stats,
        total: stats.total + 1,
      };
    }

    setTargets(prev => prev.map(t => 
      t.id === target.id ? { ...t, isVisible: false } : t
    ));
  };

  const endPhase = (phaseName: 'baseline' | 'loaded') => {
    clearTimers();
    setGameActive(false);

    if (phaseName === 'baseline') {
      setTimeout(() => {
        startPhase('loaded');
      }, 2000);
    } else {
      const baselineStats = statsRef.current.baseline;
      const loadedStats = statsRef.current.loaded;
      
      const baselinePerformance = baselineStats.total > 0 
        ? (baselineStats.correct / baselineStats.total) * 100 
        : 0;
      
      const loadedPerformance = loadedStats.total > 0 
        ? (loadedStats.correct / loadedStats.total) * 100 
        : 0;
      
      const baselineRT = baselineStats.reactionTimes.length > 0
        ? baselineStats.reactionTimes.reduce((a, b) => a + b, 0) / baselineStats.reactionTimes.length
        : 0;
      
      const loadedRT = loadedStats.reactionTimes.length > 0
        ? loadedStats.reactionTimes.reduce((a, b) => a + b, 0) / loadedStats.reactionTimes.length
        : 0;

      const adaptationRate = baselinePerformance > 0
        ? (loadedPerformance / baselinePerformance) * 100
        : 100;

      const scoring = new ScoringEngine();
      const moduleScore = scoring.calculateSensoryScore(
        baselinePerformance,
        loadedPerformance,
        adaptationRate
      );

      try {
        const aggregator = new BrainMetricsAggregator(currentUser.id);
        aggregator.addSession({
          timestamp: new Date(),
          moduleType: 'sensory',
          score: moduleScore.normalizedScore,
          duration: performance.now() - gameStartTime,
          subscores: moduleScore.subscores,
        });
        // Dispatch event to notify Progress component
        window.dispatchEvent(new CustomEvent('sessions-updated', { detail: { userId: currentUser.id } }));
      } catch (e) {
        console.error('Failed to save session:', e);
      }

      setFinalResults({
        score: moduleScore.normalizedScore,
        baselinePerformance,
        loadedPerformance,
        adaptationRate,
        baselineRT,
        loadedRT,
        baselineStats,
        loadedStats,
        subscores: moduleScore.subscores
      });
      setShowFinalResults(true);

      setTimeout(() => {
        onComplete(moduleScore.normalizedScore, moduleScore);
      }, 1500);
    }
  };

  const getAverageReactionTime = () => {
    const stats = statsRef.current[phase];
    if (stats.reactionTimes.length === 0) return 0;
    return stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length;
  };

  const getAccuracy = () => {
    const stats = statsRef.current[phase];
    if (stats.total === 0) return 0;
    return (stats.correct / stats.total) * 100;
  };

  // Difficulty Selection Screen
  if (!difficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-orange-900/40 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a2024]/80 border border-orange-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-3xl w-full"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-center">
            <span className="text-orange-400">STRESS RESILIENCE</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 text-center">
            Select Difficulty Level
          </p>

          <div className="bg-[#041517]/60 border border-orange-400/20 p-6 sm:p-8 rounded-xl sm:rounded-2xl mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDifficulty(level);
                    setGameStartTime(performance.now());
                    setGameStarted(true);
                    startPhase('baseline', level);
                  }}
                  className="p-4 sm:p-6 bg-gradient-to-br from-orange-600 to-orange-800 border border-orange-400/50 rounded-lg hover:border-orange-300 transition-all font-semibold text-white text-lg capitalize"
                >
                  <div className="text-3xl sm:text-4xl mb-2">
                    {level === 'easy' && <Eye className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />}
                    {level === 'medium' && <Zap className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />}
                    {level === 'hard' && <Target className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />}
                  </div>
                  {level}
                  <div className="text-xs text-orange-300 mt-2">
                    {level === 'easy' && 'Baseline focus'}
                    {level === 'medium' && 'Moderate load'}
                    {level === 'hard' && 'High stress'}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <p className="text-sm sm:text-base text-gray-400 text-center">
            Baseline phase (30s) → Stress phase (30s)
          </p>
        </motion.div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-orange-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a2024]/80 border border-orange-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-3xl w-full"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-center">
            <span className="text-orange-400">STRESS RESILIENCE</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-3 sm:mb-4 text-center">
            Sensory Load & Visual Stress
          </p>
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 text-center px-2">
            Click numbered targets while avoiding distractors. First establish a baseline, then perform under visual stress.
          </p>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#041517]/60 border border-emerald-400/30 p-4 sm:p-6 rounded-xl text-center">
              <div className="text-emerald-400 font-bold mb-2 text-sm sm:text-base">✓ TARGETS</div>
              <div className="text-xs sm:text-sm text-gray-400">Click matching green numbers</div>
            </div>
            <div className="bg-[#041517]/60 border border-red-400/30 p-4 sm:p-6 rounded-xl text-center">
              <div className="text-red-400 font-bold mb-2 text-sm sm:text-base">✗ DISTRACTORS</div>
              <div className="text-xs sm:text-sm text-gray-400">Avoid red numbers</div>
            </div>
          </div>

          <div className="bg-[#041517]/60 border border-yellow-400/30 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <div className="text-yellow-400 font-bold mb-2 text-sm sm:text-base">⚠️ TWO PHASES</div>
            <div className="text-xs sm:text-sm text-gray-400">
              Phase 1: Baseline performance (30s) → Phase 2: Under stress (30s)
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-base sm:text-lg font-bold"
              >
                Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGameStarted(true)}
              className="flex-1 px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full text-base sm:text-lg md:text-xl font-bold shadow-lg"
            >
              START MODULE
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showFinalResults && finalResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-orange-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a2024]/80 border border-orange-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl w-full"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400 mb-6 sm:mb-8 text-center">
            STRESS RESILIENCE RESULTS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#041517]/60 border border-orange-400/30 p-4 sm:p-6 rounded-xl text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">Overall Resilience Score</div>
              <div className="text-4xl sm:text-5xl font-bold text-orange-400">
                {finalResults.score.toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">
                {finalResults.adaptationRate >= 90 ? 'Exceptional Resilience' : finalResults.adaptationRate >= 75 ? 'Strong Resilience' : finalResults.adaptationRate >= 60 ? 'Good Resilience' : 'Developing Resilience'}
              </div>
            </div>

            <div className="bg-[#041517]/60 border border-orange-400/30 p-4 sm:p-6 rounded-xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Performance Metrics</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Baseline:</span>
                  <span className="font-bold text-emerald-400 text-sm sm:text-base">
                    {finalResults.baselinePerformance.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Under Stress:</span>
                  <span className="font-bold text-orange-400 text-sm sm:text-base">
                    {finalResults.loadedPerformance.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Adaptation:</span>
                  <span className="font-bold text-yellow-400 text-sm sm:text-base">
                    {finalResults.adaptationRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#041517]/60 border border-orange-400/30 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
            <div className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-orange-300">Phase Comparison:</div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Baseline Performance</span>
                  <span className="text-sm text-emerald-400">{finalResults.baselinePerformance.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-emerald-400 h-2 sm:h-3 rounded-full" style={{ width: `${finalResults.baselinePerformance}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Hits: {finalResults.baselineStats.correct}/{finalResults.baselineStats.total} | Avg RT: {finalResults.baselineRT.toFixed(0)}ms
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Stress Performance</span>
                  <span className="text-sm text-orange-400">{finalResults.loadedPerformance.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-orange-400 h-2 sm:h-3 rounded-full" style={{ width: `${finalResults.loadedPerformance}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Hits: {finalResults.loadedStats.correct}/{finalResults.loadedStats.total} | Avg RT: {finalResults.loadedRT.toFixed(0)}ms
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Adaptation Rate</span>
                  <span className="text-sm text-yellow-400">{finalResults.adaptationRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-yellow-400 h-2 sm:h-3 rounded-full" style={{ width: `${Math.min(100, finalResults.adaptationRate)}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Performance retention under stress
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-400/30 p-4 sm:p-6 rounded-xl">
            <div className="font-bold mb-2 sm:mb-3 text-emerald-300 text-sm sm:text-base">Stress Resilience Insights:</div>
            <ul className="space-y-1.5 sm:space-y-2">
              {finalResults.adaptationRate >= 90 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Outstanding stress resilience - you maintain peak performance under pressure</li>
              )}
              {finalResults.loadedPerformance >= finalResults.baselinePerformance * 0.9 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Minimal performance degradation - excellent stress management</li>
              )}
              {finalResults.baselinePerformance >= 80 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Strong baseline performance - solid foundation under normal conditions</li>
              )}
              {finalResults.loadedRT < finalResults.baselineRT * 1.2 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Maintained reaction speed under stress - excellent cognitive control</li>
              )}
              {finalResults.score >= 80 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Elite stress resilience - you thrive under challenging conditions</li>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-orange-900/40 p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-6xl">
        {/* Game Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
          <div className="bg-[#0a2024]/80 border border-orange-500/40 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg backdrop-blur-lg">
            <span className="text-orange-400 font-bold text-xs">PHASE: </span>
            <span className="text-sm sm:text-base md:text-lg font-mono uppercase">{phase}</span>
          </div>
          
          <div className="bg-[#0a2024]/80 border border-cyan-500/40 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg backdrop-blur-lg">
            <span className="text-cyan-400 font-bold text-xs">TIME: </span>
            <span className="text-sm sm:text-base md:text-lg font-mono">{timeLeft}s</span>
          </div>
          
          <div className="bg-[#0a2024]/80 border border-purple-500/40 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg backdrop-blur-lg">
            <span className="text-purple-400 font-bold text-xs">SCORE: </span>
            <span className="text-sm sm:text-base md:text-lg font-mono">{score}</span>
          </div>
          
          {phase === 'loaded' && (
            <div className="bg-[#0a2024]/80 border border-red-500/40 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg backdrop-blur-lg">
              <span className="text-red-400 font-bold text-xs">STRESS: </span>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-sm sm:text-base md:text-lg font-mono"
              >
                {stressLevel}%
              </motion.span>
            </div>
          )}
        </div>

        {/* Current Target Display */}
        <div className="bg-[#0a2024]/80 border border-orange-500/40 backdrop-blur-xl rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4 text-center">
          <div className="text-xs text-gray-400 mb-1.5">CURRENT TARGET</div>
          {currentTargetValue ? (
            <motion.div
              key={currentTargetValue}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block"
            >
              <div className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-emerald-400 font-mono">
                {currentTargetValue}
              </div>
            </motion.div>
          ) : (
            <div className="text-base sm:text-lg text-gray-500 py-2 sm:py-3">Waiting...</div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Click matching green numbers, avoid red
          </div>
        </div>

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className={`relative bg-[#041517]/60 border-2 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden mb-2 sm:mb-3 md:mb-4 transition-all duration-500 ${
            phase === 'loaded' 
              ? 'border-red-500/60 h-[250px] sm:h-[350px] md:h-[450px]' 
              : 'border-emerald-500/40 h-[250px] sm:h-[350px] md:h-[450px]'
          }`}
          style={{
            background: phase === 'loaded' 
              ? 'repeating-linear-gradient(45deg, #041517 0px, #041517 10px, #1a0a0a 10px, #1a0a0a 20px)'
              : '#041517'
          }}
        >
          <AnimatePresence>
            {targets.map(target => (
              target.isVisible && (
                <motion.div
                  key={target.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    boxShadow: [
                      `0 0 20px ${target.color}40`,
                      `0 0 40px ${target.color}80`,
                      `0 0 20px ${target.color}40`
                    ]
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.3,
                    boxShadow: {
                      repeat: Infinity,
                      duration: 2
                    }
                  }}
                  onClick={() => handleTargetClick(target)}
                  className={`absolute cursor-pointer rounded-full flex items-center justify-center font-bold transition-all duration-200 active:scale-90 select-none ${
                    target.type === 'distractor' ? 'hover:bg-red-500' : 'hover:bg-green-500'
                  }`}
                  style={{
                    left: `${target.x}px`,
                    top: `${target.y}px`,
                    width: `${target.size}px`,
                    height: `${target.size}px`,
                    backgroundColor: `${target.color}20`,
                    border: `3px solid ${target.color}`,
                    fontSize: `${target.size * 0.4}px`,
                    color: target.color,
                  }}
                >
                  {target.value}
                  {target.type === 'correct' && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      animate={{ borderColor: [target.color, '#ffffff', target.color] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  )}
                </motion.div>
              )
            ))}
          </AnimatePresence>

          {!gameActive && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center p-4"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400 mb-3 sm:mb-4">
                  {phase === 'baseline' ? 'LOADING NEXT PHASE...' : 'COMPLETE!'}
                </div>
                <div className="text-sm sm:text-base text-gray-400">
                  {phase === 'baseline' 
                    ? 'Prepare for stress load...' 
                    : 'Calculating results...'}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Stats Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
          <div className="bg-[#041517]/60 border border-orange-400/30 p-1.5 sm:p-2 md:p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">Accuracy</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-emerald-400">
              {getAccuracy().toFixed(0)}%
            </div>
          </div>
          
          <div className="bg-[#041517]/60 border border-orange-400/30 p-1.5 sm:p-2 md:p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">Reaction Time</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-cyan-400">
              {getAverageReactionTime().toFixed(0)}ms
            </div>
          </div>
          
          <div className="bg-[#041517]/60 border border-orange-400/30 p-1.5 sm:p-2 md:p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">Targets Hit</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-purple-400">
              {statsRef.current[phase].correct}
            </div>
          </div>
          
          <div className="bg-[#041517]/60 border border-orange-400/30 p-1.5 sm:p-2 md:p-3 rounded-lg text-center">
            <div className="text-xs text-gray-400">Missed</div>
            <div className="text-base sm:text-lg md:text-xl font-bold text-red-400">
              {statsRef.current[phase].misses}
            </div>
          </div>
        </div>

        {/* Phase Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>BASELINE {phase === 'baseline' ? '← ACTIVE' : '✓ COMPLETE'}</span>
            <span>LOADED {phase === 'loaded' ? '← ACTIVE' : 'PENDING'}</span>
          </div>
          <div className="bg-[#041517]/60 border border-orange-400/20 rounded-full h-1.5 sm:h-2 md:h-3 overflow-hidden">
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: phase === 'loaded' ? '100%' : '50%' }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}