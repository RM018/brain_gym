"use client";

import React, { useState } from "react";
import BrainShowpiece from "./interactive-brain/BrainShowpiece";
import CreativityModule from "./modules/CreativityModule";
import { GiBrain, GiProcessor } from "react-icons/gi";
import { MdMemory } from "react-icons/md";
import { FaHeartbeat, FaLightbulb, FaMicrophone } from "react-icons/fa";
import { IoPulseSharp } from "react-icons/io5";

/* ================= ABILITY DATA ================= */

const abilityData: Record<
  string,
  {
    title: string;
    icon: React.ReactNode;
    description: string;
    benefits: string[];
    exercises: string[];
  }
> = {
  stress: {
    title: "Stress Training",
    icon: <IoPulseSharp size={48} />,
    description:
      "Build resilience and manage stress effectively through targeted cognitive exercises.",
    benefits: [
      "Enhanced stress tolerance",
      "Improved emotional regulation",
      "Better decision-making under pressure",
      "Increased mental stamina",
    ],
    exercises: [
      "Timed problem-solving challenges",
      "Multi-tasking scenarios",
      "Pressure adaptation drills",
    ],
  },
  processing: {
    title: "Complex Processing",
    icon: <GiProcessor size={48} />,
    description:
      "Enhance your brain's ability to handle complex information and multi-step problems.",
    benefits: [
      "Faster information processing",
      "Improved analytical thinking",
      "Enhanced problem-solving skills",
      "Better multitasking abilities",
    ],
    exercises: [
      "Algorithm puzzles",
      "Sequential reasoning tasks",
      "Data pattern recognition",
    ],
  },
  voice: {
    title: "Voice & Value",
    icon: <FaMicrophone size={48} />,
    description:
      "Develop communication skills and value judgment through interactive scenarios.",
    benefits: [
      "Clear communication skills",
      "Enhanced value assessment",
      "Improved persuasion abilities",
      "Better social cognition",
    ],
    exercises: [
      "Debate simulations",
      "Value ranking exercises",
      "Persuasion challenges",
    ],
  },
  pattern: {
    title: "Pattern Match",
    icon: <GiBrain size={48} />,
    description:
      "Train your brain to recognize patterns, predict outcomes, and make connections.",
    benefits: [
      "Enhanced pattern recognition",
      "Improved predictive thinking",
      "Better abstract reasoning",
      "Increased cognitive flexibility",
    ],
    exercises: [
      "Visual pattern puzzles",
      "Sequence prediction",
      "Analogy challenges",
    ],
  },
  creativity: {
    title: "Creativity",
    icon: <FaLightbulb size={48} />,
    description:
      "Unlock your creative potential through divergent thinking and innovation exercises.",
    benefits: [
      "Enhanced creative thinking",
      "Improved idea generation",
      "Better problem reframing",
      "Increased mental flexibility",
    ],
    exercises: [
      "Brainstorming sessions",
      "Unusual uses tasks",
      "Creative storytelling",
    ],
  },
  emotional: {
    title: "Emotional Intelligence",
    icon: <FaHeartbeat size={48} />,
    description:
      "Develop emotional awareness, empathy, and interpersonal effectiveness.",
    benefits: [
      "Better emotion recognition",
      "Enhanced empathy",
      "Improved relationship skills",
      "Increased self-awareness",
    ],
    exercises: [
      "Emotion identification tasks",
      "Empathy scenarios",
      "Social situation analysis",
    ],
  },
  memory: {
    title: "Memory",
    icon: <MdMemory size={48} />,
    description:
      "Strengthen your memory capacity and recall speed through proven techniques.",
    benefits: [
      "Enhanced memory retention",
      "Faster recall speed",
      "Improved working memory",
      "Better long-term storage",
    ],
    exercises: [
      "Memory palace techniques",
      "Spaced repetition drills",
      "Chunking exercises",
    ],
  },
};

/* ================= MAIN ================= */

