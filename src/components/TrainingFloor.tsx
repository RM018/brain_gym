"use client";

import React, { useState } from "react";
import BrainShowpiece from "./interactive-brain/BrainShowpiece";
import { GiBrain, GiProcessor } from "react-icons/gi";
import { MdMemory } from "react-icons/md";
import { FaHeartbeat, FaLightbulb, FaMicrophone } from "react-icons/fa";
import { IoPulseSharp } from "react-icons/io5";

const TrainingFloor = () => {
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900/60 to-teal-900/30 backdrop-blur-xl text-white font-sans overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-300"
        style={{ backgroundImage: "url('/images/neural-bg.jpeg')" }}
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

        <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col">
          {/* ================= TOP STATS ================= */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-start relative z-10 mb-6 md:mb-8 gap-4 md:gap-0">
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.2em] text-emerald-400/80 font-bold uppercase">
                Current Mental Load
              </p>
              <div className="relative w-32 md:w-40 h-12 md:h-14 flex items-center justify-center border-b border-emerald-500/30">
                <div className="text-2xl md:text-3xl font-light text-white drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                  75%
                </div>
              </div>
            </div>

            <div className="md:text-right w-full md:w-auto">
              <p className="text-[10px] tracking-[0.2em] text-emerald-400/80 font-bold mb-2 uppercase">
                Steex & Shantha
              </p>
              <div className="space-y-1.5 w-full md:w-40 md:ml-auto">
                <ProgressBar width="w-[75%]" color="bg-emerald-400" />
                <ProgressBar width="w-[65%]" color="bg-teal-500" />
                <ProgressBar width="w-[82%]" color="bg-cyan-400" />
              </div>
            </div>
          </div>

          {/* ================= BRAIN AREA ================= */}
          <div className="relative h-[350px] md:h-[450px] lg:h-[550px] flex items-center justify-center">
            <div className="relative z-20 w-full max-w-[480px] h-[220px] md:h-[320px] lg:h-[420px] flex items-center justify-center mt-[-40px] md:mt-[-60px] mx-auto">
              <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full animate-pulse" />
              <div className="w-full h-full rounded-xl overflow-hidden">
                <BrainShowpiece />
              </div>
            </div>

            {/* ORBIT ICONS */}
            <div className="absolute inset-0 pointer-events-none">
              <CircularAbility
                label="Stress Training"
                icon={<IoPulseSharp />}
                pos="top-[-5%] left-[15%]"
                className="hidden md:block"
                onClick={() => setSelectedAbility("stress")}
              />
              <CircularAbility
                label="Complex Processing"
                icon={<GiProcessor />}
                pos="top-[30%] left-[20%]"
                className="hidden lg:block"
                onClick={() => setSelectedAbility("processing")}
              />
              <CircularAbility
                label="Voice & Value"
                icon={<FaMicrophone />}
                pos="top-[55%] left-[30%]"
                className="hidden md:block"
                onClick={() => setSelectedAbility("voice")}
              />

              <CircularAbility
                label="Pattern Match"
                icon={<GiBrain />}
                pos="top-[65%] left-[50%] -translate-x-1/2"
                large
                onClick={() => setSelectedAbility("pattern")}
              />

              <CircularAbility
                label="Creativity"
                icon={<FaLightbulb />}
                pos="top-[55%] right-[30%]"
                className="hidden md:block"
                onClick={() => setSelectedAbility("creativity")}
              />
              <CircularAbility
                label="Emotional Intelligence"
                icon={<FaHeartbeat />}
                pos="top-[30%] right-[20%]"
                className="hidden lg:block"
                onClick={() => setSelectedAbility("emotional")}
              />
              <CircularAbility
                label="Memory"
                icon={<MdMemory />}
                pos="top-[-5%] right-[15%]"
                className="hidden md:block"
                onClick={() => setSelectedAbility("memory")}
              />
            </div>
          </div>

          {/* ================= SUGGESTED ================= */}
          <div className="relative z-10 mt-8 md:mt-12 mb-12 md:mb-20">
            <h2 className="text-base md:text-lg font-light tracking-wide mb-4 md:mb-6 text-emerald-100/50">
              Suggested for Today:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SuggestionCard
                title="Daily Logic Puzzle"
                desc="Devious Musing: Units 3 Modules 1"
                bgImage="/images/daily_logic.png"
              />
              <SuggestionCard
                title="Quick Mind Mixing"
                desc="Decision Making, Task Maturing"
                bgImage="/images/mind_mixing.png"
              />
              <SuggestionCard
                title="Pattern Matching"
                desc="Decision Making Scenario Practice"
                bgImage="/images/pattern_match.png"
              />

              <div className="bg-[#0a2024]/40 border border-emerald-900/30 rounded-xl p-4 backdrop-blur-md flex flex-col justify-center shadow-lg">
                <p className="text-[9px] text-emerald-400 font-bold mb-2 tracking-widest uppercase">
                  Recent Activity
                </p>
                <ul className="text-[10px] space-y-2 text-gray-400">
                  <li>• +10 Trivia resolved</li>
                  <li>• Memory recall +10 pts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ability Detail Modal */}
      {selectedAbility && (
        <AbilityModal
          ability={selectedAbility}
          onClose={() => setSelectedAbility(null)}
        />
      )}
    </div>
  );
};

