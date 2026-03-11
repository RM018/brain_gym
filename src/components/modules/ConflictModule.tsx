'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Swords, Flame } from 'lucide-react';
import { ScoringEngine } from '@/lib/scoringEngine';
import { BrainMetricsAggregator } from '@/lib/brainMetrics';
import { useUser } from '@/lib/userContext';

export interface ConflictModuleProps {
  onComplete: (score: number, metrics: any) => void;
  onBack?: () => void;
}

interface ConflictMetrics {
  empathy: number;
  assertiveness: number;
  resolution: number;
  regulation: number;
}

interface ConflictScenario {
  id: number;
  title: string;
  context: string;
  emotionalIntensity: number;
  responses: {
    text: string;
    empathyScore: number;
    assertivenessScore: number;
    resolutionScore: number;
  }[];
}

const scenarios: ConflictScenario[] = [
  {
    id: 1,
    title: 'Team Member Upset About Workload',
    context: 'A team member approaches you visibly frustrated: "I\'m completely overwhelmed! I\'ve been working nights and weekends while others leave at 5 PM. This isn\'t fair!"',
    emotionalIntensity: 70,
    responses: [
      {
        text: 'I understand this is frustrating. Let\'s sit down and look at the workload distribution together.',
        empathyScore: 90,
        assertivenessScore: 60,
        resolutionScore: 85,
      },
      {
        text: 'Everyone needs to pull their weight. I\'ll address this with the team.',
        empathyScore: 40,
        assertivenessScore: 85,
        resolutionScore: 60,
      },
      {
        text: 'I hear you. Can you document your hours so we can review this objectively?',
        empathyScore: 70,
        assertivenessScore: 75,
        resolutionScore: 80,
      },
      {
        text: 'That\'s part of being on a team. We all have busy periods.',
        empathyScore: 20,
        assertivenessScore: 50,
        resolutionScore: 30,
      },
    ],
  },
  {
    id: 2,
    title: 'Disagreement on Technical Approach',
    context: 'Two senior engineers are in heated debate about architecture. One says: "This approach is outdated!" The other responds: "Your solution is over-engineered!"',
    emotionalIntensity: 80,
    responses: [
      {
        text: 'Let\'s pause and evaluate both approaches objectively with criteria we all agree on.',
        empathyScore: 75,
        assertivenessScore: 80,
        resolutionScore: 90,
      },
      {
        text: 'I\'ll make the final decision. Give me your best arguments in writing.',
        empathyScore: 50,
        assertivenessScore: 90,
        resolutionScore: 70,
      },
      {
        text: 'Both of you have valid points. What if we prototype both and compare results?',
        empathyScore: 85,
        assertivenessScore: 65,
        resolutionScore: 85,
      },
      {
        text: 'We don\'t have time for this debate. We\'re going with the simpler approach.',
        empathyScore: 30,
        assertivenessScore: 85,
        resolutionScore: 50,
      },
    ],
  },
  {
    id: 3,
    title: 'Difficult Feedback Delivery',
    context: 'You need to tell a team member their recent work quality has declined significantly. They\'ve been with the company for years and are usually excellent.',
    emotionalIntensity: 85,
    responses: [
      {
        text: 'I\'ve noticed some changes in your work lately. Is everything okay? I want to support you.',
        empathyScore: 95,
        assertivenessScore: 60,
        resolutionScore: 85,
      },
      {
        text: 'Your recent work hasn\'t met our standards. We need to see improvement within 30 days.',
        empathyScore: 30,
        assertivenessScore: 95,
        resolutionScore: 60,
      },
      {
        text: 'I value your contributions, and I\'m concerned about recent deliverables. Can we talk about what\'s happening?',
        empathyScore: 90,
        assertivenessScore: 75,
        resolutionScore: 90,
      },
      {
        text: 'Several people have mentioned quality issues with your work. What\'s going on?',
        empathyScore: 50,
        assertivenessScore: 70,
        resolutionScore: 65,
      },
    ],
  },
];

