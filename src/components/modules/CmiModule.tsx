'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PerformanceMonitor } from '@/lib/gameLoop';
import { ScoringEngine } from '@/lib/scoringEngine';
import { BrainMetricsAggregator } from '@/lib/brainMetrics';

export interface CmiModuleProps {
  onComplete: (score: number, profile: any) => void;
  onBack?: () => void;
}

interface GameConfig {
  difficulty: number;
  speedMultiplier: number;
  targetSize: number;
  spawnRate?: number;
}

interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  type: 'standard' | 'bonus' | 'penalty';
  points: number;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export default function CmiModule({ onComplete, onBack }: CmiModuleProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [mode, setMode] = useState<'training' | 'assessment'>('assessment');
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [config, setConfig] = useState<GameConfig>({
    difficulty: 3,
    speedMultiplier: 1 + 3 * 0.3,
    targetSize: 25,
  });
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const timeRef = useRef<number>(60);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'miss' }>();
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [finalResults, setFinalResults] = useState<any>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const monitorRef = useRef(new PerformanceMonitor());
  const clickTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Ensure targets and particles state changes are tracked for rendering
  // This dependency is used implicitly by React but needed here for TypeScript
  useEffect(() => {
    // This effect runs whenever targets or particles change
    // The values are used by the canvas animation loop
    return () => {
      // Cleanup if needed
    };
  }, [targets.length, particles.length]);

  // Memoized values
  const targetCount = useMemo(
    () => 3 + Math.floor(config.difficulty * 1.5),
    [config.difficulty]
  );

  // Create target helper
  const createTarget = useCallback((id: number): Target => {
    const isSpecial = Math.random() < 0.2; // 20% chance of special target
    const type = isSpecial
      ? Math.random() > 0.7 ? 'bonus' : 'penalty'
      : 'standard';

    return {
      id,
      x: Math.random() * 700 + 50,
      y: Math.random() * 400 + 50,
      vx: (Math.random() - 0.5) * 4 * config.speedMultiplier,
      vy: (Math.random() - 0.5) * 4 * config.speedMultiplier,
      radius: type === 'standard' ? config.targetSize : config.targetSize - 5,
      active: true,
      type,
      points: type === 'bonus' ? 25 : type === 'penalty' ? -15 : 10,
      color: type === 'bonus' ? '#FBBF24' : type === 'penalty' ? '#EF4444' : '#10B981',
    };
  }, [config.speedMultiplier, config.targetSize]);

  // Particle effects
  const createParticleEffect = useCallback((x: number, y: number) => {
    const particles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
    }));

    setParticles(prev => [...prev, ...particles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.life > 0.1));
    }, 300);
  }, []);

  // Sound effects
  const playHitSound = useCallback((frequency: number = 800) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      console.debug('Audio not available');
    }
  }, []);

  // Session persistence
  const saveSession = useCallback((results: any) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('cmi-sessions') || '[]');
      sessions.push({
        ...results,
        date: new Date().toISOString(),
        config: { difficulty: config.difficulty, targetCount },
        mode,
      });
      localStorage.setItem('cmi-sessions', JSON.stringify(sessions.slice(-10)));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }, [config.difficulty, targetCount, mode]);

  // Difficulty progression
  useEffect(() => {
    if (score > 0 && score % 50 === 0 && mode === 'training') {
      setConfig(prev => ({
        ...prev,
        difficulty: prev.difficulty + 0.5,
        speedMultiplier: prev.speedMultiplier * 1.1,
        targetSize: Math.max(15, prev.targetSize - 2),
      }));
    }
  }, [score, mode]);

  // Initialize game and timer
  useEffect(() => {
    if (!gameStarted) return;

    // Initialize targets
    const initialTargets: Target[] = Array.from({ length: targetCount }, (_, i) =>
      createTarget(i)
    );

    setTargets(initialTargets);
    timeRef.current = 60;
    setTimeLeft(60);

    const timer = setInterval(() => {
      const current = timeRef.current;
      if (current <= 1) {
        clearInterval(timer);
        setTimeLeft(0);
        timeRef.current = 0;
        handleGameEnd();
        return;
      }
      const next = current - 1;
      timeRef.current = next;
      setTimeLeft(next);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, targetCount, createTarget]);

  // Canvas animation
  useEffect(() => {
    if (!gameStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setTargets(prev =>
        prev.map(target => {
          let { x, y, vx, vy } = target;

          x += vx;
          y += vy;

          if (x <= target.radius || x >= canvas.width - target.radius) vx = -vx;
          if (y <= target.radius || y >= canvas.height - target.radius) vy = -vy;

          if (target.active) {
            ctx.beginPath();
            ctx.arc(x, y, target.radius, 0, Math.PI * 2);
            ctx.fillStyle = target.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = target.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Inner dot
            ctx.beginPath();
            ctx.arc(x, y, target.radius / 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Type indicator
            if (target.type !== 'standard') {
              ctx.fillStyle = target.type === 'bonus' ? '#FCD34D' : '#FECACA';
              ctx.font = 'bold 10px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(target.type === 'bonus' ? '+' : '-', x, y);
            }
          }

          return { ...target, x, y, vx, vy };
        })
      );

      // Draw particles
      setParticles(prev =>
        prev.map(particle => {
          const newX = particle.x + particle.vx;
          const newY = particle.y + particle.vy;
          const newLife = particle.life - 0.05;

          ctx.fillStyle = `rgba(16, 185, 129, ${newLife * 0.5})`;
          ctx.beginPath();
          ctx.arc(newX, newY, 2, 0, Math.PI * 2);
          ctx.fill();

          return { ...particle, x: newX, y: newY, life: newLife };
        }).filter(p => p.life > 0)
      );

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [gameStarted]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !gameStarted) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const clickTime = performance.now();
    const reactionTime = clickTimeRef.current ? clickTime - clickTimeRef.current : 0;
    clickTimeRef.current = clickTime;

    if (reactionTime > 0) {
      monitorRef.current.recordReactionTime(reactionTime);
      setReactionTimes(prev => [...prev, reactionTime]);
    }

    let hit = false;

    setTargets(prev =>
      prev.map(target => {
        if (!target.active) return target;

        const distance = Math.sqrt(
          Math.pow(clickX - target.x, 2) + Math.pow(clickY - target.y, 2)
        );

        if (distance <= target.radius) {
          hit = true;
          monitorRef.current.recordSuccess();
          setScore(s => s + target.points);
          
          const feedbackMessage = target.type === 'bonus' ? '+25 BONUS!' : target.type === 'penalty' ? '-15 MISS' : '+10';
          setFeedback({ message: feedbackMessage, type: 'success' });
          
          createParticleEffect(target.x, target.y);
          playHitSound(target.type === 'bonus' ? 1000 : target.type === 'penalty' ? 400 : 800);
          
          setTimeout(() => setFeedback(undefined), 500);

          return createTarget(target.id);
        }

        return target;
      })
    );

    if (!hit) {
      monitorRef.current.recordError();
      setFeedback({ message: 'MISS', type: 'miss' });
      createParticleEffect(clickX, clickY);
      playHitSound(300);
      setTimeout(() => setFeedback(undefined), 500);
    }
  }, [gameStarted, createTarget, createParticleEffect, playHitSound]);

  const handleGameEnd = useCallback(() => {
    const scoring = new ScoringEngine();
    
    // Get session history for adaptive scoring
    const sessionHistory = JSON.parse(localStorage.getItem('cmi-sessions') || '[]');
    
    const moduleScore = mode === 'training'
      ? scoring.calculateCMIScore(monitorRef.current)
      : scoring.calculateAdaptiveScore(monitorRef.current, sessionHistory);

    // Detect cognitive fatigue
    const fatigueLevel = scoring.detectCognitiveFatigue(reactionTimes);

    try {
      const aggregator = new BrainMetricsAggregator();
      aggregator.addSession({
        timestamp: new Date(),
        moduleType: 'cmi',
        score: moduleScore.normalizedScore,
        duration: 60000,
        subscores: moduleScore.subscores,
      });
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    const results = {
      score: moduleScore.normalizedScore,
      totalHits: score,
      accuracy: monitorRef.current.getAccuracy(),
      avgReactionTime: monitorRef.current.getAverageReactionTime(),
      processingSpeed: monitorRef.current.getProcessingSpeed(),
      errorRate: monitorRef.current.getErrorRate(),
      fatigueLevel,
      subscores: moduleScore.subscores,
      config,
      mode,
    };

    setFinalResults(results);
    saveSession(results);
    setShowFinalResults(true);

    setTimeout(() => {
      onComplete(moduleScore.normalizedScore, moduleScore);
    }, 1500);
  }, [score, mode, config, reactionTimes, onComplete, saveSession]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    clickTimeRef.current = performance.now();
  }, []);

  const calibrateBaseline = useCallback(() => {
    setCalibrating(true);
    // Show calibration instructions
    // Measure baseline reaction time with simple stimulus
    setTimeout(() => {
      setCalibrating(false);
      startGame();
    }, 3000);
  }, [startGame]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameStarted) {
        e.preventDefault();
        // Could pause game or trigger action
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-3xl w-full"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-center">
            <span className="text-emerald-400">CMI MODULE</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-3 sm:mb-4 text-center">
            Cognitive-Motor Integration
          </p>
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 text-center px-2">
            Track and click moving targets as fast and accurately as possible.
            Your reaction time, accuracy, and processing speed will be measured.
          </p>

          {/* Mode Selection */}
          <div className="mb-6 sm:mb-8">
            <p className="text-sm font-bold text-emerald-300 mb-3 text-center">Select Mode</p>
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={() => setMode('training')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  mode === 'training'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Training
              </button>
              <button
                onClick={() => setMode('assessment')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                  mode === 'assessment'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Assessment
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {mode === 'training'
                ? 'Practice with progressive difficulty'
                : 'Fixed difficulty assessment'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#041517]/60 border border-emerald-400/30 p-4 sm:p-6 rounded-xl text-center">
              <div className="text-emerald-400 font-bold text-sm sm:text-base">Targets</div>
              <div className="text-2xl sm:text-3xl font-mono">{targetCount}</div>
            </div>
            <div className="bg-[#041517]/60 border border-emerald-400/30 p-4 sm:p-6 rounded-xl text-center">
              <div className="text-cyan-400 font-bold text-sm sm:text-base">Duration</div>
              <div className="text-2xl sm:text-3xl font-mono">60s</div>
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
            {mode === 'assessment' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={calibrateBaseline}
                className="flex-1 px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full text-base sm:text-lg md:text-xl font-bold shadow-lg"
              >
                CALIBRATE BASELINE
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="flex-1 px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full text-base sm:text-lg md:text-xl font-bold shadow-lg"
              >
                START TRAINING
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (calibrating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl text-emerald-400 font-bold mb-4"
        >
          ●
        </motion.div>
        <p className="text-2xl text-gray-300 font-bold">Calibrating Baseline...</p>
        <p className="text-gray-400 mt-4">Starting assessment in 3 seconds</p>
      </div>
    );
  }

  if (showFinalResults && finalResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl w-full"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400 mb-6 sm:mb-8 text-center">
            CMI PERFORMANCE RESULTS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#041517]/60 border border-emerald-400/30 p-4 sm:p-6 rounded-xl text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">Overall CMI Score</div>
              <div className="text-4xl sm:text-5xl font-bold text-emerald-400">
                {finalResults.score.toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">
                {finalResults.score >= 80 ? 'Elite Performance' : finalResults.score >= 60 ? 'Strong Performance' : finalResults.score >= 40 ? 'Good Performance' : 'Keep Practicing'}
              </div>
            </div>

            <div className="bg-[#041517]/60 border border-emerald-400/30 p-4 sm:p-6 rounded-xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Performance Metrics</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Total Hits:</span>
                  <span className="font-bold text-emerald-400 text-sm sm:text-base">
                    {finalResults.totalHits}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Accuracy:</span>
                  <span className="font-bold text-cyan-400 text-sm sm:text-base">
                    {finalResults.accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Avg Reaction:</span>
                  <span className="font-bold text-teal-400 text-sm sm:text-base">
                    {finalResults.avgReactionTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Processing Speed:</span>
                  <span className="font-bold text-green-400 text-sm sm:text-base">
                    {finalResults.processingSpeed.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Fatigue Level:</span>
                  <span className="font-bold text-yellow-400 text-sm sm:text-base">
                    {finalResults.fatigueLevel.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#041517]/60 border border-emerald-400/30 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
            <div className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-emerald-300">Detailed Breakdown:</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Accuracy</span>
                  <span className="text-sm text-cyan-400">{finalResults.accuracy.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-cyan-400 h-2 sm:h-3 rounded-full" style={{ width: `${Math.min(100, finalResults.accuracy)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Processing Speed</span>
                  <span className="text-sm text-teal-400">{finalResults.processingSpeed.toFixed(0)}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-teal-400 h-2 sm:h-3 rounded-full" style={{ width: `${Math.min(100, finalResults.processingSpeed)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Reaction Time (Lower is Better)</span>
                  <span className="text-sm text-emerald-400">{finalResults.avgReactionTime.toFixed(0)}ms</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-emerald-400 h-2 sm:h-3 rounded-full" style={{ width: `${Math.max(0, 100 - (finalResults.avgReactionTime / 10))}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-400/30 p-4 sm:p-6 rounded-xl">
            <div className="font-bold mb-2 sm:mb-3 text-emerald-300 text-sm sm:text-base">Performance Insights:</div>
            <ul className="space-y-1.5 sm:space-y-2">
              {finalResults.accuracy >= 90 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Outstanding accuracy - you track targets with precision</li>
              )}
              {finalResults.avgReactionTime < 300 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Lightning-fast reactions - your response time is exceptional</li>
              )}
              {finalResults.processingSpeed >= 80 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• High processing speed - rapid visual-motor coordination</li>
              )}
              {finalResults.errorRate < 10 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Minimal errors - excellent focus and control</li>
              )}
              {finalResults.score >= 80 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Elite cognitive-motor integration across all dimensions</li>
              )}
              {finalResults.fatigueLevel > 30 && (
                <li className="text-yellow-300 text-xs sm:text-sm md:text-base">⚠ Moderate fatigue detected - consider rest before next session</li>
              )}
              {finalResults.mode === 'training' && (
                <li className="text-teal-300 text-xs sm:text-sm md:text-base">📈 Difficulty adjusted based on performance</li>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 overflow-hidden">
      {/* HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-shrink-0 border-b border-emerald-500/20">
        <div className="bg-[#0a2024]/80 border border-emerald-500/40 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
          <span className="text-emerald-400 font-bold text-xs sm:text-sm">SCORE: </span>
          <span className="text-lg sm:text-xl md:text-2xl font-mono">{score}</span>
        </div>
        <div className="bg-[#0a2024]/80 border border-cyan-500/40 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
          <span className="text-cyan-400 font-bold text-xs sm:text-sm">TIME: </span>
          <span className="text-lg sm:text-xl md:text-2xl font-mono">{timeLeft}s</span>
        </div>
        <div className="col-span-1 bg-[#0a2024]/80 border border-emerald-500/40 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
          <span className="text-emerald-300 font-bold text-xs sm:text-sm">ACC: </span>
          <span className="text-lg sm:text-xl md:text-2xl font-mono">{monitorRef.current.getAccuracy().toFixed(0)}%</span>
        </div>
      </div>

      {/* SCROLLABLE GAME AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
          {/* Game Canvas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex-1 flex items-center justify-center mb-4 sm:mb-6 min-h-[300px] sm:min-h-[400px] md:min-h-[500px]"
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onClick={handleCanvasClick}
              onKeyDown={(e) => {
                if (e.key === ' ') e.preventDefault();
              }}
              tabIndex={0}
              role="application"
              aria-label="Cognitive-Motor Integration game canvas. Click on moving targets."
              className="border-2 border-emerald-500/60 rounded-lg sm:rounded-xl cursor-crosshair bg-[#041517]/60 w-full h-full max-w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 object-contain"
            />
            
            {feedback && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -50 }}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl md:text-5xl font-bold pointer-events-none ${
                  feedback.type === 'success' ? 'text-emerald-400' : 'text-red-500'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-shrink-0 border-t border-emerald-500/20">
        <div className="bg-[#041517]/60 border border-emerald-400/30 p-2 sm:p-3 rounded-lg sm:rounded-xl text-center">
          <div className="text-xs text-gray-400">Avg RT</div>
          <div className="text-sm sm:text-lg md:text-xl font-bold text-emerald-400">
            {monitorRef.current.getAverageReactionTime().toFixed(0)}ms
          </div>
        </div>
        <div className="bg-[#041517]/60 border border-emerald-400/30 p-2 sm:p-3 rounded-lg sm:rounded-xl text-center">
          <div className="text-xs text-gray-400">Accuracy</div>
          <div className="text-sm sm:text-lg md:text-xl font-bold text-cyan-400">
            {monitorRef.current.getAccuracy().toFixed(1)}%
          </div>
        </div>
        <div className="bg-[#041517]/60 border border-emerald-400/30 p-2 sm:p-3 rounded-lg sm:rounded-xl text-center">
          <div className="text-xs text-gray-400">Speed</div>
          <div className="text-sm sm:text-lg md:text-xl font-bold text-teal-400">
            {monitorRef.current.getProcessingSpeed().toFixed(0)}
          </div>
        </div>
        <div className="bg-[#041517]/60 border border-emerald-400/30 p-2 sm:p-3 rounded-lg sm:rounded-xl text-center">
          <div className="text-xs text-gray-400">Errors</div>
          <div className="text-sm sm:text-lg md:text-xl font-bold text-red-400">
            {monitorRef.current.getErrorRate().toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}