/* ================= SUB COMPONENTS ================= */

const ProgressBar = ({ width, color }: { width: string; color: string }) => (
  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
    <div
      className={`${width} h-full ${color} shadow-[0_0_8px_rgba(52,211,153,0.4)] transition-all duration-1000`}
    />
  </div>
);

/* 🔥 UPDATED CIRCULAR ABILITY – OUTLINE STYLE ONLY */
const CircularAbility = ({
  label,
  pos,
  large,
  icon,
  className,
  onClick,
}: {
  label: string;
  pos: string;
  large?: boolean;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div 
    className={`absolute ${pos} pointer-events-auto group cursor-pointer ${className || ''}`}
    onClick={onClick}
  >
    <div
      className={`relative ${
        large ? "w-42 h-42" : "w-42 h-42"
      } flex items-center justify-center`}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full bg-[#061b26]/85 group-hover:bg-[#0a2a3a] blur-2xl opacity-60 group-hover:opacity-100 transition"
      />

      {/* Outline Ring */}
      <div
        className={`
          relative rounded-full
          ${large ? "w-42 h-42" : "w-42 h-42"}
          border border-emerald-400/60
          bg-[#041517]/80
          group-hover:bg-[#062326]
          shadow-[0_0_22px_rgba(16,185,129,0.35)]
          group-hover:shadow-[0_0_45px_rgba(16,185,129,0.75)]
          transition-all duration-300
          flex flex-col items-center justify-center
          backdrop-blur-md
        `}
      >
        <span className="text-3xl text-emerald-300 mb-1 group-hover:drop-shadow-[0_0_12px_#10b981]">
          {icon}
        </span>

        <span className="text-[11px] font-semibold tracking-wide uppercase text-emerald-100/80 group-hover:text-white text-center">
          {label}
        </span>

        {/* Inner thin ring */}
        <div className="absolute inset-3 rounded-full border border-emerald-400/20" />
      </div>

      {/* Pulse */}
      <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping" />
    </div>
  </div>
);

const SuggestionCard = ({
  title,
  desc,
  bgImage,
}: {
  title: string;
  desc: string;
  bgImage?: string;
}) => (
  <div
    className="relative rounded-xl overflow-hidden shadow-lg border border-emerald-900/30 transition-all duration-300 hover:scale-1.01"
    style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
  >
    <div className="absolute inset-0 bg-[#021013]/40" />
    <div className="relative p-5">
      <h3 className="text-xs font-bold text-emerald-100 mb-2">{title}</h3>
      <p className="text-[11px] text-gray-300 leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ================= ABILITY MODAL ================= */
const AbilityModal = ({ ability, onClose }: { ability: string; onClose: () => void }) => {
  const abilityData: Record<string, { title: string; icon: React.ReactNode; description: string; benefits: string[]; exercises: string[] }> = {
    stress: {
      title: "Stress Training",
      icon: <IoPulseSharp size={48} />,
      description: "Build resilience and manage stress effectively through targeted cognitive exercises.",
      benefits: [
        "Enhanced stress tolerance",
        "Improved emotional regulation",
        "Better decision-making under pressure",
        "Increased mental stamina"
      ],
      exercises: [
        "Timed problem-solving challenges",
        "Multi-tasking scenarios",
        "Pressure adaptation drills"
      ]
    },
    processing: {
      title: "Complex Processing",
      icon: <GiProcessor size={48} />,
      description: "Enhance your brain's ability to handle complex information and multi-step problems.",
      benefits: [
        "Faster information processing",
        "Improved analytical thinking",
        "Enhanced problem-solving skills",
        "Better multitasking abilities"
      ],
      exercises: [
        "Algorithm puzzles",
        "Sequential reasoning tasks",
        "Data pattern recognition"
      ]
    },
    voice: {
      title: "Voice & Value",
      icon: <FaMicrophone size={48} />,
      description: "Develop communication skills and value judgment through interactive scenarios.",
      benefits: [
        "Clear communication skills",
        "Enhanced value assessment",
        "Improved persuasion abilities",
        "Better social cognition"
      ],
      exercises: [
        "Debate simulations",
        "Value ranking exercises",
        "Persuasion challenges"
      ]
    },
    pattern: {
      title: "Pattern Match",
      icon: <GiBrain size={48} />,
      description: "Train your brain to recognize patterns, predict outcomes, and make connections.",
      benefits: [
        "Enhanced pattern recognition",
        "Improved predictive thinking",
        "Better abstract reasoning",
        "Increased cognitive flexibility"
      ],
      exercises: [
        "Visual pattern puzzles",
        "Sequence prediction",
        "Analogy challenges"
      ]
    },
    creativity: {
      title: "Creativity",
      icon: <FaLightbulb size={48} />,
      description: "Unlock your creative potential through divergent thinking and innovation exercises.",
      benefits: [
        "Enhanced creative thinking",
        "Improved idea generation",
        "Better problem reframing",
        "Increased mental flexibility"
      ],
      exercises: [
        "Brainstorming sessions",
        "Unusual uses tasks",
        "Creative storytelling"
      ]
    },
    emotional: {
      title: "Emotional Intelligence",
      icon: <FaHeartbeat size={48} />,
      description: "Develop emotional awareness, empathy, and interpersonal effectiveness.",
      benefits: [
        "Better emotion recognition",
        "Enhanced empathy",
        "Improved relationship skills",
        "Increased self-awareness"
      ],
      exercises: [
        "Emotion identification tasks",
        "Empathy scenarios",
        "Social situation analysis"
      ]
    },
    memory: {
      title: "Memory",
      icon: <MdMemory size={48} />,
      description: "Strengthen your memory capacity and recall speed through proven techniques.",
      benefits: [
        "Enhanced memory retention",
        "Faster recall speed",
        "Improved working memory",
        "Better long-term storage"
      ],
      exercises: [
        "Memory palace techniques",
        "Spaced repetition drills",
        "Chunking exercises"
      ]
    }
  };

  const data = abilityData[ability];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-gradient-to-br from-slate-900/95 to-teal-900/90 rounded-2xl border-2 border-emerald-500/40 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-emerald-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 flex items-center justify-center text-emerald-300 hover:text-white transition-all z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-emerald-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-emerald-400">
              {data.icon}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-emerald-100 uppercase tracking-wide">
              {data.title}
            </h2>
          </div>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Benefits */}
          <div>
            <h3 className="text-lg font-bold text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-xl">🎯</span> Key Benefits
            </h3>
            <ul className="space-y-2">
              {data.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exercises */}
          <div>
            <h3 className="text-lg font-bold text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-xl">💪</span> Training Exercises
            </h3>
            <ul className="space-y-2">
              {data.exercises.map((exercise, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400 mt-0.5">→</span>
                  <span>{exercise}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50">
              Start Training Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingFloor;
