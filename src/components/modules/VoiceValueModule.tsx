'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScoringEngine } from '@/lib/scoringEngine';
import { BrainMetricsAggregator } from '@/lib/brainMetrics';
import { useUser } from '@/lib/userContext';

export interface VoiceValueModuleProps {
  onComplete: (score: number, profile: any) => void;
  onBack?: () => void;
}

interface Value {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  context: string;
  timePressure: boolean;
  options: {
    text: string;
    valueAlignment: { [key: string]: number };
    impact: string;
  }[];
}

const coreValues: Value[] = [
  {
    id: 'integrity',
    name: 'Integrity',
    icon: '🛡️',
    description: 'Being honest and having strong moral principles'
  },
  {
    id: 'compassion',
    name: 'Compassion',
    icon: '❤️',
    description: 'Showing empathy and caring for others'
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: '🚀',
    description: 'Continuous learning and self-improvement'
  },
  {
    id: 'justice',
    name: 'Justice',
    icon: '⚖️',
    description: 'Fairness and standing up for what is right'
  },
  {
    id: 'courage',
    name: 'Courage',
    icon: '🦁',
    description: 'Being brave and facing challenges head-on'
  },
  {
    id: 'wisdom',
    name: 'Wisdom',
    icon: '🧠',
    description: 'Making thoughtful decisions with understanding'
  }
];

const scenarios: Scenario[] = [
  {
    id: 1,
    title: 'The Promotion Dilemma',
    description: 'Your company offers you a promotion with a 40% raise, but it requires relocating your family away from aging parents who need care.',
    context: 'Career vs. Family',
    timePressure: false,
    options: [
      {
        text: 'Take the promotion - advance your career and provide better for your family',
        valueAlignment: { growth: 25, justice: -10, compassion: -15, courage: 15 },
        impact: 'Professional growth but family strain'
      },
      {
        text: 'Decline and discuss remote work options - maintain family bonds',
        valueAlignment: { compassion: 25, wisdom: 15, integrity: 10, growth: -5 },
        impact: 'Family stability, potential career impact'
      },
      {
        text: 'Ask for 6 months to arrange care before relocating',
        valueAlignment: { wisdom: 20, compassion: 20, integrity: 15, courage: 10 },
        impact: 'Balanced approach with thoughtful planning'
      }
    ]
  },
  {
    id: 2,
    title: 'Speaking Up for Others',
    description: 'You overhear colleagues making discriminatory comments about a coworker. The room goes quiet, waiting to see who will respond.',
    context: 'Individual Leadership',
    timePressure: true,
    options: [
      {
        text: 'Speak up firmly - "That\'s not acceptable. Let\'s treat everyone with respect"',
        valueAlignment: { courage: 30, justice: 25, integrity: 20 },
        impact: 'Sets firm standards, may create tension'
      },
      {
        text: 'Change the subject to avoid confrontation',
        valueAlignment: { courage: -20, justice: -15, integrity: -10 },
        impact: 'Avoids conflict, but allows harm to continue'
      },
      {
        text: 'Pull the colleague aside privately later to discuss',
        valueAlignment: { courage: 15, justice: 20, wisdom: 20, compassion: 10 },
        impact: 'Thoughtful approach that preserves dignity'
      }
    ]
  },
  {
    id: 3,
    title: 'The Ethical Gray Zone',
    description: 'You discover an accounting shortcut that\'s technically legal but ethically questionable. Your boss says "everyone does it."',
    context: 'Professional Ethics',
    timePressure: false,
    options: [
      {
        text: 'Go along with it - it\'s legal and everyone does it',
        valueAlignment: { integrity: -30, wisdom: -15, courage: -20 },
        impact: 'Compromises personal integrity'
      },
      {
        text: 'Refuse to participate and report it to compliance',
        valueAlignment: { integrity: 30, courage: 25, justice: 20 },
        impact: 'Upholds ethics, potential professional risk'
      },
      {
        text: 'Have a respectful conversation with your boss about concerns',
        valueAlignment: { integrity: 25, wisdom: 20, courage: 15, compassion: 10 },
        impact: 'Seeks dialogue while maintaining principles'
      }
    ]
  },
  {
    id: 4,
    title: 'The Difficult Friend',
    description: 'Your close friend has been spreading rumors about someone. You know the truth contradicts what they\'re saying, but confronting them might damage your friendship.',
    context: 'Personal Relationships',
    timePressure: false,
    options: [
      {
        text: 'Let it go to preserve the friendship',
        valueAlignment: { integrity: -20, justice: -25, courage: -10 },
        impact: 'Friendship intact, but truth compromised'
      },
      {
        text: 'Publicly challenge them to make your position clear',
        valueAlignment: { courage: 25, justice: 20, integrity: 15, wisdom: -10 },
        impact: 'Bold and clear, but may escalate conflict'
      },
      {
        text: 'Have a private, caring conversation sharing what you know',
        valueAlignment: { integrity: 25, compassion: 25, wisdom: 20, courage: 15 },
        impact: 'Honest communication with empathy'
      }
    ]
  },
  {
    id: 5,
    title: 'Finding Your Voice in a Group',
    description: 'During a team meeting, an idea is being praised that you believe will fail. Speaking up means contradicting senior leadership.',
    context: 'Organizational Culture',
    timePressure: true,
    options: [
      {
        text: 'Stay silent - don\'t rock the boat',
        valueAlignment: { courage: -25, integrity: -15, wisdom: -10 },
        impact: 'Safe but your insights aren\'t heard'
      },
      {
        text: 'Speak up directly with your concerns',
        valueAlignment: { courage: 30, integrity: 20, wisdom: 15 },
        impact: 'Shows conviction, may be seen as challenging'
      },
      {
        text: 'Ask thoughtful questions that guide them to see the issue',
        valueAlignment: { wisdom: 25, courage: 15, integrity: 20, growth: 15 },
        impact: 'Diplomatic approach that respects hierarchy'
      }
    ]
  }
];