export default function ConflictModule({ onComplete, onBack: _onBack }: ConflictModuleProps) {
  const { currentUser } = useUser();
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentScenario, setCurrentScenario] = useState(0);
  const [metrics, setMetrics] = useState<ConflictMetrics>({
    empathy: 0,
    assertiveness: 0,
    resolution: 0,
    regulation: 0,
  });
  const [responseStartTime, setResponseStartTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [finalResults, setFinalResults] = useState<any>(null);

  const difficultyConfig = {
    easy: { numScenarios: 2, emotionalBoost: 0 },
    medium: { numScenarios: 3, emotionalBoost: 0 },
    hard: { numScenarios: 3, emotionalBoost: 20 },
  };

  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty);
    const now = performance.now();
    setGameStartTime(now);
    setGameStarted(true);
    setResponseStartTime(now);
  };

  const selectResponse = (responseIndex: number) => {
    const responseTime = performance.now() - responseStartTime;
    const scenario = scenarios[currentScenario];
    const response = scenario.responses[responseIndex];

    const regulationScore = scenario.emotionalIntensity > 70
      ? Math.max(0, 100 - (responseTime / 100))
      : 100;

    setMetrics(prev => ({
      empathy: prev.empathy + response.empathyScore,
      assertiveness: prev.assertiveness + response.assertivenessScore,
      resolution: prev.resolution + response.resolutionScore,
      regulation: prev.regulation + regulationScore,
    }));

    setLastResponse(response.text);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      const config = difficultyConfig[difficulty];
      if (currentScenario < config.numScenarios - 1) {
        setCurrentScenario(prev => prev + 1);
        setResponseStartTime(performance.now());
      } else {
        // Game complete
        const avgEmpathy = (metrics.empathy + response.empathyScore) / config.numScenarios;
        const avgAssertiveness = (metrics.assertiveness + response.assertivenessScore) / config.numScenarios;
        const avgResolution = (metrics.resolution + response.resolutionScore) / config.numScenarios;
        const avgRegulation = (metrics.regulation + regulationScore) / config.numScenarios;

        const scoring = new ScoringEngine();
        const moduleScore = scoring.calculateConflictScore(
          avgEmpathy,
          avgAssertiveness,
          avgResolution,
          avgRegulation
        );

        try {
          const aggregator = new BrainMetricsAggregator(currentUser.id);
          aggregator.addSession({
            timestamp: new Date(),
            moduleType: 'conflict',
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
          avgEmpathy,
          avgAssertiveness,
          avgResolution,
          avgRegulation,
          subscores: moduleScore.subscores
        });
        setShowFinalResults(true);

        setTimeout(() => {
          onComplete(moduleScore.normalizedScore, moduleScore);
        }, 5000);
      }
    }, 2500);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-pink-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a2024]/80 border border-pink-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-3xl w-full"
        >
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-center text-pink-400">
            CONFLICT RESOLUTION
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-3 sm:mb-4 md:mb-6 text-center">
            Select Difficulty Level
          </p>

          <div className="bg-pink-500/10 border border-pink-400/20 p-2 sm:p-3 md:p-5 rounded-lg sm:rounded-lg md:rounded-xl mb-3 sm:mb-4 md:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startGame(level)}
                  className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-br from-pink-600 to-pink-800 border border-pink-400/50 rounded-lg hover:border-pink-300 transition-all font-semibold text-white text-xs sm:text-sm md:text-base capitalize"
                >
                  <div className="text-3xl sm:text-4xl mb-2">
                    {level === 'easy' && <Target className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />}
                    {level === 'medium' && <Swords className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />}
                    {level === 'hard' && <Flame className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />}
                  </div>
                  {level}
                  <div className="text-xs text-pink-300 mt-2">
                    {level === 'easy' && '2 scenarios'}
                    {level === 'medium' && '3 scenarios'}
                    {level === 'hard' && '3 intense scenarios'}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <p className="text-sm sm:text-base text-gray-400 text-center">
            Navigate conflict situations and develop your emotional intelligence.
          </p>
        </motion.div>
      </div>
    );
  }

  if (showFinalResults && finalResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-pink-900/40 p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a2024]/80 border border-pink-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl w-full"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-pink-400 mb-6 sm:mb-8 text-center">
            EMOTIONAL INTELLIGENCE RESULTS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[#041517]/60 border border-pink-400/30 p-4 sm:p-6 rounded-xl text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">Overall EQ Score</div>
              <div className="text-4xl sm:text-5xl font-bold text-pink-400">
                {finalResults.score.toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">
                {finalResults.score >= 80 ? 'Exceptional EQ' : finalResults.score >= 60 ? 'Strong EQ' : finalResults.score >= 40 ? 'Good EQ' : 'Developing EQ'}
              </div>
            </div>

            <div className="bg-[#041517]/60 border border-pink-400/30 p-4 sm:p-6 rounded-xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">EQ Breakdown</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Empathy:</span>
                  <span className="font-bold text-pink-400 text-sm sm:text-base">
                    {finalResults.avgEmpathy.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Assertiveness:</span>
                  <span className="font-bold text-purple-400 text-sm sm:text-base">
                    {finalResults.avgAssertiveness.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Resolution:</span>
                  <span className="font-bold text-emerald-400 text-sm sm:text-base">
                    {finalResults.avgResolution.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Regulation:</span>
                  <span className="font-bold text-rose-400 text-sm sm:text-base">
                    {finalResults.avgRegulation.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#041517]/60 border border-pink-400/30 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
            <div className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-pink-300">Performance Details:</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Empathy</span>
                  <span className="text-sm text-pink-400">{finalResults.avgEmpathy.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-pink-400 h-2 sm:h-3 rounded-full" style={{ width: `${finalResults.avgEmpathy}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Assertiveness</span>
                  <span className="text-sm text-purple-400">{finalResults.avgAssertiveness.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-purple-400 h-2 sm:h-3 rounded-full" style={{ width: `${finalResults.avgAssertiveness}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Resolution</span>
                  <span className="text-sm text-emerald-400">{finalResults.avgResolution.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-emerald-400 h-2 sm:h-3 rounded-full" style={{ width: `${finalResults.avgResolution}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Regulation</span>
                  <span className="text-sm text-rose-400">{finalResults.avgRegulation.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-rose-400 h-2 sm:h-3 rounded-full" style={{ width: `${finalResults.avgRegulation}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-400/30 p-4 sm:p-6 rounded-xl">
            <div className="font-bold mb-2 sm:mb-3 text-emerald-300 text-sm sm:text-base">Key Insights:</div>
            <ul className="space-y-1.5 sm:space-y-2">
              {finalResults.avgEmpathy >= 75 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Excellent empathy - you understand others' perspectives deeply</li>
              )}
              {finalResults.avgAssertiveness >= 75 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Strong assertiveness - you effectively advocate for your position</li>
              )}
              {finalResults.avgResolution >= 75 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Outstanding conflict resolution - you find win-win solutions</li>
              )}
              {finalResults.avgRegulation >= 75 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• Superior emotional regulation - you stay calm under pressure</li>
              )}
              {finalResults.score >= 80 && (
                <li className="text-gray-300 text-xs sm:text-sm md:text-base">• You demonstrate exceptional emotional intelligence across all areas</li>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  const scenario = scenarios[currentScenario];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-pink-900/40 p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl">
        {/* HUD */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-[#0a2024]/80 border border-pink-500/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-lg">
            <span className="text-pink-400 font-bold text-xs sm:text-sm">SCENARIO: </span>
            <span className="text-xl sm:text-2xl font-mono">{currentScenario + 1}/{scenarios.length}</span>
          </div>
          <div className="bg-[#0a2024]/80 border border-orange-500/40 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-lg">
            <span className="text-orange-400 font-bold text-xs sm:text-sm">INTENSITY: </span>
            <motion.span
              animate={{ scale: scenario.emotionalIntensity > 75 ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: scenario.emotionalIntensity > 75 ? Infinity : 0, duration: 1 }}
              className="text-xl sm:text-2xl font-mono"
            >
              {scenario.emotionalIntensity}%
            </motion.span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showFeedback ? (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a2024]/80 border border-pink-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                {scenario.title}
              </h2>
              
              <div className="bg-[#041517]/60 border border-pink-400/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
                <p className="text-sm sm:text-base md:text-lg text-gray-200 italic leading-relaxed">
                  {scenario.context}
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-gray-200">Your Response:</div>
                {scenario.responses.map((response, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectResponse(index)}
                    className="w-full bg-[#041517]/60 border border-pink-400/20 p-4 sm:p-5 md:p-6 rounded-xl text-left hover:border-pink-400/60 hover:bg-[#041517]/80 transition-all"
                  >
                    <div className="text-sm sm:text-base md:text-lg text-gray-200">{response.text}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a2024]/80 border border-emerald-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-12 text-center mb-4 sm:mb-6"
            >
              <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">✓</div>
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 mb-3 sm:mb-4">Response Recorded</h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-300 italic">"{lastResponse}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#041517]/60 border border-pink-400/30 p-3 sm:p-4 rounded-xl text-center">
            <div className="text-xs sm:text-sm text-gray-400">Empathy</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-400">
              {(metrics.empathy / Math.max(1, currentScenario + 1)).toFixed(0)}
            </div>
          </div>
          <div className="bg-[#041517]/60 border border-pink-400/30 p-3 sm:p-4 rounded-xl text-center">
            <div className="text-xs sm:text-sm text-gray-400">Assertiveness</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-400">
              {(metrics.assertiveness / Math.max(1, currentScenario + 1)).toFixed(0)}
            </div>
          </div>
          <div className="bg-[#041517]/60 border border-pink-400/30 p-3 sm:p-4 rounded-xl text-center">
            <div className="text-xs sm:text-sm text-gray-400">Resolution</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-400">
              {(metrics.resolution / Math.max(1, currentScenario + 1)).toFixed(0)}
            </div>
          </div>
          <div className="bg-[#041517]/60 border border-pink-400/30 p-3 sm:p-4 rounded-xl text-center">
            <div className="text-xs sm:text-sm text-gray-400">Regulation</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-rose-400">
              {(metrics.regulation / Math.max(1, currentScenario + 1)).toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}