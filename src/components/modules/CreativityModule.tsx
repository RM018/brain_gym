'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DATEngine } from '@/lib/semanticDistance';

export interface CreativityModuleProps {
  onComplete: (score: number, profile: any) => void;
  onBack?: () => void;
}

export default function CreativityModule({ onComplete, onBack }: CreativityModuleProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [words, setWords] = useState<string[]>(Array(10).fill(''));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const startGame = () => {
    setGameStarted(true);
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && words[index].trim() && index < 9) {
      setCurrentIndex(index + 1);
    }
  };

  const handleSubmit = () => {
    const validation = DATEngine.validateWords(words);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    try {
      const datResults = DATEngine.scoreDAT(words);
      setResults(datResults);
      setShowResults(true);

      setTimeout(() => {
        onComplete(datResults.score, datResults.profile);
      }, 5000);
    } catch (error: any) {
      setErrors([error.message]);
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-3xl p-12 max-w-3xl"
        >
          <h1 className="text-5xl font-bold mb-6 text-center">
            <span className="text-purple-400">CREATIVITY</span>{' '}
            <span className="text-pink-400">ENGINE</span>
          </h1>
          <p className="text-xl text-gray-300 mb-4 text-center">
            Divergent Association Task (DAT)
          </p>
          <p className="text-gray-400 mb-8 text-center">
            Think of 10 words that are as different from each other as possible. Your semantic distance will measure creative thinking.
          </p>

          <div className="bg-[#041517]/60 border border-emerald-500/20 p-6 rounded-2xl mb-8">
            <div className="text-blue-400 font-bold mb-4">Instructions:</div>
            <ul className="space-y-2 text-gray-300">
              <li>• Enter 10 single words (no phrases)</li>
              <li>• Make each word as different as possible from the others</li>
              <li>• Think across categories, concepts, and domains</li>
              <li>• Be creative - there are no wrong answers!</li>
            </ul>
          </div>

          <div className="bg-purple-500/10 border border-purple-400/20 p-6 rounded-2xl mb-8">
            <div className="font-bold mb-2 text-purple-300">Examples of high creativity:</div>
            <div className="text-sm text-gray-300">
              "Galaxy, Pencil, Democracy, Octopus, Jazz, Molecule, Glacier, Laughter, Circuit, Silk"
            </div>
          </div>

          <div className="flex gap-4">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-xl font-bold"
              >
                Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="flex-1 px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-xl font-bold"
            >
              BEGIN CREATIVITY TEST
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-3xl p-12 max-w-4xl w-full"
        >
          <h2 className="text-4xl font-bold text-purple-400 mb-8 text-center">
            CREATIVITY ANALYSIS
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-[#041517]/60 border border-emerald-400/30 p-6 rounded-xl text-center">
              <div className="text-sm text-gray-400 mb-2">Overall Creativity</div>
              <div className="text-5xl font-bold text-blue-400">
                {results.score.toFixed(0)}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {results.percentile.toFixed(0)}th percentile
              </div>
            </div>

            <div className="bg-[#041517]/60 border border-emerald-400/30 p-6 rounded-xl">
              <div className="text-sm text-gray-400 mb-4">Creativity Breakdown</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Semantic Distance:</span>
                  <span className="font-bold text-blue-400">
                    {(results.profile.semanticDistance * 100).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Divergent Thinking:</span>
                  <span className="font-bold text-purple-400">
                    {results.profile.divergentThinking.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Originality:</span>
                  <span className="font-bold text-pink-400">
                    {results.profile.originalityScore.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#041517]/60 border border-emerald-400/30 p-6 rounded-xl mb-6">
            <div className="text-lg font-bold mb-4 text-emerald-300">Your Words:</div>
            <div className="flex flex-wrap gap-3">
              {words.map((word, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-4 py-2 bg-[#041517]/80 border border-emerald-400/40 rounded-full text-lg"
                >
                  {word}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-400/30 p-6 rounded-xl">
            <div className="font-bold mb-3 text-emerald-300">Insights:</div>
            <ul className="space-y-2">
              {results.profile.insights.map((insight: string, i: number) => (
                <li key={i} className="text-gray-300">• {insight}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  const filledWords = words.filter(w => w.trim()).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-teal-900/40 p-4">
      <div className="w-full max-w-3xl">
        {/* HUD */}
        <div className="flex justify-between mb-6">
          <div className="bg-[#041517]/80 border border-purple-400/40 px-6 py-3 rounded-full">
            <span className="text-purple-400 font-bold">WORDS: </span>
            <span className="text-2xl font-mono text-white">{filledWords}/10</span>
          </div>
          <div className="bg-[#041517]/80 border border-blue-400/40 px-6 py-3 rounded-full">
            <span className="text-blue-400 font-bold">PROGRESS: </span>
            <span className="text-2xl font-mono text-white">{((filledWords / 10) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[#041517]/60 border border-emerald-400/20 rounded-full h-3 mb-8 overflow-hidden">
          <motion.div
            animate={{ width: `${(filledWords / 10) * 100}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>

        {/* Input Grid */}
        <div className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-3xl p-8 mb-6">
          <div className="text-2xl font-bold mb-6 text-center text-purple-400">
            Enter 10 Diverse Words
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {words.map((word, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-blue-400">{index + 1}</div>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => handleWordChange(index, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setCurrentIndex(index)}
                    placeholder={`Word ${index + 1}...`}
                    className={`flex-1 px-4 py-3 bg-[#041517]/80 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      currentIndex === index ? 'border-purple-400' : 'border-emerald-500/20'
                    }`}
                    autoFocus={index === 0}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-400/40 p-4 rounded-xl mb-6"
          >
            <div className="text-red-400 font-bold mb-2">Please fix:</div>
            <ul className="space-y-1">
              {errors.map((error, i) => (
                <li key={i} className="text-red-300 text-sm">• {error}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-xl font-bold"
            >
              Back
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={filledWords < 10}
            className="flex-1 px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 disabled:hover:from-purple-500 disabled:hover:to-pink-500"
          >
            {filledWords < 10 ? `${10 - filledWords} more words needed` : 'ANALYZE CREATIVITY'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
