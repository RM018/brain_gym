'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { BrainMetricsAggregator } from "@/lib/brainMetrics";
import type { SessionData } from "@/lib/brainMetrics";
import { useUser } from "@/lib/userContext";
import {
  TrendingUp,
  Brain,
  Target,
  Award,
  Calendar,
  Clock,
  Trophy,
  Star,
  Activity,
  BarChart3,
  ChevronRight,
  Flame,
  CheckCircle2,
} from "lucide-react";

type PeriodEntry = {
  label: string;
  score: number;
  time: number;
  exercises: number;
};

type RidgelineLayer = {
  label: string;
  offset: number;
  color: string;
  opacity: number;
  data: number[];
};

const Progress = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100 },
    },
  };

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const aggRef = useRef<BrainMetricsAggregator | null>(null);
  const { currentUser } = useUser();

  useEffect(() => {
  const agg = new BrainMetricsAggregator(currentUser.id);
  aggRef.current = agg;
  setSessions(agg.getSessions());

  const handleSessionsUpdated = (event: any) => {
    // Only update if the event is for the current user
    if (!event.detail || event.detail.userId === currentUser.id) {
      if (aggRef.current) {
        const updatedSessions = aggRef.current.getSessions();
        setSessions(updatedSessions);
      }
    }
  };
  
  window.addEventListener('sessions-updated', handleSessionsUpdated);
  return () => window.removeEventListener('sessions-updated', handleSessionsUpdated);
}, [currentUser.id]);

  const formatLabel = (d: Date, period: "day" | "week" | "month" | "year"): string => {
    if (period === "day") {
      const hour = d.getHours();
      return `${hour === 0 ? 12 : hour % 12} ${hour < 12 ? "AM" : "PM"}`;
    }
    if (period === "week") {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    }
    if (period === "month") {
      const week = Math.ceil(d.getDate() / 7);
      return `Week ${week}`;
    }
    return [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ][d.getMonth()];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodData: Record<string, any> = useMemo(() => {
    type Raw = { label: string; score: number; time: number; exercises: number };

    const buckets: Record<"day" | "week" | "month" | "year", Raw[]> = {
      day: [], week: [], month: [], year: [],
    };

    sessions.forEach((s) => {
      (["day", "week", "month", "year"] as const).forEach((period) => {
        const label = formatLabel(s.timestamp, period);
        let entry = buckets[period].find((e) => e.label === label);
        if (!entry) {
          entry = { label, score: 0, time: 0, exercises: 0 };
          buckets[period].push(entry);
        }
        entry.score += s.score;
        entry.time += s.duration;
        entry.exercises += s.subscores?.exercises ?? 1;
      });
    });

    const sorters: Record<string, (a: Raw, b: Raw) => number> = {
      day: (a, b) => (parseInt(a.label) || 0) - (parseInt(b.label) || 0),
      week: (a, b) =>
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(a.label) -
        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(b.label),
      month: (a, b) =>
        parseInt(a.label.replace("Week ", "")) - parseInt(b.label.replace("Week ", "")),
      year: (a, b) =>
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(a.label) -
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(b.label),
    };

    Object.entries(buckets).forEach(([period, arr]) => arr.sort(sorters[period]));

    const build = (arr: Raw[]) => {
      const labels = arr.map((e) => e.label);
      const stats = {
        sessions: arr.length,
        avgScore: arr.length ? arr.reduce((a, e) => a + e.score, 0) / arr.length : 0,
        totalTime: `${Math.round(arr.reduce((a, e) => a + e.time, 0) / 3600)}h`,
        exercises: arr.reduce((a, e) => a + e.exercises, 0),
      };

      // --- FIX: Dynamic x positions for the trend line ---
      const chartWidth = 400;  // viewBox width
      const n = arr.length;
      let trendData: number[] = [];
      if (n > 1) {
        const step = chartWidth / (n - 1);
        trendData = arr.map((_, i) => i * step);
      } else if (n === 1) {
        trendData = [chartWidth / 2]; // center single point
      }

      // Map score (0-100) to y coordinate (0 = top, 150 = bottom)
      const trendPoints = arr.map((e) => 150 - (e.score * 1.5)); // 1.5 = 150/100

      // Ridgeline: create a simple distribution (example: triangular shape around score)
      const ridgeline = arr.map((e, i) => ({
        label: e.label,
        offset: i * 50,
        color: "#14b8a6",
        opacity: 0.8,
        data: Array.from({ length: 11 }, (_, j) => {
          // Create a peak at score/10, falling off to sides
          const peak = Math.min(100, e.score) / 10;
          const dist = Math.abs(j - peak);
          return Math.max(0, 1 - dist * 0.2); // simple falloff
        }),
      }));

      return { labels, data: arr, trendData, trendPoints, stats, ridgeline };
    };

    const result: Record<string, unknown> = {};
    (["day", "week", "month", "year"] as const).forEach((p) => {
      result[p] = build(buckets[p]);
    });
    return result;
  }, [sessions]);

  const currentData = periodData[selectedPeriod as keyof typeof periodData];

  const stats = useMemo(() => {
    const total = sessions.length;
    const avg = total ? sessions.reduce((a, s) => a + s.score, 0) / total : 0;
    const totalTime = sessions.reduce((a, s) => a + s.duration, 0);
    const exercises = sessions.reduce((a, s) => a + (s.subscores?.exercises || 1), 0);
    return [
      { label: "Total Sessions", value: total.toString(), change: "+0%", icon: Calendar, color: "from-blue-500 to-cyan-500" },
      { label: "Avg. Score", value: avg.toFixed(1), change: "+0%", icon: TrendingUp, color: "from-teal-500 to-cyan-500" },
      { label: "Total Time", value: `${(totalTime / 3600).toFixed(1)}h`, change: "+0%", icon: Clock, color: "from-amber-500 to-orange-500" },
      { label: "Exercises Done", value: exercises.toString(), change: "+0%", icon: CheckCircle2, color: "from-green-500 to-emerald-500" },
    ];
  }, [sessions]);

  const exerciseTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => counts[s.moduleType] = (counts[s.moduleType] || 0) + 1);
    const total = sessions.length || 1;
    return [
      { name: "Memory", value: Math.round(((counts.memory || 0) / total) * 100 * 100) / 100, color: "from-teal-500 to-cyan-500" },
      { name: "Logic", value: Math.round(((counts.cmi || 0) / total) * 100 * 100) / 100, color: "from-blue-500 to-cyan-500" },
      { name: "Speed", value: Math.round(((counts.pattern || 0) / total) * 100 * 100) / 100, color: "from-amber-500 to-orange-500" },
      { name: "Focus", value: Math.round(((counts.sensory || 0) / total) * 100 * 100) / 100, color: "from-green-500 to-emerald-500" },
    ];
  }, [sessions]);

  const achievements = useMemo(() => {
    const last7 = sessions.slice(-7).length;
    const streak = last7;
    const top10 = false;
    return [
      { icon: Flame, title: `${streak} Day Streak`, description: "Keep it up!", color: "text-orange-400" },
      { icon: Trophy, title: top10 ? "Top 10%" : "—", description: "Among all users", color: "text-yellow-400" },
      { icon: Star, title: "100 Exercises", description: "Milestone reached", color: "text-teal-400" },
      { icon: Target, title: "95% Accuracy", description: "Personal best", color: "text-green-400" },
    ];
  }, [sessions]);

  const skillLevels = useMemo(() => {
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      sums[s.moduleType] = (sums[s.moduleType] || 0) + s.score;
      counts[s.moduleType] = (counts[s.moduleType] || 0) + 1;
    });
    const avgScore = (moduleType: string) => counts[moduleType] ? Math.max(0, Math.min(100, Math.round(sums[moduleType] / counts[moduleType]))) : 0;
    return [
      { name: "Memory Retention", level: avgScore("memory"), maxLevel: 100 },
      { name: "Problem Solving", level: avgScore("cmi"), maxLevel: 100 },
      { name: "Processing Speed", level: avgScore("pattern"), maxLevel: 100 },
      { name: "Pattern Recognition", level: avgScore("pattern"), maxLevel: 100 },
      { name: "Logical Reasoning", level: avgScore("creativity"), maxLevel: 100 },
    ];
  }, [sessions]);

  const radialMetrics = useMemo(() => {
    let focusSum = 0, accSum = 0, speedSum = 0, cnt = 0;
    sessions.forEach((s) => {
      if (s.subscores) {
        focusSum += s.subscores.focusStability || 0;
        accSum += s.subscores.accuracy || 0;
        speedSum += s.subscores.processingSpeed ?? s.subscores.reactionTime ?? 0;
        cnt++;
      }
    });
    const avg = (v: number) => cnt ? Math.max(0, Math.min(100, Math.round(v / cnt))) : 0;
    return { focus: avg(focusSum), accuracy: avg(accSum), speed: avg(speedSum) };
  }, [sessions]);

  const categoryComparison = useMemo(() => {
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      sums[s.moduleType] = (sums[s.moduleType] || 0) + s.score;
      counts[s.moduleType] = (counts[s.moduleType] || 0) + 1;
    });
    const avgScore = (moduleType: string) => counts[moduleType] ? Math.max(0, Math.min(100, Math.round(sums[moduleType] / counts[moduleType]))) : 0;
    return [
      { category: "Stress Training", score: avgScore("sensory"), avg: 70, color: "from-red-500 to-orange-500" },
      { category: "Complex Processing", score: avgScore("cmi"), avg: 70, color: "from-blue-500 to-cyan-500" },
      { category: "Pattern Match", score: avgScore("pattern"), avg: 70, color: "from-teal-500 to-cyan-500" },
      { category: "Creative Thinking", score: avgScore("creativity"), avg: 70, color: "from-amber-500 to-yellow-500" },
      { category: "Emotional Intelligence", score: avgScore("conflict"), avg: 70, color: "from-pink-500 to-rose-500" },
      { category: "Memory", score: avgScore("memory"), avg: 70, color: "from-green-500 to-emerald-500" },
      { category: "Leadership", score: avgScore("leadership"), avg: 70, color: "from-indigo-500 to-purple-500" },
    ];
  }, [sessions]);

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6 md:p-10">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto pb-10">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/50">
                <BarChart3 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Your Progress
                </h1>
                <p className="text-gray-500 text-sm">Track your cognitive training journey</p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1 w-full md:w-auto">
              {["day", "week", "month", "year"].map((period) => (
                <motion.button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all capitalize ${
                    selectedPeriod === period
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {period}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid (unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div key={idx} variants={itemVariants} className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                      <TrendingUp size={14} />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Radial Progress Cards (unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Focus Score</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="60" cy="60" r="50" stroke="url(#focusGradient)" strokeWidth="10" fill="none" strokeLinecap="round"
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * radialMetrics.focus) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ strokeDasharray: 314 }}
                />
                <defs>
                  <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{radialMetrics.focus}%</p>
                  <p className="text-xs text-gray-400 mt-1">{radialMetrics.focus >= 90 ? "Excellent" : radialMetrics.focus >= 70 ? "Good" : "Needs work"}</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Accuracy Rate</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="60" cy="60" r="50" stroke="url(#accuracyGradient)" strokeWidth="10" fill="none" strokeLinecap="round"
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * radialMetrics.accuracy) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  style={{ strokeDasharray: 314 }}
                />
                <defs>
                  <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{radialMetrics.accuracy}%</p>
                  <p className="text-xs text-gray-400 mt-1">{radialMetrics.accuracy >= 90 ? "High" : radialMetrics.accuracy >= 70 ? "Moderate" : "Low"}</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Speed Index</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="60" cy="60" r="50" stroke="url(#speedGradient)" strokeWidth="10" fill="none" strokeLinecap="round"
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * radialMetrics.speed) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                  style={{ strokeDasharray: 314 }}
                />
                <defs>
                  <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{radialMetrics.speed}%</p>
                  <p className="text-xs text-gray-400 mt-1">{radialMetrics.speed >= 90 ? "Fast" : radialMetrics.speed >= 70 ? "Average" : "Slow"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart (unchanged) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {selectedPeriod === "day" ? "Daily" : selectedPeriod === "week" ? "Weekly" : selectedPeriod === "month" ? "Monthly" : "Yearly"} Performance
                </h3>
                <p className="text-sm text-gray-400">Your scores over the past {selectedPeriod}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-400/20">
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-sm text-green-400 font-semibold">
                  +{selectedPeriod === "day" ? "8" : selectedPeriod === "week" ? "12" : selectedPeriod === "month" ? "15" : "22"}% this {selectedPeriod}
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3" style={{ height: "250px" }}>
              {currentData.data.map((data: PeriodEntry, idx: number) => {
                const maxScore = Math.max(...currentData.data.map((d: PeriodEntry) => d.score));
                const height = (data.score / maxScore) * 100;
                const isHighlighted = selectedPeriod === "week" ? idx === 4 : idx === currentData.data.length - 1;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-3" style={{ height: "100%" }}>
                    <div className="relative w-full flex items-end" style={{ height: "220px" }}>
                      <motion.div
                        key={`${selectedPeriod}-${idx}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`w-full rounded-t-xl relative overflow-hidden ${isHighlighted ? "bg-gradient-to-t from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/50" : "bg-gradient-to-t from-slate-700 to-slate-600"}`}
                      >
                        {isHighlighted && (
                          <motion.div
                            animate={{ y: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-x-0 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"
                          />
                        )}
                      </motion.div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <span className={`text-sm font-bold whitespace-nowrap ${isHighlighted ? "text-teal-400" : "text-gray-400"}`}>
                          {data.score > 0 ? data.score : "-"}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${isHighlighted ? "text-teal-400" : "text-gray-500"}`}>{data.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-teal-500 to-cyan-500" />
                <span className="text-xs text-gray-400">
                  {selectedPeriod === "day" ? "Current" : selectedPeriod === "week" ? "Today" : selectedPeriod === "month" ? "This Week" : "This Month"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-slate-700 to-slate-600" />
                <span className="text-xs text-gray-400">Previous</span>
              </div>
            </div>
          </motion.div>

          {/* Pie Chart (unchanged) */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-semibold text-white mb-1">Exercise Types</h3>
            <p className="text-sm text-gray-400 mb-6">Distribution of activities</p>
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {(() => {
                  let currentAngle = 0;
                  return exerciseTypes.map((type, idx) => {
                    const percentage = type.value;
                    const angle = (percentage / 100) * 360;
                    const endAngle = currentAngle + angle;
                    const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                    const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                    const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                    const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
                    const largeArc = angle > 180 ? 1 : 0;
                    const pathData = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`;
                    currentAngle = endAngle;
                    return (
                      <motion.path
                        key={idx}
                        d={pathData}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className={`fill-current bg-gradient-to-br ${type.color}`}
                        style={{ fill: idx === 0 ? "#a855f7" : idx === 1 ? "#3b82f6" : idx === 2 ? "#f59e0b" : "#10b981" }}
                      />
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="25" className="fill-slate-900" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-gray-400">Complete</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {exerciseTypes.map((type, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded bg-gradient-to-br ${type.color}`} />
                    <span className="text-sm text-gray-300">{type.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{type.value.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Trend Line Chart (FIXED) */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Performance Trend</h3>
              <p className="text-sm text-gray-400">
                {selectedPeriod === "day" ? "Hourly" : selectedPeriod === "week" ? "Last 7 days" : selectedPeriod === "month" ? "Last 4 weeks" : "Last 12 months"} overview
              </p>
            </div>
            <TrendingUp className="text-green-400" size={24} />
          </div>

          {/* Line Chart Visualization */}
          <div className="relative h-48">
            <svg className="w-full h-full" viewBox="0 0 400 150">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="0" y1={i * 37.5} x2="400" y2={i * 37.5} stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1" />
              ))}

              {/* Trend line - only if we have points */}
              {currentData.trendData.length > 1 ? (
                <motion.path
                  key={`trend-${selectedPeriod}`}
                  d={`M ${currentData.trendData.map((x: number, i: number) => `${x} ${currentData.trendPoints[i]}`).join(" L ")}`}
                  stroke="url(#trendGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              ) : currentData.trendData.length === 1 ? (
                // Single point: draw a circle as marker (optional)
                <circle cx={currentData.trendData[0]} cy={currentData.trendPoints[0]} r="4" fill="url(#trendGradient)" />
              ) : null}

              {/* Area under curve - only if we have points */}
              {currentData.trendData.length > 1 && (
                <motion.path
                  key={`area-${selectedPeriod}`}
                  d={`M ${currentData.trendData.map((x: number, i: number) => `${x} ${currentData.trendPoints[i]}`).join(" L ")} L 400 150 L 0 150 Z`}
                  fill="url(#areaGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              )}

              {/* Data points */}
              {currentData.trendData.map((x: number, i: number) => {
                const y = currentData.trendPoints[i];
                return (
                  <motion.circle
                    key={`${selectedPeriod}-point-${i}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#14b8a6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.2 }}
                  />
                );
              })}

              <defs>
                <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="rgba(20, 184, 166, 0)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-8 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span>Score Trend</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-green-400">+18% Improvement</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skill Levels (unchanged) */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-xl font-semibold text-white mb-1">Skill Levels</h3><p className="text-sm text-gray-400">Your cognitive abilities breakdown</p></div>
              <Brain className="text-teal-400" size={24} />
            </div>
            <div className="space-y-5">
              {skillLevels.map((skill, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">{skill.name}</span>
                    <span className="text-sm font-bold text-white">{skill.level}/{skill.maxLevel}</span>
                  </div>
                  <div className="relative w-full h-3 bg-slate-800/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-600 rounded-full relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Achievements (unchanged) */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-xl font-semibold text-white mb-1">Achievements</h3><p className="text-sm text-gray-400">Your recent milestones</p></div>
              <Award className="text-yellow-400" size={24} />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    className="group flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className={achievement.color} size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white mb-0.5">{achievement.title}</h4>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                    <ChevronRight className="text-gray-500 group-hover:text-gray-300 transition-colors" size={20} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Performance Comparison (unchanged) */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div><h3 className="text-xl font-semibold text-white mb-1">Category Comparison</h3><p className="text-sm text-gray-400">Your performance across different areas</p></div>
            <BarChart3 className="text-teal-400" size={24} />
          </div>
          <div className="space-y-6">
            {categoryComparison.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{item.category}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-teal-400 font-semibold">You: {item.score}%</span>
                    <span className="text-gray-500">Avg: {item.avg}%</span>
                  </div>
                </div>
                <div className="relative h-8 bg-slate-800/50 rounded-full overflow-hidden">
                  <div className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10" style={{ left: `${item.avg}%` }} />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 1, delay: idx * 0.15 }}
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full flex items-center justify-end pr-3`}
                  >
                    <span className="text-xs font-bold text-white">{item.score}%</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ridgeline Chart (unchanged, but data improved) */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div><h3 className="text-xl font-semibold text-white mb-1">Performance Distribution</h3><p className="text-sm text-gray-400">Score patterns across training sessions</p></div>
            <Activity className="text-teal-400" size={24} />
          </div>
          <div className="relative h-80">
            <svg className="w-full h-full" viewBox="0 0 800 320">
              {currentData.ridgeline.map((layer: RidgelineLayer, layerIdx: number) => {
                const points = layer.data
                  .map((value: number, idx: number) => {
                    const x = 100 + idx * 60;
                    const y = layer.offset + 50 - value * 50; // value is 0-1, scale to 50px height
                    return `${x},${y}`;
                  })
                  .join(" ");
                const pathData = `M ${points} L ${layer.data
                  .map((_, idx: number) => {
                    const x = 100 + (layer.data.length - 1 - idx) * 60;
                    const y = layer.offset + 50;
                    return `${x},${y}`;
                  })
                  .join(" L ")} Z`;
                return (
                  <g key={layerIdx}>
                    <motion.path d={pathData} fill={layer.color} fillOpacity={layer.opacity}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: layerIdx * 0.15 }} />
                    <motion.polyline points={points} fill="none" stroke={layer.color} strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1, delay: layerIdx * 0.15 }} />
                    <line x1="100" y1={layer.offset + 50} x2="700" y2={layer.offset + 50} stroke="rgba(148, 163, 184, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="720" y={layer.offset + 54} fill="rgba(255, 255, 255, 0.7)" fontSize="12" fontWeight="500">{layer.label}</text>
                  </g>
                );
              })}
              {["0-10","10-20","20-30","30-40","40-50","50-60","60-70","70-80","80-90","90-100"].map((label, idx) => (
                <text key={idx} x={100 + idx * 60} y="310" fill="rgba(148, 163, 184, 0.5)" fontSize="10" textAnchor="middle">{label}</text>
              ))}
            </svg>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2"><div className="w-3 h-1 rounded bg-teal-500" /><span>Most Recent</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-1 rounded bg-cyan-700" /><span>Older Sessions</span></div>
            </div>
            <div className="text-xs text-gray-500">Score Range (%)</div>
          </div>
        </motion.div>

        {/* Activity Timeline (unchanged) */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h3 className="text-xl font-semibold text-white mb-1">Activity Timeline</h3><p className="text-sm text-gray-400">365 days of training consistency</p></div>
            <div className="flex items-center gap-4">
              <div className="text-right"><p className="text-2xl font-bold text-white">247</p><p className="text-xs text-gray-500">Active Days</p></div>
              <Activity className="text-cyan-400" size={24} />
            </div>
          </div>
          <div className="flex gap-2 mb-2 ml-8">
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month, idx) => (
              <div key={idx} className="flex-1 text-xs text-gray-500 text-center">{month}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col justify-around text-xs text-gray-500 pr-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="flex-1 grid grid-cols-52 gap-1">
              {[...Array(364)].map((_, dayIdx) => {
                const intensity = Math.random();
                const isToday = dayIdx === 363;
                return (
                  <motion.div key={dayIdx} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: dayIdx * 0.002 }}
                    className={`aspect-square rounded-sm transition-all hover:scale-125 hover:ring-2 hover:ring-teal-400 cursor-pointer relative group ${
                      isToday ? "bg-teal-400 ring-2 ring-teal-300" :
                      intensity > 0.8 ? "bg-teal-500" : intensity > 0.6 ? "bg-teal-600" :
                      intensity > 0.4 ? "bg-teal-700" : intensity > 0.2 ? "bg-teal-800" : "bg-slate-800/50 border border-slate-700/30"
                    }`}>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{Math.round(intensity * 10)} exercises</div>
                      <div className="text-gray-400 text-[10px]">{isToday ? "Today" : `${Math.floor(Math.random() * 30) + 1} days ago`}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-medium">Less</span>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-sm bg-slate-800/50 border border-slate-700/30" />
                <div className="w-4 h-4 rounded-sm bg-teal-800" />
                <div className="w-4 h-4 rounded-sm bg-teal-700" />
                <div className="w-4 h-4 rounded-sm bg-teal-600" />
                <div className="w-4 h-4 rounded-sm bg-teal-500" />
              </div>
              <span className="font-medium">More</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-8 text-xs w-full lg:w-auto">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" /><span className="text-gray-400 whitespace-nowrap">Current Streak: <span className="text-white font-bold">14 days</span></span></div>
              <div className="flex items-center gap-2"><Trophy size={14} className="text-yellow-400 flex-shrink-0" /><span className="text-gray-400 whitespace-nowrap">Longest: <span className="text-white font-bold">28 days</span></span></div>
              <div className="flex items-center gap-2"><TrendingUp size={14} className="text-green-400 flex-shrink-0" /><span className="text-gray-400 whitespace-nowrap">Avg/week: <span className="text-white font-bold">5.2 days</span></span></div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default Progress;