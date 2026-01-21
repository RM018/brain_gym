import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Brain, Target, Award, Calendar,
  Clock, Trophy, Star, Activity, BarChart3,
  ChevronRight, Flame, CheckCircle2
} from 'lucide-react';

const Progress = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  // Mock data - in real app, this would come from Training Floor results
  const periodData = {
    day: {
      labels: ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '11 PM'],
      data: [
        { label: '12 AM', score: 0, time: 0, exercises: 0 },
        { label: '4 AM', score: 0, time: 0, exercises: 0 },
        { label: '8 AM', score: 88, time: 25, exercises: 7 },
        { label: '12 PM', score: 92, time: 30, exercises: 8 },
        { label: '4 PM', score: 85, time: 28, exercises: 6 },
        { label: '8 PM', score: 90, time: 32, exercises: 9 },
        { label: '11 PM', score: 78, time: 15, exercises: 4 }
      ],
      trendData: [0, 80, 160, 240, 320, 400],
      trendPoints: [140, 130, 120, 100, 90, 85],
      stats: { sessions: 8, avgScore: 87.8, totalTime: '2.2h', exercises: 34 },
      ridgeline: [
        { label: 'Morning', offset: 0, color: '#14b8a6', opacity: 0.8, data: [25, 40, 55, 75, 88, 92, 88, 75, 55, 40, 25] },
        { label: 'Noon', offset: 50, color: '#06b6d4', opacity: 0.7, data: [20, 35, 50, 70, 85, 90, 85, 70, 50, 35, 20] },
        { label: 'Evening', offset: 100, color: '#0891b2', opacity: 0.6, data: [22, 32, 45, 65, 80, 85, 80, 65, 45, 32, 22] },
        { label: 'Night', offset: 150, color: '#0e7490', opacity: 0.5, data: [15, 25, 35, 50, 65, 70, 65, 50, 35, 25, 15] }
      ]
    },
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [
        { label: 'Mon', score: 85, time: 45, exercises: 12 },
        { label: 'Tue', score: 78, time: 38, exercises: 10 },
        { label: 'Wed', score: 92, time: 52, exercises: 15 },
        { label: 'Thu', score: 88, time: 48, exercises: 13 },
        { label: 'Fri', score: 95, time: 55, exercises: 16 },
        { label: 'Sat', score: 82, time: 42, exercises: 11 },
        { label: 'Sun', score: 90, time: 50, exercises: 14 }
      ],
      trendData: [0, 80, 160, 240, 320, 400],
      trendPoints: [120, 90, 70, 60, 50, 40],
      stats: { sessions: 142, avgScore: 87.5, totalTime: '42h', exercises: 523 },
      ridgeline: [
        { label: 'This Week', offset: 0, color: '#14b8a6', opacity: 0.8, data: [20, 35, 50, 70, 85, 90, 85, 70, 50, 35, 20] },
        { label: 'Last Week', offset: 50, color: '#06b6d4', opacity: 0.7, data: [15, 30, 45, 65, 80, 85, 80, 65, 45, 30, 15] },
        { label: '2 Weeks Ago', offset: 100, color: '#0891b2', opacity: 0.6, data: [18, 28, 42, 60, 75, 80, 75, 60, 42, 28, 18] },
        { label: '3 Weeks Ago', offset: 150, color: '#0e7490', opacity: 0.5, data: [12, 25, 38, 55, 70, 75, 70, 55, 38, 25, 12] },
        { label: 'Month Ago', offset: 200, color: '#155e75', opacity: 0.4, data: [10, 22, 35, 50, 65, 70, 65, 50, 35, 22, 10] }
      ]
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [
        { label: 'Week 1', score: 82, time: 180, exercises: 48 },
        { label: 'Week 2', score: 86, time: 195, exercises: 52 },
        { label: 'Week 3', score: 89, time: 210, exercises: 58 },
        { label: 'Week 4', score: 91, time: 225, exercises: 62 }
      ],
      trendData: [0, 133, 266, 400],
      trendPoints: [110, 85, 65, 45],
      stats: { sessions: 587, avgScore: 87.2, totalTime: '168h', exercises: 2156 },
      ridgeline: [
        { label: 'Week 1', offset: 0, color: '#14b8a6', opacity: 0.8, data: [18, 30, 45, 65, 80, 85, 80, 65, 45, 30, 18] },
        { label: 'Week 2', offset: 50, color: '#06b6d4', opacity: 0.7, data: [20, 33, 48, 68, 82, 88, 82, 68, 48, 33, 20] },
        { label: 'Week 3', offset: 100, color: '#0891b2', opacity: 0.6, data: [22, 36, 51, 71, 85, 90, 85, 71, 51, 36, 22] },
        { label: 'Week 4', offset: 150, color: '#0e7490', opacity: 0.5, data: [24, 38, 53, 73, 87, 92, 87, 73, 53, 38, 24] }
      ]
    },
    year: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      data: [
        { label: 'Jan', score: 75, time: 720, exercises: 180 },
        { label: 'Feb', score: 78, time: 750, exercises: 195 },
        { label: 'Mar', score: 82, time: 780, exercises: 210 },
        { label: 'Apr', score: 80, time: 760, exercises: 200 },
        { label: 'May', score: 85, time: 810, exercises: 225 },
        { label: 'Jun', score: 87, time: 830, exercises: 235 },
        { label: 'Jul', score: 89, time: 850, exercises: 245 },
        { label: 'Aug', score: 91, time: 870, exercises: 255 },
        { label: 'Sep', score: 88, time: 840, exercises: 240 },
        { label: 'Oct', score: 90, time: 860, exercises: 250 },
        { label: 'Nov', score: 92, time: 880, exercises: 260 },
        { label: 'Dec', score: 94, time: 900, exercises: 270 }
      ],
      trendData: [0, 66, 133, 200, 266, 333, 400],
      trendPoints: [130, 115, 95, 75, 60, 48, 35],
      stats: { sessions: 2847, avgScore: 85.9, totalTime: '1638h', exercises: 10465 },
      ridgeline: [
        { label: 'Q4 2026', offset: 0, color: '#14b8a6', opacity: 0.8, data: [25, 40, 58, 78, 90, 95, 90, 78, 58, 40, 25] },
        { label: 'Q3 2026', offset: 50, color: '#06b6d4', opacity: 0.7, data: [22, 37, 54, 74, 87, 92, 87, 74, 54, 37, 22] },
        { label: 'Q2 2026', offset: 100, color: '#0891b2', opacity: 0.6, data: [20, 34, 50, 70, 84, 89, 84, 70, 50, 34, 20] },
        { label: 'Q1 2026', offset: 150, color: '#0e7490', opacity: 0.5, data: [18, 31, 46, 66, 80, 85, 80, 66, 46, 31, 18] }
      ]
    }
  };

  const currentData = periodData[selectedPeriod as keyof typeof periodData];

  const exerciseTypes = [
    { name: 'Memory', value: 35, color: 'from-teal-500 to-cyan-500' },
    { name: 'Logic', value: 25, color: 'from-blue-500 to-cyan-500' },
    { name: 'Speed', value: 20, color: 'from-amber-500 to-orange-500' },
    { name: 'Focus', value: 20, color: 'from-green-500 to-emerald-500' }
  ];

  const achievements = [
    { icon: Flame, title: '7 Day Streak', description: 'Keep it up!', color: 'text-orange-400' },
    { icon: Trophy, title: 'Top 10%', description: 'Among all users', color: 'text-yellow-400' },
    { icon: Star, title: '100 Exercises', description: 'Milestone reached', color: 'text-teal-400' },
    { icon: Target, title: '95% Accuracy', description: 'Personal best', color: 'text-green-400' }
  ];

  const stats = [
    { label: 'Total Sessions', value: currentData.stats.sessions.toString(), change: '+12%', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { label: 'Avg. Score', value: currentData.stats.avgScore.toString(), change: '+5.2%', icon: TrendingUp, color: 'from-teal-500 to-cyan-500' },
    { label: 'Total Time', value: currentData.stats.totalTime, change: '+8%', icon: Clock, color: 'from-amber-500 to-orange-500' },
    { label: 'Exercises Done', value: currentData.stats.exercises.toString(), change: '+15%', icon: CheckCircle2, color: 'from-green-500 to-emerald-500' }
  ];

  const skillLevels = [
    { name: 'Memory Retention', level: 85, maxLevel: 100 },
    { name: 'Problem Solving', level: 72, maxLevel: 100 },
    { name: 'Processing Speed', level: 90, maxLevel: 100 },
    { name: 'Pattern Recognition', level: 78, maxLevel: 100 },
    { name: 'Logical Reasoning', level: 82, maxLevel: 100 }
  ];

  return (
    <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6 md:p-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto pb-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/50">
                <BarChart3 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Your Progress
                </h1>
                <p className="text-gray-500 text-sm">Track your cognitive training journey</p>
              </div>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
              {['day', 'week', 'month', 'year'].map((period) => (
                <motion.button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    selectedPeriod === period
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {period}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all duration-300"
              >
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

        {/* Radial Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Focus Score */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Focus Score</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#focusGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * 88) / 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  style={{ strokeDasharray: 314 }}
                />
                <defs>
                  <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">88%</p>
                  <p className="text-xs text-gray-400 mt-1">Excellent</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Accuracy Rate */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Accuracy Rate</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="10"
                  fill="none"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#accuracyGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * 92) / 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                  style={{ strokeDasharray: 314 }}
                />
                <defs>
                  <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">92%</p>
                  <p className="text-xs text-gray-400 mt-1">High</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Speed Index */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Speed Index</h3>
            <div className="relative w-40 h-40 mx-auto">
              <svg className="transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="10"
                  fill="none"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#speedGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * 75) / 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                  style={{ strokeDasharray: 314 }}
                />
                <defs>
                  <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">75%</p>
                  <p className="text-xs text-gray-400 mt-1">Good</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Bar Chart - Weekly Progress */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {selectedPeriod === 'day' ? 'Daily' : selectedPeriod === 'week' ? 'Weekly' : selectedPeriod === 'month' ? 'Monthly' : 'Yearly'} Performance
                </h3>
                <p className="text-sm text-gray-400">
                  Your scores over the past {selectedPeriod}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-400/20">
                <TrendingUp size={16} className="text-green-400" />
                <span className="text-sm text-green-400 font-semibold">
                  +{selectedPeriod === 'day' ? '8' : selectedPeriod === 'week' ? '12' : selectedPeriod === 'month' ? '15' : '22'}% this {selectedPeriod}
                </span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between gap-3" style={{ height: '250px' }}>
              {currentData.data.map((data, idx) => {
                const maxScore = Math.max(...currentData.data.map(d => d.score));
                const height = (data.score / maxScore) * 100;
                const isHighlighted = selectedPeriod === 'week' ? idx === 4 : idx === currentData.data.length - 1;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-3" style={{ height: '100%' }}>
                    <div className="relative w-full flex items-end" style={{ height: '220px' }}>
                      <motion.div
                        key={`${selectedPeriod}-${idx}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`w-full rounded-t-xl relative overflow-hidden ${
                          isHighlighted
                            ? 'bg-gradient-to-t from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/50'
                            : 'bg-gradient-to-t from-slate-700 to-slate-600'
                        }`}
                      >
                        {isHighlighted && (
                          <motion.div
                            animate={{ y: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-x-0 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent"
                          />
                        )}
                      </motion.div>
                      
                      {/* Score label */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <span className={`text-sm font-bold whitespace-nowrap ${isHighlighted ? 'text-teal-400' : 'text-gray-400'}`}>
                          {data.score > 0 ? data.score : '-'}
                        </span>
                      </div>
                    </div>
                    
                    <span className={`text-xs font-medium whitespace-nowrap ${isHighlighted ? 'text-teal-400' : 'text-gray-500'}`}>
                      {data.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-teal-500 to-cyan-500" />
                <span className="text-xs text-gray-400">
                  {selectedPeriod === 'day' ? 'Current' : selectedPeriod === 'week' ? 'Today' : selectedPeriod === 'month' ? 'This Week' : 'This Month'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-r from-slate-700 to-slate-600" />
                <span className="text-xs text-gray-400">Previous</span>
              </div>
            </div>
          </motion.div>

          {/* Pie Chart - Exercise Distribution */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-1">Exercise Types</h3>
            <p className="text-sm text-gray-400 mb-6">Distribution of activities</p>

            {/* Custom Pie Chart */}
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
                        style={{
                          fill: idx === 0 ? '#a855f7' : idx === 1 ? '#3b82f6' : idx === 2 ? '#f59e0b' : '#10b981'
                        }}
                      />
                    );
                  });
                })()}
                
                {/* Center circle */}
                <circle cx="50" cy="50" r="25" className="fill-slate-900" />
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-gray-400">Complete</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {exerciseTypes.map((type, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded bg-gradient-to-br ${type.color}`} />
                    <span className="text-sm text-gray-300">{type.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{type.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Trend Line Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Performance Trend</h3>
              <p className="text-sm text-gray-400">
                {selectedPeriod === 'day' ? 'Hourly' : selectedPeriod === 'week' ? 'Last 7 days' : selectedPeriod === 'month' ? 'Last 4 weeks' : 'Last 12 months'} overview
              </p>
            </div>
            <TrendingUp className="text-green-400" size={24} />
          </div>

          {/* Line Chart Visualization */}
          <div className="relative h-48">
            <svg className="w-full h-full" viewBox="0 0 400 150">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 37.5}
                  x2="400"
                  y2={i * 37.5}
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="1"
                />
              ))}

              {/* Trend line */}
              <motion.path
                key={`trend-${selectedPeriod}`}
                d={`M ${currentData.trendData.map((x, i) => `${x} ${currentData.trendPoints[i]}`).join(' L ')}`}
                stroke="url(#trendGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />

              {/* Area under curve */}
              <motion.path
                key={`area-${selectedPeriod}`}
                d={`M ${currentData.trendData.map((x, i) => `${x} ${currentData.trendPoints[i]}`).join(' L ')} L 400 150 L 0 150 Z`}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />

              {/* Data points */}
              {currentData.trendData.map((x, i) => {
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
          {/* Skill Levels */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Skill Levels</h3>
                <p className="text-sm text-gray-400">Your cognitive abilities breakdown</p>
              </div>
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
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Achievements */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Achievements</h3>
                <p className="text-sm text-gray-400">Your recent milestones</p>
              </div>
              <Award className="text-yellow-400" size={24} />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  >
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

        {/* Performance Comparison */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Category Comparison</h3>
              <p className="text-sm text-gray-400">Your performance across different areas</p>
            </div>
            <BarChart3 className="text-teal-400" size={24} />
          </div>

          <div className="space-y-6">
            {[
              { category: 'Stress Training', score: 85, avg: 72, color: 'from-red-500 to-orange-500' },
              { category: 'Complex Processing', score: 88, avg: 70, color: 'from-blue-500 to-cyan-500' },
              { category: 'Voice and Value', score: 78, avg: 68, color: 'from-purple-500 to-pink-500' },
              { category: 'Pattern Match', score: 92, avg: 75, color: 'from-teal-500 to-cyan-500' },
              { category: 'Creativity', score: 81, avg: 65, color: 'from-amber-500 to-yellow-500' },
              { category: 'Emotional Intelligence', score: 87, avg: 69, color: 'from-pink-500 to-rose-500' },
              { category: 'Memory', score: 90, avg: 73, color: 'from-green-500 to-emerald-500' }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{item.category}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-teal-400 font-semibold">You: {item.score}%</span>
                    <span className="text-gray-500">Avg: {item.avg}%</span>
                  </div>
                </div>
                <div className="relative h-8 bg-slate-800/50 rounded-full overflow-hidden">
                  {/* Average marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10"
                    style={{ left: `${item.avg}%` }}
                  />
                  {/* Your score bar */}
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

        {/* Ridgeline Chart - Performance Distribution */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Performance Distribution</h3>
              <p className="text-sm text-gray-400">Score patterns across training sessions</p>
            </div>
            <Activity className="text-teal-400" size={24} />
          </div>

          <div className="relative h-80">
            <svg className="w-full h-full" viewBox="0 0 800 320">
              {/* Ridgeline layers */}
              {currentData.ridgeline.map((layer, layerIdx) => {
                const points = layer.data.map((value, idx) => {
                  const x = 100 + idx * 60;
                  const y = layer.offset + 50 - (value * 0.5);
                  return `${x},${y}`;
                }).join(' ');



                const pathData = `M ${points} L ${layer.data.map((_, idx) => {
                  const x = 100 + (layer.data.length - 1 - idx) * 60;
                  const y = layer.offset + 50;
                  return `${x},${y}`;
                }).join(' L ')} Z`;

                return (
                  <g key={layerIdx}>
                    {/* Fill area */}
                    <motion.path
                      d={pathData}
                      fill={layer.color}
                      fillOpacity={layer.opacity}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: layerIdx * 0.15 }}
                    />
                    
                    {/* Ridge line */}
                    <motion.polyline
                      points={points}
                      fill="none"
                      stroke={layer.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: layerIdx * 0.15 }}
                    />
                    
                    {/* Baseline */}
                    <line
                      x1="100"
                      y1={layer.offset + 50}
                      x2="700"
                      y2={layer.offset + 50}
                      stroke="rgba(148, 163, 184, 0.2)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    
                    {/* Label */}
                    <text
                      x="720"
                      y={layer.offset + 54}
                      fill="rgba(255, 255, 255, 0.7)"
                      fontSize="12"
                      fontWeight="500"
                    >
                      {layer.label}
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'].map((label, idx) => (
                <text
                  key={idx}
                  x={100 + idx * 60}
                  y="310"
                  fill="rgba(148, 163, 184, 0.5)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 rounded bg-teal-500" />
                <span>Most Recent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 rounded bg-cyan-700" />
                <span>Older Sessions</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Score Range (%)
            </div>
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">Activity Timeline</h3>
              <p className="text-sm text-gray-400">365 days of training consistency</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-white">247</p>
                <p className="text-xs text-gray-500">Active Days</p>
              </div>
              <Activity className="text-cyan-400" size={24} />
            </div>
          </div>

          {/* Month labels */}
          <div className="flex gap-2 mb-2 ml-8">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
              <div key={idx} className="flex-1 text-xs text-gray-500 text-center">
                {month}
              </div>
            ))}
          </div>

          {/* Heatmap-style activity grid */}
          <div className="flex gap-2">
            {/* Day labels */}
            <div className="flex flex-col justify-around text-xs text-gray-500 pr-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-52 gap-1">
              {[...Array(364)].map((_, dayIdx) => {
                const intensity = Math.random();
                const isToday = dayIdx === 363;
                return (
                  <motion.div
                    key={dayIdx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dayIdx * 0.002 }}
                    className={`aspect-square rounded-sm transition-all hover:scale-125 hover:ring-2 hover:ring-teal-400 cursor-pointer relative group ${
                      isToday
                        ? 'bg-teal-400 ring-2 ring-teal-300'
                        : intensity > 0.8
                        ? 'bg-teal-500'
                        : intensity > 0.6
                        ? 'bg-teal-600'
                        : intensity > 0.4
                        ? 'bg-teal-700'
                        : intensity > 0.2
                        ? 'bg-teal-800'
                        : 'bg-slate-800/50 border border-slate-700/30'
                    }`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{Math.round(intensity * 10)} exercises</div>
                      <div className="text-gray-400 text-[10px]">
                        {isToday ? 'Today' : `${Math.floor(Math.random() * 30) + 1} days ago`}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Legend and Stats */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
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

            <div className="flex items-center gap-8 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400" />
                <span className="text-gray-400">Current Streak: <span className="text-white font-bold">14 days</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-yellow-400" />
                <span className="text-gray-400">Longest: <span className="text-white font-bold">28 days</span></span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-400" />
                <span className="text-gray-400">Avg/week: <span className="text-white font-bold">5.2 days</span></span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default Progress;