const TrainingFloor = () => {
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);
  const [trainingActive, setTrainingActive] = useState(false);

  const handleTrainingComplete = (score: number, profile: any) => {
    console.log("Training complete!", { score, profile });
    // Here you can save the score to your brain metrics
    setTrainingActive(false);
    setSelectedAbility(null);
  };

  const handleStartTraining = () => {
    setTrainingActive(true);
  };

  // Show CreativityModule if training is active for creativity
  if (trainingActive && selectedAbility === 'creativity') {
    return (
      <CreativityModule 
        onComplete={handleTrainingComplete}
        onBack={() => {
          setTrainingActive(false);
          setSelectedAbility(null);
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900/60 to-teal-900/30 backdrop-blur-xl text-white overflow-hidden relative">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/neural-bg.jpeg')" }}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-12">
          {/* TOP BAR */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-emerald-400 uppercase font-bold">
                Current Mental Load
              </p>
              <div className="w-32 h-12 flex items-center justify-center border-b border-emerald-500/30">
                <span className="text-3xl font-light">75%</span>
              </div>
            </div>
            {/* RIGHT */}
            <div className="min-w-0 text-right">
              <p className="text-[9px] sm:text-[10px] tracking-[0.2em] text-emerald-400/80 font-bold uppercase mb-1">
                Steex & Shantha
              </p>
              <div className="space-y-1 w-24 sm:w-40 ml-auto">
                <ProgressBar width="w-[70%]" color="bg-emerald-400" />
                <ProgressBar width="w-[60%]" color="bg-teal-500" />
                <ProgressBar width="w-[78%]" color="bg-cyan-400" />
              </div>
            </div>
          </div>

          {/* ABILITIES + BRAIN */}
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 w-full lg:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-6 -mt-50 ">
              {Object.entries(abilityData).map(([key, val], index, arr) => {
                const isLast = index === arr.length - 1;
                const isOdd = arr.length % 2 !== 0;

                return (
                  <div
                    key={key}
                    className={
                      isLast && isOdd
                        ? "col-span-2 sm:col-span-1 sm:col-start-2 flex justify-center"
                        : "flex justify-center"
                    }
                  >
                    <CircularAbility
                      label={val.title}
                      icon={val.icon}
                      onClick={() => setSelectedAbility(key)}
                    />
                  </div>
                );
              })}
            </div>

            <div
              className="
              order-1 lg:order-2
              w-full lg:w-1/2
              flex justify-center
              mb-0 lg:mb-0
            "
            >
              <div className="relative w-full max-w-[680px] h-[500px] lg:max-w-[940px] lg:h-[760px]">
                <div className="absolute inset-0 bg-emerald-500/10 blur-[200px] rounded-full animate-pulse" />
                <div className="relative w-full h-full overflow-hidden">
                  <BrainShowpiece />
                </div>
              </div>
            </div>
          </div>

          {/* SUGGESTIONS */}
          <div className="-mt-10 lg:-mt-50">
            <h2 className="text-lg font-light tracking-wide mb-6 text-emerald-100/50">
              Suggested for Today:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SuggestionCard
                title="Daily Logic Puzzle"
                desc="Devious Musing – Units 3 Module 1"
              />
              <SuggestionCard
                title="Quick Mind Mixing"
                desc="Decision Making & Task Maturing"
              />
              <SuggestionCard
                title="Pattern Matching"
                desc="Scenario-based Pattern Practice"
              />

              <div className="bg-[#0a2024]/40 border border-emerald-900/30 rounded-xl p-4">
                <p className="text-[9px] text-emerald-400 font-bold mb-2 uppercase">
                  Recent Activity
                </p>
                <ul className="text-[10px] text-gray-400 space-y-2">
                  <li>• +10 Trivia resolved</li>
                  <li>• Memory recall +10 pts</li>
                  <li>• Pattern accuracy improved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {selectedAbility && (
        <AbilityModal
          ability={selectedAbility}
          onClose={() => setSelectedAbility(null)}
          onStartTraining={handleStartTraining}
        />
      )}
    </div>
  );
};

/* ================= COMPONENTS ================= */

const ProgressBar = ({ width, color }: { width: string; color: string }) => (
  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
    <div className={`${width} h-full ${color}`} />
  </div>
);

const CircularAbility = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className="w-[110px] h-[110px]  lg:w-[136px] lg:h-[136px]
      rounded-full flex flex-col items-center justify-center
      bg-[#041517]/80 border border-emerald-400/60
      shadow-[0_0_22px_rgba(16,185,129,0.35)]
      cursor-pointer hover:scale-105 transition"
  >
    <span className="text-2xl  lg:text-3xl text-emerald-300">{icon}</span>
    <span className="text-[9px] uppercase text-emerald-100/80 text-center mt-1">
      {label}
    </span>
  </div>
);

const SuggestionCard = ({ title, desc }: { title: string; desc: string }) => (
  <div className="bg-[#0a2024]/40 border border-emerald-900/30 rounded-xl p-5">
    <h3 className="text-xs font-bold text-emerald-100 mb-2">{title}</h3>
    <p className="text-[11px] text-gray-400">{desc}</p>
  </div>
);

/* ================= MODAL ================= */

const AbilityModal = ({
  ability,
  onClose,
  onStartTraining,
}: {
  ability: string;
  onClose: () => void;
  onStartTraining: () => void;
}) => {
  const data = abilityData[ability];
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-900 to-teal-900 border border-emerald-500/40 rounded-xl sm:rounded-2xl max-w-xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="sticky top-0 float-right w-8 h-8 sm:w-9 sm:h-9
                     rounded-full border border-emerald-400/40
                     text-emerald-300 hover:bg-emerald-400/10 flex items-center justify-center text-lg sm:text-xl z-10 bg-slate-900/80"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-emerald-300 pr-10">
          <span className="text-3xl sm:text-4xl">{data.icon}</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide">
            {data.title}
          </h2>
        </div>

        <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">{data.description}</p>

        <div className="h-px bg-emerald-500/20 mb-4 sm:mb-6" />

        {/* BENEFITS */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-bold uppercase text-emerald-400 mb-2 sm:mb-3">
            🎯 Key Benefits
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-200">
            {data.benefits.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-400 flex-shrink-0">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* EXERCISES */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xs sm:text-sm font-bold uppercase text-emerald-400 mb-2 sm:mb-3">
            💪 Training Exercises
          </h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-200">
            {data.exercises.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-400 flex-shrink-0">→</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onStartTraining}
          className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl
                           bg-gradient-to-r from-emerald-500 to-teal-500
                           font-bold uppercase tracking-wide hover:from-emerald-600 hover:to-teal-600 transition-colors text-sm sm:text-base"
        >
          Start Training Session
        </button>
      </div>
    </div>
  );
};

export default TrainingFloor;
