'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainMetricsAggregator } from '@/lib/brainMetrics';
import { ScoringEngine } from '@/lib/scoringEngine';
import { useUser } from '@/lib/userContext';
import { FaStar, FaBullseye, FaRocket, FaPalette, FaLightbulb, FaMask, FaGuitar, FaDice, FaTrophy, FaBolt } from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import { MdAutoAwesome, MdMusicNote } from 'react-icons/md';

export interface MemoryModuleProps {
  onComplete: (score: number, profile: any) => void;
  onBack?: () => void;
}

interface Card {
  id: number;
  symbolId: string;
  flipped: boolean;
  matched: boolean;
}

const symbolIcons: Record<string, React.ComponentType<any>> = {
  star: FaStar,
  target: FaBullseye,
  rocket: FaRocket,
  palette: FaPalette,
  brain: GiBrain,
  lightbulb: FaLightbulb,
  mask: FaMask,
  guitar: FaGuitar,
  dice: FaDice,
  trophy: FaTrophy,
  bolt: FaBolt,
  music: MdMusicNote,
};

const symbolIds = ['star', 'target', 'rocket', 'palette', 'brain', 'lightbulb', 'mask', 'guitar', 'dice', 'trophy', 'bolt', 'music'];

export default function MemoryModule({ onComplete, onBack }: MemoryModuleProps) {
  const { currentUser } = useUser();
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showResults, setShowResults] = useState(false);


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

  const difficultyConfig = {
    easy: { pairs: 6, time: 120 },
    medium: { pairs: 8, time: 180 },
    hard: { pairs: 12, time: 240 },
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTime((t) => {
        if (t >= difficultyConfig[difficulty].time) {
          setGameOver(true);
          return t;
        }
        return t + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, difficulty]);

  useEffect(() => {
    if (matched.length === difficultyConfig[difficulty].pairs * 2) {
      setGameOver(true);
    }
  }, [matched, difficulty]);

  const initializeGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setGameStartTime(performance.now());
    setDifficulty(selectedDifficulty);
    const config = difficultyConfig[selectedDifficulty];
    const selectedSymbolIds = symbolIds.slice(0, config.pairs);
    const shuffledCards = [...selectedSymbolIds, ...selectedSymbolIds]
      .sort(() => Math.random() - 0.5)
      .map((symbolId, index) => ({
        id: index,
        symbolId,
        flipped: false,
        matched: false,
      }));

    setCards(shuffledCards);
    setMoves(0);
    setTime(0);
    setFlipped([]);
    setMatched([]);
    setGameStarted(true);
  };

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || matched.includes(id) || flipped.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);

      setTimeout(() => {
        if (cards[newFlipped[0]].symbolId === cards[newFlipped[1]].symbolId) {
          setMatched((prev) => [...prev, ...newFlipped]);
        }
        setFlipped([]);
      }, 1000);
    }
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
            <span className="text-purple-400">MEMORY</span>{' '}
            <span className="text-pink-400">MASTERY</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-3 sm:mb-4 md:mb-6 text-center">
            Match pairs of symbols and test your working memory
          </p>

          <div className="bg-[#041517]/60 border border-emerald-500/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <div className="text-purple-400 font-bold mb-3 sm:mb-4 text-sm sm:text-base">Instructions:</div>
            <ul className="space-y-1.5 sm:space-y-2 text-gray-300 text-xs sm:text-sm md:text-base">
              <li>• Click cards to flip them and reveal symbols</li>
              <li>• Find matching pairs of symbols</li>
              <li>• Match all pairs before time runs out</li>
              <li>• Fewer moves = higher score</li>
            </ul>
          </div>

          <div className="bg-purple-500/10 border border-purple-400/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-8 sm:mb-10">
            <div className="font-bold mb-4 text-purple-300 text-sm sm:text-base">Select Difficulty:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {(
                [
                  { key: 'easy', label: 'Easy', desc: '6 pairs, 2 min', color: 'from-green-500 to-emerald-600', icon: FaStar },
                  { key: 'medium', label: 'Medium', desc: '8 pairs, 3 min', color: 'from-blue-500 to-cyan-600', icon: FaBullseye },
                  { key: 'hard', label: 'Hard', desc: '12 pairs, 4 min', color: 'from-purple-500 to-pink-600', icon: FaTrophy },
                ] as const
              ).map(({ key, label, desc, color, icon: Icon }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => initializeGame(key)}
                  className={`px-6 py-4 sm:py-6 bg-gradient-to-r ${color} hover:shadow-lg hover:shadow-purple-500/50 rounded-xl sm:rounded-2xl text-white font-bold transition flex flex-col items-center`}
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

  if (gameOver) {
    const totalPairs = difficultyConfig[difficulty].pairs;
    const pairsMatched = matched.length / 2;

    const scoring = new ScoringEngine();
    const moduleScore = scoring.calculateMemoryScore(
      pairsMatched,
      totalPairs,
      moves,
      time,
      difficulty
    );

    try {
      const aggregator = new BrainMetricsAggregator(currentUser.id);
      aggregator.addSession({
        timestamp: new Date(),
        moduleType: 'memory',
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
      memoryRetention: (pairsMatched / totalPairs) * 100,
      reactionTime: moves > 0 ? (time / moves) * 1000 : 0,
      workingMemory: (pairsMatched / totalPairs) * 100,
    };

    if (showResults) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-3 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl w-full"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-6 sm:mb-8 text-center">
              MEMORY TEST COMPLETE
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
                    <span className="text-xs sm:text-sm">Pairs Matched:</span>
                    <span className="font-bold text-purple-400 text-sm sm:text-base">
                      {pairsMatched}/{totalPairs}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Total Moves:</span>
                    <span className="font-bold text-purple-400 text-sm sm:text-base">{moves}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Time Taken:</span>
                    <span className="font-bold text-purple-400 text-sm sm:text-base">
                      {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                    </span>
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

    setTimeout(() => setShowResults(true), 1000);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <MdAutoAwesome className="text-4xl sm:text-5xl mb-4 text-cyan-400 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">Game Complete!</h2>
          <p className="text-gray-300">Calculating results...</p>
        </motion.div>
      </div>
    );
  }

  const config = difficultyConfig[difficulty];
  const timeLeft = config.time - time;

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex-shrink-0 border-b border-purple-500/20">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400">MEMORY GAME</h1>
        <div className="flex gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xs text-gray-400">Time Left</div>
            <div className={`text-lg sm:text-2xl font-bold ${timeLeft < 30 ? 'text-red-400' : 'text-purple-400'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Moves</div>
            <div className="text-lg sm:text-2xl font-bold text-purple-400">{moves}</div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CARDS AREA */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto w-full"
        >
          {/* CARDS GRID */}
          <div
            className={`grid gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8`}
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(${difficulty === 'easy' ? '80px' : difficulty === 'medium' ? '70px' : '60px'}, 1fr))`,
            }}
          >
            {cards.map((card) => (
              <motion.div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full aspect-square rounded-lg sm:rounded-xl cursor-pointer font-bold transition-all flex items-center justify-center ${
                  matched.includes(card.id)
                    ? 'bg-green-500/20 border-2 border-green-400'
                    : flipped.includes(card.id)
                      ? 'bg-purple-500 border-2 border-purple-400'
                      : 'bg-purple-900/40 border-2 border-purple-500/50 hover:bg-purple-900/60'
                }`}
              >
                {flipped.includes(card.id) || matched.includes(card.id) ? (
                  (() => {
                    const IconComponent = symbolIcons[card.symbolId];
                    return <IconComponent className="text-2xl sm:text-4xl md:text-5xl text-white" />;
                  })()
                ) : (
                  <span className="text-xl sm:text-3xl md:text-4xl">?</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <div className="flex gap-3 sm:gap-4 px-3 sm:px-4 md:px-6 py-4 sm:py-6 flex-shrink-0 border-t border-purple-500/20">
        {onBack && (
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