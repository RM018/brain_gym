'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainMetricsAggregator } from '@/lib/brainMetrics';
import { ScoringEngine } from '@/lib/scoringEngine';
import { useUser } from '@/lib/userContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { GiUpgrade, GiMountaintop } from 'react-icons/gi';
import { MdTrendingUp } from 'react-icons/md';

export interface PatternMatchModuleProps {
  onComplete: (score: number, profile: any) => void;
  onBack?: () => void;
}

interface PatternPuzzle {
  sequence: (string | number)[];
  options: (string | number)[];
  correct: string | number;
  explanation: string;
}

const puzzles: Record<'easy' | 'medium' | 'hard', PatternPuzzle[]> = {
  easy: [
    {
      sequence: [2, 4, 6, 8, '?'],
      options: [10, 12, 14, 16],
      correct: 10,
      explanation: 'This is a sequence adding 2 each time (arithmetic sequence)',
    },
    {
      sequence: [1, 2, 4, 8, '?'],
      options: [12, 14, 16, 20],
      correct: 16,
      explanation: 'Each number is doubled (geometric sequence)',
    },
    {
      sequence: [5, 5, 5, 5, '?'],
      options: [5, 6, 4, 7],
      correct: 5,
      explanation: 'All numbers are the same (constant sequence)',
    },
    {
      sequence: [1, 2, 3, 4, '?'],
      options: [5, 6, 7, 8],
      correct: 5,
      explanation: 'Simple counting sequence going up by 1',
    },
    {
      sequence: [10, 9, 8, 7, '?'],
      options: [5, 6, 9, 8],
      correct: 6,
      explanation: 'Counting down sequence decreasing by 1',
    },
  ],
  medium: [
    {
      sequence: [1, 1, 2, 3, 5, 8, '?'],
      options: [13, 11, 12, 14],
      correct: 13,
      explanation: 'Fibonacci sequence: each number is sum of previous two',
    },
    {
      sequence: [2, 3, 5, 7, 11, '?'],
      options: [13, 14, 15, 16],
      correct: 13,
      explanation: 'Prime numbers sequence',
    },
    {
      sequence: [1, 4, 9, 16, 25, '?'],
      options: [30, 35, 36, 40],
      correct: 36,
      explanation: 'Perfect squares: 1², 2², 3², 4², 5², 6²',
    },
    {
      sequence: [1, 4, 9, 16, '?'],
      options: [20, 23, 25, 30],
      correct: 25,
      explanation: 'Square numbers increasing: 1, 4, 9, 16, 25',
    },
    {
      sequence: [2, 6, 12, 20, 30, '?'],
      options: [40, 42, 43, 44],
      correct: 42,
      explanation: 'n(n+1): 1×2, 2×3, 3×4, 4×5, 5×6, 6×7',
    },
  ],
  hard: [
    {
      sequence: [1, 2, 4, 7, 11, 16, '?'],
      options: [22, 24, 25, 26],
      correct: 22,
      explanation: 'Differences increase by 1: +1, +2, +3, +4, +5, +6',
    },
    {
      sequence: [2, 3, 5, 8, 12, '?'],
      options: [16, 17, 18, 19],
      correct: 17,
      explanation: 'Adding 1, 2, 3, 4, 5... to get next number',
    },
    {
      sequence: [1, 3, 6, 10, 15, '?'],
      options: [19, 20, 21, 22],
      correct: 21,
      explanation: 'Triangular numbers: sum of consecutive integers',
    },
    {
      sequence: [5, 10, 9, 14, 13, 18, '?'],
      options: [17, 19, 20, 22],
      correct: 17,
      explanation: 'Alternating: +5 then -1 pattern',
    },
    {
      sequence: [1, 1, 2, 6, 24, '?'],
      options: [100, 120, 140, 160],
      correct: 120,
      explanation: 'Factorials: 1!, 1!, 2!, 3!, 4!, 5!',
    },
  ],
};

const difficultyConfig = {
  easy: { totalPuzzles: 5, timePerPuzzle: 20 },
  medium: { totalPuzzles: 5, timePerPuzzle: 30 },
  hard: { totalPuzzles: 5, timePerPuzzle: 40 },
};