export default function VoiceValueModule({ onComplete, onBack }: VoiceValueModuleProps) {
  const { currentUser } = useUser();
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gamePhase, setGamePhase] = useState<'values' | 'scenarios' | 'results'>('values');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [scenarioScores, setScenarioScores] = useState<{ [key: number]: number }>({});
  const [valueScores, setValueScores] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(t => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, timeRemaining]);

  const currentScenario = scenarios[currentScenarioIndex];
  const hasTimePressure = currentScenario?.timePressure;

  const handleValueToggle = (valueId: string) => {
    setSelectedValues(prev =>
      prev.includes(valueId)
        ? prev.filter(id => id !== valueId)
        : prev.length < 3
        ? [...prev, valueId]
        : prev
    );
  };

  const startScenarios = () => {
    if (selectedValues.length === 0) return;
    setGameStartTime(performance.now());
    setGamePhase('scenarios');
    setTimerActive(true);
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (timeRemaining <= 0 && hasTimePressure) return;

    const option = currentScenario.options[optionIndex];
    const valueScore = Object.entries(option.valueAlignment).reduce((acc, [value, points]) => {
      if (selectedValues.includes(value)) {
        return acc + Math.max(0, points);
      }
      return acc;
    }, 0);

    const speedBonus = hasTimePressure ? Math.max(0, timeRemaining * 2) : 5;
    const totalScore = Math.max(0, valueScore + speedBonus);

    setScenarioScores(prev => ({ ...prev, [currentScenarioIndex]: totalScore }));
    setValueScores(prev => {
      const updated = { ...prev };
      Object.entries(option.valueAlignment).forEach(([value, points]) => {
        updated[value] = (updated[value] || 0) + points;
      });
      return updated;
    });

    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setTimeRemaining(10);
    } else {
      completeGame();
    }
  };

  const completeGame = () => {
    setTimerActive(false);
    const totalRawScore = Object.values(scenarioScores).reduce((a, b) => a + b, 0);
    const consistency = calculateConsistency();
    const alignment = calculateAlignment();

    // Use ScoringEngine
    const scoring = new ScoringEngine();
    const moduleScore = scoring.calculateVoiceValueScore(totalRawScore, consistency, alignment);

    try {
      const aggregator = new BrainMetricsAggregator(currentUser.id);
      aggregator.addSession({
        timestamp: new Date(),
        moduleType: 'voicevalue',
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
      selectedValues,
      valueScores,
      scenarioScores,
      consistency,
      alignment
    };

    setGamePhase('results');
    setTimeout(() => {
      onComplete(moduleScore.normalizedScore, profile);
    }, 4000);
  };

  const calculateConsistency = () => {
    const scores = Object.values(scenarioScores);
    if (scores.length === 0) return 0;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    return Math.round(100 - Math.sqrt(variance));
  };

  const calculateAlignment = () => {
    let totalAlignment = 0;
    Object.values(valueScores).forEach(score => {
      if (score > 0) totalAlignment += score;
    });
    return Math.max(0, Math.min(100, Math.round(totalAlignment / 5)));
  };

  if (gamePhase === 'values') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-indigo-900/40 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a1a2e]/80 border border-violet-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 lg:p-12 max-w-4xl w-full my-auto"
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3 text-center">
            <span className="text-violet-400">VOICE</span>
            <span className="text-pink-400"> & </span>
            <span className="text-cyan-400">VALUE</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-2 sm:mb-3 text-center">
            Discover what truly matters
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8 text-center">
            Choose 3 core values
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            {coreValues.map((value) => (
              <motion.button
                key={value.id}
                onClick={() => handleValueToggle(value.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                  selectedValues.includes(value.id)
                    ? 'bg-violet-500/20 border-violet-400 text-violet-100 shadow-lg shadow-violet-500/50'
                    : 'bg-slate-800/40 border-slate-600/40 text-gray-400 hover:border-violet-400/50'
                }`}
              >
                <div className="text-xl sm:text-2xl md:text-3xl mb-2">{value.icon}</div>
                <div className="font-bold text-sm sm:text-base md:text-lg">{value.name}</div>
                <div className="text-xs text-gray-400 mt-1 line-clamp-2 leading-tight">{value.description}</div>
                {selectedValues.includes(value.id) && (
                  <div className="text-violet-300 text-lg sm:text-xl mt-2">✓</div>
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="flex-1 py-2 sm:py-3 px-4 sm:px-6 text-xs sm:text-sm bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 rounded-lg font-semibold transition-all"
              >
                Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startScenarios}
              disabled={selectedValues.length === 0}
              className={`flex-1 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                selectedValues.length === 0
                  ? 'bg-gray-600/30 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white'
              }`}
            >
              Start ({selectedValues.length}/3)
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gamePhase === 'scenarios') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-indigo-900/40 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl px-0"
        >
          {/* Progress bar */}
          <div className="mb-4 sm:mb-6 bg-slate-800/40 rounded-full h-2">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
              animate={{ width: `${((currentScenarioIndex + 1) / scenarios.length) * 100}%` }}
            />
          </div>

          <div className="bg-[#0a1a2e]/80 border border-violet-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <span className="text-violet-400 font-bold text-sm sm:text-base">
                Scenario {currentScenarioIndex + 1}/{scenarios.length}
              </span>
              {currentScenario?.timePressure && (
                <motion.div
                  animate={{ scale: timeRemaining < 3 ? [1, 1.1, 1] : 1 }}
                  className={`px-3 py-1 rounded-full font-bold text-sm ${
                    timeRemaining < 3
                      ? 'bg-red-500/30 text-red-300'
                      : 'bg-blue-500/30 text-blue-300'
                  }`}
                >
                  ⏱️ {timeRemaining}s
                </motion.div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-white leading-tight">
              {currentScenario?.title}
            </h2>
            <div className="inline-block px-3 py-1 bg-violet-500/20 border border-violet-400/50 rounded-full text-violet-300 text-xs sm:text-sm mb-3 sm:mb-4">
              {currentScenario?.context}
            </div>
            <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
              {currentScenario?.description}
            </p>

            <div className="space-y-2 sm:space-y-3">
              {currentScenario?.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 sm:p-4 text-left bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/50 hover:border-violet-400/50 rounded-lg sm:rounded-xl transition-all group"
                >
                  <div className="flex gap-2 sm:gap-3">
                    <div className="text-xl sm:text-2xl flex-shrink-0">
                      {idx === 0 ? '🎯' : idx === 1 ? '⚡' : '🌟'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-100 group-hover:text-white font-medium text-sm sm:text-base">
                        {option.text}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{option.impact}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (gamePhase === 'results') {
    const totalRawScore = Object.values(scenarioScores).reduce((a, b) => a + b, 0);
    const consistency = calculateConsistency();
    const alignment = calculateAlignment();

    // Recalculate moduleScore for display (or we could store it in state)
    const scoring = new ScoringEngine();
    const moduleScore = scoring.calculateVoiceValueScore(totalRawScore, consistency, alignment);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900/95 to-indigo-900/40 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a1a2e]/80 border border-violet-500/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 max-w-2xl w-full text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl mb-3 sm:mb-4"
          >
            🎉
          </motion.div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400">
            Voice Discovered!
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">
            You've navigated through challenging values decisions
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-violet-400">{moduleScore.normalizedScore}</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">Overall Score</div>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{consistency}</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-1">Consistency</div>
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-left">
            <h3 className="font-bold text-pink-400 mb-2 sm:mb-3 text-sm sm:text-base">Your Core Values:</h3>
            <div className="flex gap-2 flex-wrap">
              {selectedValues.map(valueId => {
                const value = coreValues.find(v => v.id === valueId);
                return (
                  <div
                    key={valueId}
                    className="bg-gradient-to-r from-violet-600/30 to-pink-600/30 border border-violet-400/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm"
                  >
                    <span className="text-base sm:text-lg mr-1.5">{value?.icon}</span>
                    <span className="text-gray-100">{value?.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs sm:text-sm text-gray-400 italic"
          >
            Use your voice with confidence. Your values guide you.
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return null;
}