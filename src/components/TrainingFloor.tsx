"use client";

import React from "react";
import BrainShowpiece from "./interactive-brain/BrainShowpiece";
import { GiBrain, GiProcessor } from "react-icons/gi";
import { MdMemory } from "react-icons/md";
import { FaHeartbeat, FaLightbulb, FaMicrophone } from "react-icons/fa";
import { IoPulseSharp } from "react-icons/io5";

const TrainingFloor = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-900/60 to-teal-900/30 backdrop-blur-xl text-white font-sans overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-300"
        style={{ backgroundImage: "url('/images/neural-bg.jpeg')" }}
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none" />

        <div className="p-8 flex-1 flex flex-col">
          {/* ================= TOP STATS ================= */}
          <div className="flex justify-between items-start relative z-10 mb-8">
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.2em] text-emerald-400/80 font-bold uppercase">
                Current Mental Load
              </p>
              <div className="relative w-40 h-14 flex items-center justify-center border-b border-emerald-500/30">
                <div className="text-3xl font-light text-white drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                  75%
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] tracking-[0.2em] text-emerald-400/80 font-bold mb-2 uppercase">
                Steex & Shantha
              </p>
              <div className="space-y-1.5 w-40 ml-auto">
                <ProgressBar width="w-[75%]" color="bg-emerald-400" />
                <ProgressBar width="w-[65%]" color="bg-teal-500" />
                <ProgressBar width="w-[82%]" color="bg-cyan-400" />
              </div>
            </div>
          </div>

          {/* ================= BRAIN AREA ================= */}
          <div className="relative h-[550px] flex items-center justify-center">
            <div className="relative z-20 w-220 h-80 flex items-center justify-center mt-[-60px]">
              <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full animate-pulse" />
              <BrainShowpiece />
            </div>

            {/* ORBIT ICONS */}
            <div className="absolute inset-0 pointer-events-none">
              <CircularAbility
                label="Stress Training"
                icon={<IoPulseSharp />}
                pos="top-[-5%] left-[15%]"
              />
              <CircularAbility
                label="Complex Processing"
                icon={<GiProcessor />}
                pos="top-[30%] left-[20%]"
              />
              <CircularAbility
                label="Voice & Value"
                icon={<FaMicrophone />}
                pos="top-[55%] left-[30%]"
              />

              <CircularAbility
                label="Pattern Match"
                icon={<GiBrain />}
                pos="top-[65%] left-[50%] -translate-x-1/2"
                large
              />

              <CircularAbility
                label="Creativity"
                icon={<FaLightbulb />}
                pos="top-[55%] right-[30%]"
              />
              <CircularAbility
                label="Emotional Intelligence"
                icon={<FaHeartbeat />}
                pos="top-[30%] right-[20%]"
              />
              <CircularAbility
                label="Memory"
                icon={<MdMemory />}
                pos="top-[-5%] right-[15%]"
              />
            </div>
          </div>

          {/* ================= SUGGESTED ================= */}
          <div className="relative z-10 mt-12 mb-20">
            <h2 className="text-lg font-light tracking-wide mb-6 text-emerald-100/50">
              Suggested for Today:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SuggestionCard
                title="Daily Logic Puzzle"
                desc="Devious Musing: Units 3 Modules 1"
              />
              <SuggestionCard
                title="Quick Mind Mixing"
                desc="Decision Making, Task Maturing"
              />
              <SuggestionCard
                title="Pattern Matching"
                desc="Decision Making Scenario Practice"
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
}: {
  label: string;
  pos: string;
  large?: boolean;
  icon: React.ReactNode;
}) => (
  <div className={`absolute ${pos} pointer-events-auto group cursor-pointer`}>
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

const SuggestionCard = ({ title, desc }: { title: string; desc: string }) => (
  <div className="bg-[#0a2024]/40 border border-emerald-900/30 rounded-xl overflow-hidden hover:bg-[#0c2a2f] transition-all duration-300 p-5 shadow-lg">
    <h3 className="text-xs font-bold text-emerald-100 mb-2">{title}</h3>
    <p className="text-[11px] text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default TrainingFloor;
