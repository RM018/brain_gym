 'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LeadershipModuleProps {
  onComplete: (score: number, decisions: DecisionData[]) => void;
  onBack: () => void;
  difficulty?: number;
}

interface DecisionData {
  quality: number;
  speed: number;
  outcome: number;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  timePressure: boolean;
  options: {
    text: string;
    impact: {
      leadership: number;
      integrity: number;
      effectiveness: number;
      confidence: number;
      special?: string;
    };
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

const scenarios: Scenario[] = [
  {
    id: 1,
    title: 'Critical Deadline Approaching',
    description: 'You\'re managing a critical project that\'s behind schedule. Two approaches conflict, and stakeholders demand daily updates. How do you lead?',
    timePressure: true,
    options: [
      {
        text: 'Make decisive call and communicate clearly (assertive leadership)',
        impact: { leadership: 20, integrity: 15, effectiveness: 25, confidence: 20 },
        riskLevel: 'medium'
      },
      {
        text: 'Take time to build consensus despite pressure (collaborative)',
        impact: { leadership: 10, integrity: 25, effectiveness: 10, confidence: -5 },
        riskLevel: 'low'
      },
      {
        text: 'Delegate decision to avoid responsibility (avoidant)',
        impact: { leadership: -20, integrity: -15, effectiveness: -10, confidence: -25 },
        riskLevel: 'high'
      },
      {
        text: 'Request extension and explain situation (transparent)',
        impact: { leadership: 15, integrity: 30, effectiveness: 5, confidence: 10, special: 'Stakeholder Trust' },
        riskLevel: 'medium'
      },
    ],
  },
  {
    id: 2,
    title: 'Resource Allocation Dilemma',
    description: 'Budget cuts force tough choices. High-visibility project vs strategic long-term initiative. Your decision defines your leadership priorities.',
    timePressure: false,
    options: [
      {
        text: 'Choose high-visibility for career advancement (political)',
        impact: { leadership: -10, integrity: -20, effectiveness: 15, confidence: 5 },
        riskLevel: 'high'
      },
      {
        text: 'Invest in strategic long-term value (principled)',
        impact: { leadership: 25, integrity: 30, effectiveness: 20, confidence: 15, special: 'Visionary Leader' },
        riskLevel: 'medium'
      },
      {
        text: 'Split resources to please everyone (indecisive)',
        impact: { leadership: -15, integrity: -10, effectiveness: -20, confidence: -15 },
        riskLevel: 'high'
      },
      {
        text: 'Present data-driven case for more budget (proactive)',
        impact: { leadership: 30, integrity: 20, effectiveness: 25, confidence: 25, special: 'Executive Presence' },
        riskLevel: 'medium'
      },
    ],
  },
  {
    id: 3,
    title: 'Performance Management Challenge',
    description: 'A key contributor is underperforming. Rumors suggest personal issues. You must address it while showing empathy.',
    timePressure: false,
    options: [
      {
        text: 'Immediate formal performance plan (rigid)',
        impact: { leadership: -10, integrity: 10, effectiveness: 15, confidence: 5 },
        riskLevel: 'high'
      },
      {
        text: 'Private empathetic conversation first (human-centered)',
        impact: { leadership: 25, integrity: 30, effectiveness: 20, confidence: 20, special: 'Emotional Intelligence' },
        riskLevel: 'low'
      },
      {
        text: 'Ignore hoping it resolves itself (avoidant)',
        impact: { leadership: -30, integrity: -25, effectiveness: -30, confidence: -20 },
        riskLevel: 'high'
      },
      {
        text: 'Balance support with clear expectations (balanced)',
        impact: { leadership: 30, integrity: 25, effectiveness: 30, confidence: 25 },
        riskLevel: 'low'
      },
    ],
  },
  {
    id: 4,
    title: 'Impossible Client Demand',
    description: 'Major client demands something that conflicts with your professional judgment. Pushing back risks the relationship.',
    timePressure: true,
    options: [
      {
        text: 'Firmly push back with evidence (principled)',
        impact: { leadership: 20, integrity: 35, effectiveness: 10, confidence: 15, special: 'Professional Integrity' },
        riskLevel: 'high'
      },
      {
        text: 'Agree to unrealistic terms (compliant)',
        impact: { leadership: -25, integrity: -30, effectiveness: -15, confidence: -20 },
        riskLevel: 'high'
      },
      {
        text: 'Negotiate realistic middle ground (diplomatic)',
        impact: { leadership: 25, integrity: 20, effectiveness: 25, confidence: 20 },
        riskLevel: 'medium'
      },
      {
        text: 'Propose innovative alternative solution (creative)',
        impact: { leadership: 35, integrity: 25, effectiveness: 35, confidence: 30, special: 'Innovation' },
        riskLevel: 'low'
      },
    ],
  },
  {
    id: 5,
    title: 'Cross-Department Conflict',
    description: 'Another department\'s actions caused problems you\'re blamed for. Tensions are high. Your response matters.',
    timePressure: false,
    options: [
      {
        text: 'Publicly defend yourself aggressively (combative)',
        impact: { leadership: -15, integrity: -10, effectiveness: -20, confidence: 10 },
        riskLevel: 'high'
      },
      {
        text: 'Accept blame to keep peace (martyr)',
        impact: { leadership: -25, integrity: -20, effectiveness: -15, confidence: -30 },
        riskLevel: 'high'
      },
      {
        text: 'Document facts objectively without blame (professional)',
        impact: { leadership: 20, integrity: 30, effectiveness: 25, confidence: 20 },
        riskLevel: 'low'
      },
      {
        text: 'Lead collaborative solution process (constructive)',
        impact: { leadership: 35, integrity: 30, effectiveness: 35, confidence: 30, special: 'Collaboration Master' },
        riskLevel: 'medium'
      },
    ],
  },
  {
    id: 6,
    title: 'Technical Debt Crisis',
    description: 'Massive technical debt slows everything. Team divided on approach: complete rewrite vs incremental fixes.',
    timePressure: true,
    options: [
      {
        text: 'Approve risky complete rewrite (bold)',
        impact: { leadership: 15, integrity: 10, effectiveness: -5, confidence: 20 },
        riskLevel: 'high'
      },
      {
        text: 'Champion incremental sustainable approach (pragmatic)',
        impact: { leadership: 30, integrity: 25, effectiveness: 30, confidence: 25, special: 'Strategic Thinking' },
        riskLevel: 'low'
      },
      {
        text: 'Continue patching to avoid decision (passive)',
        impact: { leadership: -30, integrity: -20, effectiveness: -35, confidence: -25 },
        riskLevel: 'high'
      },
      {
        text: 'Secure dedicated resources for proper fix (resourceful)',
        impact: { leadership: 35, integrity: 20, effectiveness: 35, confidence: 30 },
        riskLevel: 'medium'
      },
    ],
  },
  {
    id: 7,
    title: 'Key Departure',
    description: 'Your most skilled team member resigned. They hold critical knowledge. You have two weeks for transition.',
    timePressure: true,
    options: [
      {
        text: 'Panic and make desperate counteroffer (reactive)',
        impact: { leadership: -20, integrity: -15, effectiveness: -10, confidence: -25 },
        riskLevel: 'high'
      },
      {
        text: 'Focus on thorough knowledge transfer (prepared)',
        impact: { leadership: 25, integrity: 30, effectiveness: 25, confidence: 20 },
        riskLevel: 'low'
      },
      {
        text: 'Use as opportunity to develop others (opportunistic)',
        impact: { leadership: 30, integrity: 25, effectiveness: 30, confidence: 25, special: 'Talent Developer' },
        riskLevel: 'medium'
      },
      {
        text: 'Already have succession plan ready (proactive)',
        impact: { leadership: 40, integrity: 30, effectiveness: 40, confidence: 35, special: 'Prepared Leader' },
        riskLevel: 'low'
      },
    ],
  },
  {
    id: 8,
    title: 'Ethical Dilemma',
    description: 'Senior leadership asks you to misrepresent project status. Refusing could damage your career. Your ethics are tested.',
    timePressure: false,
    options: [
      {
        text: 'Refuse firmly on principle (courageous)',
        impact: { leadership: 35, integrity: 50, effectiveness: 15, confidence: 30, special: 'Ethical Courage' },
        riskLevel: 'high'
      },
      {
        text: 'Present truthful alternative metrics (creative integrity)',
        impact: { leadership: 30, integrity: 35, effectiveness: 30, confidence: 25 },
        riskLevel: 'medium'
      },
      {
        text: 'Comply reluctantly (compromised)',
        impact: { leadership: -35, integrity: -50, effectiveness: 10, confidence: -30 },
        riskLevel: 'high'
      },
      {
        text: 'Escalate to proper channels (procedural)',
        impact: { leadership: 25, integrity: 40, effectiveness: 20, confidence: 20 },
        riskLevel: 'medium'
      },
    ],
  },
  {
    id: 9,
    title: 'Burnout Recognition',
    description: 'You recognize signs of severe burnout in yourself and others. Critical deliverables are due. Your health and leadership are at stake.',
    timePressure: true,
    options: [
      {
        text: 'Push through with willpower (unsustainable)',
        impact: { leadership: -30, integrity: -25, effectiveness: -20, confidence: -35 },
        riskLevel: 'high'
      },
      {
        text: 'Take radical step to pause and recover (self-aware)',
        impact: { leadership: 30, integrity: 35, effectiveness: 15, confidence: 25, special: 'Self-Leadership' },
        riskLevel: 'high'
      },
      {
        text: 'Adjust scope to sustainable pace (balanced)',
        impact: { leadership: 35, integrity: 30, effectiveness: 30, confidence: 30 },
        riskLevel: 'medium'
      },
      {
        text: 'Delegate and trust others (empowering)',
        impact: { leadership: 30, integrity: 25, effectiveness: 25, confidence: 20 },
        riskLevel: 'medium'
      },
    ],
  },
  {
    id: 10,
    title: 'Innovation vs Stability',
    description: 'Pressure to adopt risky new technology vs proven stability. Your decision sets long-term direction. Both sides are compelling.',
    timePressure: false,
    options: [
      {
        text: 'Adopt new tech aggressively (progressive)',
        impact: { leadership: 15, integrity: 10, effectiveness: 5, confidence: 20 },
        riskLevel: 'high'
      },
      {
        text: 'Stay with proven stability (conservative)',
        impact: { leadership: 10, integrity: 15, effectiveness: 25, confidence: 10 },
        riskLevel: 'low'
      },
      {
        text: 'Run controlled proof of concept (scientific)',
        impact: { leadership: 30, integrity: 25, effectiveness: 30, confidence: 25, special: 'Strategic Innovation' },
        riskLevel: 'medium'
      },
      {
        text: 'Make decision based on data and vision (principled)',
        impact: { leadership: 35, integrity: 30, effectiveness: 35, confidence: 30 },
        riskLevel: 'low'
      },
    ],
  },
];

export default function LeadershipModule({ onComplete, onBack, difficulty = 5 }: LeadershipModuleProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [leadershipScore, setLeadershipScore] = useState(50);
  const [integrityScore, setIntegrityScore] = useState(50);
  const [effectivenessScore, setEffectivenessScore] = useState(50);
  const [confidenceScore, setConfidenceScore] = useState(50);
  const [decisions, setDecisions] = useState<DecisionData[]>([]);
  const [decisionStartTime, setDecisionStartTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastImpact, setLastImpact] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [specialEvents, setSpecialEvents] = useState<string[]>([]);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (timeLeft === null || !gameStarted) return;
    
    if (timeLeft <= 0) {
      // Auto-select first option on timeout
      makeDecision(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setDecisionStartTime(performance.now());
    if (scenarios[0].timePressure) {
      setTimeLeft(30);
    }
  };

  const makeDecision = (optionIndex: number) => {
    const decisionTime = performance.now() - decisionStartTime;
    const scenario = scenarios[currentScenario];
    const option = scenario.options[optionIndex];

    // Calculate decision quality
    const baseQuality = (option.impact.leadership + option.impact.integrity + option.impact.effectiveness + option.impact.confidence) / 4;
    const timeBonus = scenario.timePressure ? Math.max(0, 20 - (decisionTime / 100)) : 0;
    const quality = baseQuality + timeBonus;
    
    // Speed score
    const speedScore = scenario.timePressure 
      ? Math.max(0, 100 - (decisionTime / 50))
      : Math.max(0, 100 - (decisionTime / 100));

    // Update scores with difficulty modifier
    const diffMultiplier = 0.5 + (difficulty * 0.1);
    setLeadershipScore(prev => Math.max(0, Math.min(100, prev + option.impact.leadership * diffMultiplier)));
    setIntegrityScore(prev => Math.max(0, Math.min(100, prev + option.impact.integrity * diffMultiplier)));
    setEffectivenessScore(prev => Math.max(0, Math.min(100, prev + option.impact.effectiveness * diffMultiplier)));
    setConfidenceScore(prev => Math.max(0, Math.min(100, prev + option.impact.confidence * diffMultiplier)));

    // Record special events
    if (option.impact.special) {
      setSpecialEvents(prev => [...prev, option.impact.special!]);
    }

    const outcomeScore = (option.impact.leadership + option.impact.integrity + option.impact.effectiveness) / 3;

    setDecisions(prev => [
      ...prev,
      {
        quality,
        speed: speedScore,
        outcome: Math.max(0, Math.min(100, 50 + outcomeScore)),
      },
    ]);

    // Show result
    const impactText = `
      Leadership ${option.impact.leadership >= 0 ? '+' : ''}${option.impact.leadership} 
      | Integrity ${option.impact.integrity >= 0 ? '+' : ''}${option.impact.integrity}
      | Effectiveness ${option.impact.effectiveness >= 0 ? '+' : ''}${option.impact.effectiveness}
      | Confidence ${option.impact.confidence >= 0 ? '+' : ''}${option.impact.confidence}
      ${option.impact.special ? `| ${option.impact.special}` : ''}
    `;
    setLastImpact(impactText);
    setShowResult(true);
    setTimeLeft(null);

    setTimeout(() => {
      setShowResult(false);
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(prev => prev + 1);
        setDecisionStartTime(performance.now());
        if (scenarios[currentScenario + 1].timePressure) {
          setTimeLeft(30);
        }
      } else {
        // Game complete - show final results
        const calculatedFinalScore = (leadershipScore + integrityScore + effectivenessScore + confidenceScore) / 4;
        setFinalScore(calculatedFinalScore);
        setShowFinalResults(true);
        
        setTimeout(() => {
          onComplete(calculatedFinalScore, decisions);
        }, 5000);
      }
    }, 2500);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-purple-900/40 backdrop-blur-xl p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 border border-purple-500/40 rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl w-full backdrop-blur-lg"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 sm:mb-6 text-center">
            LEADERSHIP CRISIS SIMULATOR
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-3 sm:mb-4 text-center">
            High-Stakes Decision Making Under Pressure
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-8 sm:mb-10 text-center max-w-2xl mx-auto">
            Face {scenarios.length} intense leadership scenarios. Every choice impacts your leadership profile. 
            Build your reputation through wise decisions.
          </p>

          <div className="mb-8 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-400 text-center">
              Your Leadership Attributes:
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-800/60 border border-slate-700 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">👑</span>
                  </div>
                  <div>
                    <div className="font-bold text-base sm:text-lg">Leadership</div>
                    <div className="text-xs sm:text-sm text-gray-400">Your ability to lead</div>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-blue-400 h-2 sm:h-3 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">⚖️</span>
                  </div>
                  <div>
                    <div className="font-bold text-base sm:text-lg">Integrity</div>
                    <div className="text-xs sm:text-sm text-gray-400">Ethical standards</div>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-green-400 h-2 sm:h-3 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">🎯</span>
                  </div>
                  <div>
                    <div className="font-bold text-base sm:text-lg">Effectiveness</div>
                    <div className="text-xs sm:text-sm text-gray-400">Results delivery</div>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-purple-400 h-2 sm:h-3 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl">💪</span>
                  </div>
                  <div>
                    <div className="font-bold text-base sm:text-lg">Confidence</div>
                    <div className="text-xs sm:text-sm text-gray-400">Self-assurance</div>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-yellow-400 h-2 sm:h-3 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8">
            <h4 className="text-lg sm:text-xl font-bold text-green-400 mb-2 sm:mb-3">
              Challenge Level: {difficulty}/10
            </h4>
            <div className="w-full bg-slate-900 rounded-full h-3 sm:h-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${difficulty * 10}%` }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 sm:h-4 rounded-full"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-base sm:text-lg font-bold transition-colors"
            >
              ← Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="flex-1 px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xl sm:text-2xl font-bold shadow-lg shadow-purple-500/50"
            >
              START CHALLENGE
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showFinalResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-purple-900/40 backdrop-blur-xl p-3 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 border border-purple-500/40 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-4xl w-full"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-6 sm:mb-8 text-center">
            LEADERSHIP PROFILE
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-slate-800/60 border border-purple-400/30 p-4 sm:p-6 rounded-xl text-center">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">Overall Leadership Score</div>
              <div className="text-4xl sm:text-5xl font-bold text-purple-400">
                {finalScore.toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">
                {finalScore >= 80 ? 'Exceptional Leader' : finalScore >= 60 ? 'Strong Leader' : finalScore >= 40 ? 'Developing Leader' : 'Needs Growth'}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-purple-400/30 p-4 sm:p-6 rounded-xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Leadership Attributes</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Leadership:</span>
                  <span className="font-bold text-blue-400 text-sm sm:text-base">
                    {leadershipScore.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Integrity:</span>
                  <span className="font-bold text-green-400 text-sm sm:text-base">
                    {integrityScore.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Effectiveness:</span>
                  <span className="font-bold text-purple-400 text-sm sm:text-base">
                    {effectivenessScore.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">Confidence:</span>
                  <span className="font-bold text-yellow-400 text-sm sm:text-base">
                    {confidenceScore.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-purple-400/30 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
            <div className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-purple-300">Performance Breakdown:</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Leadership</span>
                  <span className="text-sm text-blue-400">{leadershipScore.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-blue-400 h-2 sm:h-3 rounded-full" style={{ width: `${leadershipScore}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Integrity</span>
                  <span className="text-sm text-green-400">{integrityScore.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-green-400 h-2 sm:h-3 rounded-full" style={{ width: `${integrityScore}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Effectiveness</span>
                  <span className="text-sm text-purple-400">{effectivenessScore.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-purple-400 h-2 sm:h-3 rounded-full" style={{ width: `${effectivenessScore}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Confidence</span>
                  <span className="text-sm text-yellow-400">{confidenceScore.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 sm:h-3">
                  <div className="bg-yellow-400 h-2 sm:h-3 rounded-full" style={{ width: `${confidenceScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {specialEvents.length > 0 && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 p-4 sm:p-6 rounded-xl">
              <div className="font-bold mb-2 sm:mb-3 text-purple-300 text-sm sm:text-base">🏆 Special Achievements:</div>
              <div className="flex flex-wrap gap-2">
                {specialEvents.map((event, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/20 border border-purple-400/40 rounded-full text-xs sm:text-sm"
                  >
                    {event}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  const scenario = scenarios[currentScenario];

  return (
    <div className="flex flex-col w-full h-screen bg-gradient-to-b from-slate-900 to-purple-900/40 backdrop-blur-xl overflow-hidden">
      {/* Enhanced HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex-shrink-0 border-b border-purple-500/20">
        <div className="bg-slate-900/80 border border-purple-500/40 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
          <div className="text-xs text-gray-400">SCENARIO</div>
          <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold">{currentScenario + 1}<span className="text-xs sm:text-sm">/{scenarios.length}</span></div>
        </div>
        <div className="bg-slate-900/80 border border-purple-500/40 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
          <div className="text-xs text-gray-400">LEADERSHIP</div>
          <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-blue-400">{leadershipScore.toFixed(0)}</div>
        </div>
        <div className="bg-slate-900/80 border border-purple-500/40 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
          <div className="text-xs text-gray-400">INTEGRITY</div>
          <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-green-400">{integrityScore.toFixed(0)}</div>
        </div>
        <div className="bg-slate-900/80 border border-purple-500/40 px-2 sm:px-3 md:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
          <div className="text-xs text-gray-400">EFFECTIVENESS</div>
          <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-purple-400">{effectivenessScore.toFixed(0)}</div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="max-w-6xl mx-auto w-full">
          {/* Confidence Bar */}
          <div className="mb-3 sm:mb-4 bg-slate-900/80 border border-purple-500/40 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-bold text-yellow-400">CONFIDENCE</span>
              <span className="text-base sm:text-lg font-mono">{confidenceScore.toFixed(0)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <motion.div 
                animate={{ width: `${confidenceScore}%` }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Time Pressure Indicator */}
          {scenario.timePressure && timeLeft !== null && (
            <div className="mb-3 sm:mb-4 bg-slate-900/80 border border-purple-500/40 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-red-400 font-bold">⏰ TIME CRITICAL</span>
                <span className="text-base sm:text-lg font-mono">{timeLeft}s</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <motion.div 
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-slate-900/80 border border-purple-500/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 backdrop-blur-lg"
              >
                <div className="mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {scenario.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${scenario.timePressure ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {scenario.timePressure ? '⏰ TIME PRESSURE' : '🧠 STRATEGIC'}
                    </span>
                    <span className="text-xs text-gray-400">Difficulty: {difficulty}/10</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-4 sm:mb-5 leading-relaxed">
                  {scenario.description}
                </p>

                <div className="grid gap-2 sm:gap-3">
                  {scenario.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => makeDecision(index)}
                      className={`bg-slate-800/60 p-3 sm:p-4 rounded-lg sm:rounded-xl text-left border-2 transition-all text-xs sm:text-sm md:text-base ${
                        option.riskLevel === 'high' 
                          ? 'border-red-500/30 hover:border-red-400' 
                          : option.riskLevel === 'medium'
                          ? 'border-yellow-500/30 hover:border-yellow-400'
                          : 'border-green-500/30 hover:border-green-400'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-1 pr-2">{option.text}</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          option.riskLevel === 'high' 
                            ? 'bg-red-500/20 text-red-400' 
                            : option.riskLevel === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {option.riskLevel.toUpperCase()}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/80 border border-purple-500/40 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center mb-3 sm:mb-4 backdrop-blur-lg"
              >
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">⚡</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mb-3 sm:mb-4">Decision Executed</h3>
                <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm md:text-base text-gray-300 font-mono whitespace-pre-line">
                    {lastImpact}
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  Preparing next scenario...
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Special Events Tracker */}
          {specialEvents.length > 0 && (
            <div className="bg-slate-900/80 border border-purple-500/40 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-lg">
              <h5 className="text-sm sm:text-base font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                🏆 Special Achievements:
              </h5>
              <div className="flex flex-wrap gap-2">
                {specialEvents.map((event, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                    {event}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