export default function PatternMatchModule({ onComplete, onBack }: PatternMatchModuleProps) {
  const { currentUser } = useUser();
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [totalTime, setTotalTime] = useState(0); // track total time spent

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
  
    const handleBack = () => {
      if (onBack) {
        onBack();
      }
    };
  
    window.addEventListener("popstate", handleBack);
  
    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [onBack]);

  useEffect(() => {
    if (!gameStarted || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, showResults]);

  const handleTimeout = () => {
    if (currentPuzzleIndex < puzzles[difficulty].length - 1) {
      handleNextPuzzle();
    } else {
      finishGame();
    }
  };

  const initializeGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setGameStartTime(performance.now());
    setDifficulty(selectedDifficulty);
    const config = difficultyConfig[selectedDifficulty];
    setTimeLeft(config.timePerPuzzle);
    setCurrentPuzzleIndex(0);
    setScore(0);
    setAnswered(0);
    setCorrect(0);
    setTotalTime(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGameStarted(true);
  };

  const handleAnswerClick = (option: string | number) => {
    const currentPuzzle = puzzles[difficulty][currentPuzzleIndex];
    const isCorrect = option === currentPuzzle.correct;

    setSelectedAnswer(option);
    setFeedbackCorrect(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      setCorrect((c) => c + 1);
      const points = Math.max(10, 100 - (difficultyConfig[difficulty].timePerPuzzle - timeLeft) * 2);
      setScore((s) => s + points);
    }

    // Add time spent on this question
    const timeSpent = difficultyConfig[difficulty].timePerPuzzle - timeLeft;
    setTotalTime((prev) => prev + timeSpent);

    setTimeout(() => {
      handleNextPuzzle();
    }, 2000);
  };

  const handleNextPuzzle = () => {
    setAnswered((a) => a + 1);

    if (currentPuzzleIndex < puzzles[difficulty].length - 1) {
      setCurrentPuzzleIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(difficultyConfig[difficulty].timePerPuzzle);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setShowResults(true);
  };

  const calculateAccuracy = () => {
    return answered > 0 ? Math.round((correct / answered) * 100) : 0;
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-3xl w-full"
        >
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">
            <span className="text-purple-400">PATTERN</span> <span className="text-pink-400">MATCH</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-2 sm:mb-3 text-center">
            Identify patterns and predict the next number in sequences
          </p>

          <div className="bg-[#041517]/60 border border-emerald-500/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <div className="text-blue-400 font-bold mb-3 sm:mb-4 text-sm sm:text-base">Instructions:</div>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-xs sm:text-sm md:text-base">
              <li>• Look at the sequence of numbers</li>
              <li>• Identify the pattern or rule</li>
              <li>• Select what number should come next</li>
              <li>• Faster correct answers = higher score</li>
            </ul>
          </div>

          <div className="bg-purple-500/10 border border-purple-400/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-8 sm:mb-10">
            <div className="font-bold mb-4 text-purple-300 text-sm sm:text-base">Select Difficulty:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {(
                [
                  {
                    key: 'easy',
                    label: 'Easy',
                    desc: 'Basic patterns',
                    color: 'from-green-500 to-emerald-600',
                    icon: MdTrendingUp,
                  },
                  {
                    key: 'medium',
                    label: 'Medium',
                    desc: 'Intermediate patterns',
                    color: 'from-orange-500 to-yellow-600',
                    icon: GiUpgrade,
                  },
                  {
                    key: 'hard',
                    label: 'Hard',
                    desc: 'Complex patterns',
                    color: 'from-purple-500 to-pink-600',
                    icon: GiMountaintop,
                  },
                ] as const
              ).map(({ key, label, desc, color, icon: Icon }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => initializeGame(key)}
                  className={`px-6 py-4 sm:py-6 bg-gradient-to-r ${color} hover:shadow-lg hover:shadow-orange-500/50 rounded-xl sm:rounded-2xl text-white font-bold transition flex flex-col items-center`}
                >
                  <Icon className="text-3xl sm:text-4xl mb-2" />
                  <div className="text-lg sm:text-xl">{label}</div>
                  <div className="text-xs sm:text-sm text-white/80">{desc}</div>
                </motion.button>
              ))}
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
          </div>
        </motion.div>
      </div>
    );
  }

  if (showResults) {
    const accuracy = calculateAccuracy();
    // Calculate speed as a normalized score (0-100)
    // Average time per question: totalTime / answered (in seconds)
    // We want faster = higher speed. Using a simple formula: max(0, 100 - avgTime * 2) but cap.
    const avgTimePerQuestion = answered > 0 ? totalTime / answered : 0;
    // Assuming 5 seconds is excellent (100), 30 seconds is poor (0)
    const speed = Math.max(0, Math.min(100, 100 - avgTimePerQuestion * 2));

    const scoring = new ScoringEngine();
    const moduleScore = scoring.calculatePatternScore(accuracy, speed, difficulty);

    try {
      const aggregator = new BrainMetricsAggregator(currentUser.id);
      aggregator.addSession({
        timestamp: new Date(),
        moduleType: 'pattern',
        score: moduleScore.normalizedScore,
        duration: performance.now() - gameStartTime,
        subscores: moduleScore.subscores,
      });
      // Dispatch event to notify Progress component
      window.dispatchEvent(new CustomEvent('sessions-updated', { detail: { userId: currentUser.id } }));
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    const profile = {
      patternRecognition: accuracy,
      analyticalThinking: moduleScore.subscores.patternRecognition,
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl w-full"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-6 sm:mb-8 text-center">
            PATTERN ANALYSIS COMPLETE
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#041517]/60 border border-purple-400/30 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">Final Score</div>
              <div className="text-4xl sm:text-5xl font-bold text-purple-400">{moduleScore.normalizedScore}</div>
            </div>

            <div className="bg-[#041517]/60 border border-purple-400/30 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Performance</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Accuracy:</span>
                  <span className="font-bold text-purple-400 text-sm sm:text-base">{accuracy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Correct:</span>
                  <span className="font-bold text-purple-400 text-sm sm:text-base">
                    {correct}/{answered}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Difficulty:</span>
                  <span className="font-bold text-purple-400 text-sm sm:text-base capitalize">{difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete(moduleScore.normalizedScore, profile)}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-full text-base sm:text-lg font-bold"
          >
            Continue
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentPuzzle = puzzles[difficulty][currentPuzzleIndex];
  const progress = ((currentPuzzleIndex + 1) / puzzles[difficulty].length) * 100;

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-start sm:items-center px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex-shrink-0 border-b border-purple-500/20 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400">PATTERN MATCHING</h1>
          <div className="text-xs text-gray-400 mt-1">
            Question {currentPuzzleIndex + 1}/{puzzles[difficulty].length}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
          <div className="text-center">
            <div className="text-xs text-gray-400">Score</div>
            <div className="text-lg sm:text-2xl font-bold text-purple-400">{score}</div>
          </div>
          <div className={`text-center ${timeLeft < 5 ? 'text-red-400' : 'text-cyan-400'}`}>
            <div className="text-xs text-gray-400">Time</div>
            <div className="text-lg sm:text-2xl font-bold">{timeLeft}s</div>
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="bg-gray-700 rounded-full h-2 sm:h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-purple-400 h-full rounded-full transition-all"
          />
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full"
        >
          {/* PUZZLE */}
          <div className="bg-[#0a2024]/80 border border-purple-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-base sm:text-lg md:text-xl text-orange-300 mb-3 sm:mb-4 font-bold">Find the pattern:</div>
              <div className="flex justify-center items-center gap-1 sm:gap-3 text-xl sm:text-3xl md:text-4xl font-bold text-orange-400 flex-wrap">
                {currentPuzzle.sequence.map((num, idx) => (
                  <span key={idx} className="break-words">
                    {num}
                    {idx < currentPuzzle.sequence.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 sm:p-4 rounded-lg border-2 ${
                  feedbackCorrect
                    ? 'bg-green-500/10 border-green-400 text-green-300'
                    : 'bg-red-500/10 border-red-400 text-red-300'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm mb-1 flex items-center gap-2">
                  {feedbackCorrect ? (
                    <>
                      <FaCheckCircle className="text-lg" /> Correct!
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-lg" /> Incorrect
                    </>
                  )}
                </div>
                <div className="text-xs sm:text-sm">{currentPuzzle.explanation}</div>
              </motion.div>
            )}
          </div>

          {/* OPTIONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            {currentPuzzle.options.map((option, idx) => (
              <motion.button
                key={idx}
                whileHover={!showFeedback ? { scale: 1.05 } : {}}
                whileTap={!showFeedback ? { scale: 0.95 } : {}}
                onClick={() => !showFeedback && handleAnswerClick(option)}
                disabled={showFeedback}
                className={`py-3 sm:py-4 md:py-5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl transition ${
                  showFeedback && selectedAnswer === option
                    ? feedbackCorrect
                      ? 'bg-green-500 border-2 border-green-400 text-white'
                      : 'bg-red-500 border-2 border-red-400 text-white'
                    : showFeedback && option === currentPuzzle.correct
                      ? 'bg-green-500 border-2 border-green-400 text-white'
                      : 'bg-orange-500/20 border-2 border-orange-400 text-orange-300 hover:bg-orange-500/40 disabled:cursor-not-allowed'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <div className="flex gap-3 sm:gap-4 px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex-shrink-0 border-t border-purple-500/20">
        {onBack && !showFeedback && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-sm sm:text-base font-bold"
          >
            Back
          </motion.button>
        )}
      </div>
    </div>
  );
}