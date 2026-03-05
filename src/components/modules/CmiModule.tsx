'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PerformanceMonitor } from '@/lib/gameLoop';
import { ScoringEngine } from '@/lib/scoringEngine';
import { BrainMetricsAggregator } from '@/lib/brainMetrics';
import { useUser } from '@/lib/userContext';

export interface CmiModuleProps {
  onComplete: (score: number, profile: any) => void;
  onBack?: () => void;
}

interface GameResults {
  score: number;
  currentLevel: number;
  finalScore: number;
  accuracy: number;
  avgReactionTime: number;
  processingSpeed: number;
  errorRate: number;
  subscores: any;
}

interface NeuroForgeGameState {
  currentLevel: number;
  score: number;
  lives: number;
  gamePhase: 'memory' | 'recall' | 'between' | 'start' | 'gameOver';
  sequence: GameSequence[];
  userInput: string[];
  timeLeft: number;
  feedback: {
    message: string;
    type: 'success' | 'error' | 'info' | '';
  };
  results?: GameResults;
}

interface GameSequence {
  pattern: number[][];
  operation: 'add' | 'subtract' | 'multiply' | 'rotate';
  result: number;
}

export default function CmiModule({ onComplete, onBack }: CmiModuleProps) {
  const { currentUser } = useUser();
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameState, setGameState] = useState<NeuroForgeGameState>({
    currentLevel: 1,
    score: 0,
    lives: 3,
    gamePhase: 'start',
    sequence: [],
    userInput: [],
    timeLeft: 30,
    feedback: { message: '', type: '' },
  });

  const [grid, setGrid] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);

  const monitorRef = useRef(new PerformanceMonitor());

  const generateSequence = useCallback((level: number): GameSequence[] => {
    const sequence: GameSequence[] = [];
    const operations: ('add' | 'subtract' | 'multiply' | 'rotate')[] = ['add', 'subtract', 'multiply', 'rotate'];

    for (let i = 0; i < Math.min(3 + Math.floor(level / 2), 8); i++) {
      const pattern: number[][] = [];
      const operation = operations[Math.floor(Math.random() * operations.length)];

      for (let r = 0; r < 2; r++) {
        const row: number[] = [];
        for (let c = 0; c < 2; c++) {
          row.push(Math.floor(Math.random() * (level + 3)) + 1);
        }
        pattern.push(row);
      }

      let result = 0;
      if (operation === 'add') {
        result = pattern.flat().reduce((a, b) => a + b, 0);
      } else if (operation === 'subtract') {
        result = pattern[0][0] - pattern[0][1] - pattern[1][0] - pattern[1][1];
      } else if (operation === 'multiply') {
        result = pattern.flat().reduce((a, b) => a * b, 1);
      } else {
        result = pattern[0][0] + pattern[1][1];
      }

      sequence.push({ pattern, operation, result });
    }

    return sequence;
  }, []);

  const startNewLevel = useCallback(() => {
    if (gameState.currentLevel === 1) {
      setGameStartTime(performance.now());
    }
    const newSequence = generateSequence(gameState.currentLevel);
    setGameState((prev) => ({
      ...prev,
      sequence: newSequence,
      gamePhase: 'memory',
      timeLeft: 15 + prev.currentLevel * 5,
      feedback: {
        message: `🎯 Level ${prev.currentLevel} - Remember the sequence!`,
        type: 'info',
      },
    }));
    setGrid(Array(3).fill(0).map(() => Array(3).fill(0)));
  }, [gameState.currentLevel, generateSequence]);

  useEffect(() => {
    if (gameState.gamePhase === 'start') {
      startNewLevel();
    }
  }, [gameState.gamePhase, startNewLevel]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (gameState.gamePhase === 'memory' && gameState.timeLeft > 0) {
      timer = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (gameState.timeLeft === 0 && gameState.gamePhase === 'memory') {
      setGameState((prev) => ({
        ...prev,
        gamePhase: 'recall',
        timeLeft: 30,
        feedback: { message: '✏️ Reproduce the sequence!', type: 'info' },
      }));
    }

    return () => clearTimeout(timer);
  }, [gameState.gamePhase, gameState.timeLeft]);

  useEffect(() => {
    if (gameState.gamePhase === 'gameOver' && gameState.results) {
      onComplete(gameState.results.finalScore, gameState.results);
    }
  }, [gameState.gamePhase, gameState.results, onComplete]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState.gamePhase !== 'recall') return;

    const newGrid = [...grid];
    newGrid[row][col] = (newGrid[row][col] + 1) % 10;
    setGrid(newGrid);
  };

  const handleOperationSelect = (operation: string) => {
    if (gameState.gamePhase !== 'recall') return;

    setGameState((prev) => ({
      ...prev,
      userInput: [...prev.userInput, operation],
    }));

    monitorRef.current.recordSuccess();

    if (gameState.userInput.length + 1 === gameState.sequence.length) {
      checkAnswer([...gameState.userInput, operation]);
    }
  };

  const checkAnswer = (userSequence: string[]) => {
    let correct = true;

    for (let i = 0; i < gameState.sequence.length; i++) {
      const expectedOp = gameState.sequence[i].operation;
      if (userSequence[i] !== expectedOp) {
        correct = false;
        break;
      }
    }

    if (correct) {
      const pointsEarned = gameState.currentLevel * 100 + gameState.timeLeft * 10;
      setGameState((prev) => ({
        ...prev,
        score: prev.score + pointsEarned,
        currentLevel: prev.currentLevel + 1,
        gamePhase: 'between',
        userInput: [],
        feedback: {
          message: `✅ Correct! +${pointsEarned} points`,
          type: 'success',
        },
      }));

      setTimeout(() => {
        startNewLevel();
      }, 2000);
    } else {
      monitorRef.current.recordError();
      setGameState((prev) => ({
        ...prev,
        lives: prev.lives - 1,
        userInput: [],
        feedback: { message: '❌ Wrong sequence! Try again.', type: 'error' },
      }));

      if (gameState.lives <= 1) {
        const scoring = new ScoringEngine();
        const sessionHistory = JSON.parse(localStorage.getItem('cmi-sessions') || '[]');
        const moduleScore = scoring.calculateAdaptiveScore(monitorRef.current, sessionHistory);

        try {
          const aggregator = new BrainMetricsAggregator(currentUser.id);
          aggregator.addSession({
            timestamp: new Date(),
            moduleType: 'cmi',
            score: moduleScore.normalizedScore,
            duration: performance.now() - gameStartTime,
            subscores: moduleScore.subscores,
          });
          // Dispatch event to notify Progress component
          window.dispatchEvent(new CustomEvent('sessions-updated', { detail: { userId: currentUser.id } }));
        } catch (e) {
          console.error('Failed to save session:', e);
        }

        const results: GameResults = {
          score: moduleScore.normalizedScore,
          currentLevel: gameState.currentLevel,
          finalScore: gameState.score + gameState.currentLevel * 100,
          accuracy: monitorRef.current.getAccuracy(),
          avgReactionTime: monitorRef.current.getAverageReactionTime(),
          processingSpeed: monitorRef.current.getProcessingSpeed(),
          errorRate: monitorRef.current.getErrorRate(),
          subscores: moduleScore.subscores,
        };

        setGameState((prev) => ({
          ...prev,
          gamePhase: 'gameOver',
          results: results,
          feedback: { message: '🎮 Game Over!', type: 'error' },
        }));
      }
    }
  };

  const renderPattern = (pattern: number[][]) => {
    return (
      <div className="grid grid-cols-2 gap-1">
        {pattern.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((value, c) => (
              <div
                key={c}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded flex items-center justify-center font-bold text-sm sm:text-base"
              >
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const startGameHandler = () => {
    setGameState({
      currentLevel: 1,
      score: 0,
      lives: 3,
      gamePhase: 'start',
      sequence: [],
      userInput: [],
      timeLeft: 30,
      feedback: { message: '', type: '' },
    });
    setGrid(Array(3).fill(0).map(() => Array(3).fill(0)));
  };

  // Start Screen
  if (gameState.gamePhase === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 max-w-2xl w-full border border-purple-300/20"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">🧠 NeuroForge</h1>
            <p className="text-purple-100 text-lg sm:text-xl">Cognitive-Motor Integration Challenge</p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="bg-white/5 p-4 rounded-lg border border-purple-300/10">
              <p className="text-purple-100 text-center text-sm sm:text-base">
                📋 Memorize sequences of operations, then reproduce them by adjusting numbers and selecting operations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-purple-500/20 border border-purple-400/30 p-4 rounded-lg text-center">
              <p className="text-purple-200 text-xs mb-2">🎯 Starting Lives</p>
              <p className="text-2xl font-bold text-white">❤️ X3</p>
            </div>
            <div className="bg-purple-500/20 border border-purple-400/30 p-4 rounded-lg text-center">
              <p className="text-purple-200 text-xs mb-2">⭐ Maximum Level</p>
              <p className="text-2xl font-bold text-white">∞</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                ← Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGameHandler}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-bold transition"
            >
              ▶️ Start Game
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 p-3 sm:p-6">
      {/* Header Stats */}
      <div className="max-w-6xl mx-auto mb-3 sm:mb-4 lg:mb-6 px-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-lg p-2 sm:p-3 lg:p-4 border border-purple-300/20"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-purple-200 text-xs sm:text-sm">Level</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">⭐ {gameState.currentLevel}</p>
          </motion.div>
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-lg p-2 sm:p-3 lg:p-4 border border-purple-300/20"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-purple-200 text-xs sm:text-sm">Score</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-300">💰 {gameState.score}</p>
          </motion.div>
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-lg p-2 sm:p-3 lg:p-4 border border-purple-300/20"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-purple-200 text-xs sm:text-sm">Lives</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-400">
              {'❤️'.repeat(Math.max(0, gameState.lives))}
            </p>
          </motion.div>
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-lg p-2 sm:p-3 lg:p-4 border border-purple-300/20"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-purple-200 text-xs sm:text-sm">Time</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-cyan-300">⏱️ {gameState.timeLeft}s</p>
          </motion.div>
        </div>
      </div>

      {/* Feedback */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: gameState.feedback.type ? 1 : 0 }}
        className={`max-w-6xl mx-auto mb-3 sm:mb-4 p-2 sm:p-3 lg:p-4 rounded-lg text-center font-semibold text-white text-sm sm:text-base ${
          gameState.feedback.type === 'success'
            ? 'bg-green-500/30 border border-green-400/50'
            : gameState.feedback.type === 'error'
              ? 'bg-red-500/30 border border-red-400/50'
              : 'bg-blue-500/30 border border-blue-400/50'
        }`}
      >
        {gameState.feedback.message}
      </motion.div>

      <div className="max-w-6xl mx-auto px-2">
        {/* Memory Phase */}
        {gameState.gamePhase === 'memory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-300/20"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center mb-4 sm:mb-6 lg:mb-8">
              📚 Memorize the Sequence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {gameState.sequence.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 border border-purple-300/30 rounded-xl p-3 sm:p-4 lg:p-6 text-center"
                >
                  <p className="text-purple-100 text-xs sm:text-sm mb-2 sm:mb-3">Step {idx + 1}</p>
                  {renderPattern(item.pattern)}
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-yellow-300 mt-3 sm:mt-4">→ {item.operation.toUpperCase()}</p>
                  <p className="text-purple-200 text-xs mt-2">Result: {item.result}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recall Phase */}
        {gameState.gamePhase === 'recall' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-300/20"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center mb-4 sm:mb-6 lg:mb-8">
              ✏️ Reproduce the Sequence
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Grid Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-purple-400/20 to-pink-400/20 border border-purple-300/30 rounded-xl p-4 sm:p-6 lg:p-8"
              >
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 text-center">
                  🔢 Adjust Numbers (Click to cycle 0-9)
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 justify-center">
                  {grid.map((row, r) => (
                    <div key={r} className="flex gap-2 sm:gap-3">
                      {row.map((value, c) => (
                        <motion.button
                          key={`${r}-${c}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCellClick(r, c)}
                          className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-base sm:text-lg lg:text-2xl rounded-lg border-2 border-purple-300/50 transition"
                        >
                          {value}
                        </motion.button>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Operations Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-cyan-400/20 to-blue-400/20 border border-cyan-300/30 rounded-xl p-4 sm:p-6 lg:p-8"
              >
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 text-center">
                  ⚙️ Select Operations in Order
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                  {['add', 'subtract', 'multiply', 'rotate'].map((op) => (
                    <motion.button
                      key={op}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOperationSelect(op)}
                      className="px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-lg border border-cyan-300/50 transition text-xs sm:text-sm lg:text-base capitalize"
                    >
                      {op === 'add' ? '➕ Add' : op === 'subtract' ? '➖ Sub' : op === 'multiply' ? '✖️ Mul' : '🔁 Rotate'}
                    </motion.button>
                  ))}
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-purple-300/20">
                  <p className="text-purple-200 text-sm mb-3 text-center font-semibold">Your Sequence:</p>
                  {gameState.userInput.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {gameState.userInput.map((op, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold text-xs sm:text-sm"
                        >
                          {op.toUpperCase()}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center text-sm">Wait for your input...</p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Between Phase */}
        {gameState.gamePhase === 'between' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-300/20 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-3xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4"
            >
              ✨
            </motion.div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">{gameState.feedback.message}</p>
            <p className="text-purple-200 text-sm sm:text-base">Get ready for the next level...</p>
          </motion.div>
        )}

        {/* Game Over - Results Screen */}
        {gameState.gamePhase === 'gameOver' && gameState.results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-300/20"
          >
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">🏆 Game Over!</h1>
              <p className="text-purple-100 text-sm sm:text-base lg:text-lg">Great effort in NeuroForge Challenge</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {/* Final Stats */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 p-4 sm:p-6 rounded-xl"
              >
                <p className="text-yellow-200 text-xs sm:text-sm mb-2">💰 Final Score</p>
                <p className="text-3xl sm:text-4xl font-bold text-yellow-300">{gameState.results.finalScore}</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 p-4 sm:p-6 rounded-xl"
              >
                <p className="text-cyan-200 text-xs sm:text-sm mb-2">⭐ Reached Level</p>
                <p className="text-3xl sm:text-4xl font-bold text-cyan-300">{gameState.results.currentLevel}</p>
              </motion.div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white/5 backdrop-blur-md border border-purple-300/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 text-center">📊 Performance Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                  <p className="text-purple-200 text-xs sm:text-sm mb-2">✏️ Accuracy</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">{gameState.results.accuracy.toFixed(1)}%</p>
                  <div className="w-full bg-black/30 rounded-full h-2 mt-3">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, gameState.results.accuracy)}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                  <p className="text-purple-200 text-xs sm:text-sm mb-2">⏱️ Avg Reaction Time</p>
                  <p className="text-xl sm:text-2xl font-bold text-cyan-400">{gameState.results.avgReactionTime.toFixed(0)}ms</p>
                </div>

                <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                  <p className="text-purple-200 text-xs sm:text-sm mb-2">⚡ Processing Speed</p>
                  <p className="text-xl sm:text-2xl font-bold text-pink-400">{gameState.results.processingSpeed.toFixed(0)}</p>
                  <div className="w-full bg-black/30 rounded-full h-2 mt-3">
                    <div 
                      className="bg-pink-400 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, gameState.results.processingSpeed)}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                  <p className="text-purple-200 text-xs sm:text-sm mb-2">❌ Error Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-400">{gameState.results.errorRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Performance Feedback */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
              <p className="text-purple-100 text-center mb-3 sm:mb-4 text-sm sm:text-base">💡 Performance Summary</p>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                {gameState.results.accuracy >= 80 && (
                  <li className="text-green-400">✅ Outstanding accuracy - excellent sequence recall!</li>
                )}
                {gameState.results.accuracy < 80 && gameState.results.accuracy >= 60 && (
                  <li className="text-yellow-400">🎯 Good accuracy - keep practicing for improvement!</li>
                )}
                {gameState.results.accuracy < 60 && (
                  <li className="text-orange-400">📈 Keep practicing - accuracy will improve with more attempts!</li>
                )}
                {gameState.results.avgReactionTime < 400 && (
                  <li className="text-cyan-400">⚡ Fast reaction time - great cognitive responsiveness!</li>
                )}
                {gameState.results.currentLevel > 5 && (
                  <li className="text-pink-400">🚀 Reached impressive levels - strong mental endurance!</li>
                )}
              </ul>
            </div>

            {/* Back Button */}
            <div className="flex gap-3">
              {onBack && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg font-bold transition text-sm sm:text-base lg:text-lg"
                >
                  ← Back to Training Floor
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}