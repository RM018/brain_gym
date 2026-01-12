import React, { useState } from 'react';
import { Home, Users, TrendingUp, Dumbbell, Settings, Brain, User, Zap, Lightbulb, Shuffle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function NeuralForge() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [focusMode, setFocusMode] = useState(true);
  const [mentalLoad, setMentalLoad] = useState(89);

  // Mental load data over time
  const mentalLoadData = [
    { time: '6AM', load: 35 },
    { time: '8AM', load: 45 },
    { time: '10AM', load: 62 },
    { time: '12PM', load: 75 },
    { time: '2PM', load: 85 },
    { time: '4PM', load: 89 },
    { time: '6PM', load: 78 },
    { time: '8PM', load: 62 }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'training-floor-1', label: 'Training Floor', icon: Users },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'training-floor', label: 'Training Floor', icon: Dumbbell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const suggestedActivities = [
    {
      id: 1,
      title: 'Daily Logic Puzzle',
      icon: Lightbulb,
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 2,
      title: 'Quick Mind Mixing',
      description: 'Decision Making. Task Maturity. Upcoming',
      icon: Shuffle,
      color: 'from-teal-400 to-cyan-600'
    },
    {
      id: 3,
      title: 'Pattern Matching',
      icon: Sparkles,
      color: 'from-cyan-400 to-teal-600'
    },
    {
      id: 4,
      title: 'Recent Activity',
      activity: [
        '+1 Trivia resolve',
        'Memory Recall score Increase by 15pts',
        'Task Pause completed. Its left in same items next text'
      ],
      icon: Zap,
      color: 'from-slate-500 to-slate-700'
    }
  ];

  const steexScores = [
    { label: 'S', value: 75 },
    { label: 'T', value: 65 },
    { label: 'X', value: 82 }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const pulseVariants = {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(20, 184, 166, 0.7)',
      '0 0 0 15px rgba(20, 184, 166, 0)',
      '0 0 0 0 rgba(20, 184, 166, 0)'
    ]
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-gray-100 font-sans overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-400/10 rounded-full blur-sm"
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          ></motion.div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-900/60 to-teal-900/30 backdrop-blur-xl border-r border-teal-500/20 flex flex-col shadow-2xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-teal-500/20 flex justify-center">
          <motion.div
            animate={pulseVariants}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/50"
          >
            <Brain size={32} className="text-slate-900" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500/30 border border-teal-400 text-teal-300 shadow-lg shadow-teal-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-teal-500/20 text-center">
          <p className="text-xs text-gray-500">Neural Forge v2.0</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-900/40 to-teal-900/20 backdrop-blur-xl border-b border-teal-500/20 px-8 py-6 flex items-center justify-between shadow-lg">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-light tracking-wider text-gray-100"
          >
            The Neural Forge
          </motion.h1>

          {/* Header Right Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-6"
          >
            {/* User Icon */}
            <button className="p-2 hover:bg-slate-800/40 rounded-lg transition-colors duration-200">
              <User size={24} className="text-gray-400 hover:text-teal-300" />
            </button>

            {/* Focus Mode Toggle */}
            <div className="flex items-center gap-3 bg-slate-800/40 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-500/30">
              <span className="text-sm font-medium text-teal-300 uppercase tracking-widest">
                Focus Mode
              </span>
              <motion.button
                onClick={() => setFocusMode(!focusMode)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  focusMode ? 'bg-teal-500' : 'bg-slate-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ left: focusMode ? 22 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                ></motion.div>
              </motion.button>
            </div>
          </motion.div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Mental Load with Line Graph */}
              <motion.div
                variants={itemVariants}
                className="bg-slate-800/40 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 shadow-xl shadow-teal-500/5 hover:shadow-teal-500/15 transition-all duration-300"
              >
                <h3 className="text-sm font-semibold text-teal-300 uppercase tracking-widest mb-6">
                  Current Mental Load
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mentalLoadData}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.3)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="rgba(107, 114, 128, 0.5)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="rgba(107, 114, 128, 0.5)"
                      style={{ fontSize: '12px' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(20, 184, 166, 0.3)',
                        borderRadius: '8px',
                        color: '#d1d5db'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="load" 
                      stroke="#14b8a6" 
                      strokeWidth={3}
                      dot={{ fill: '#14b8a6', r: 5 }}
                      activeDot={{ r: 7 }}
                      fillOpacity={1}
                      fill="url(#colorLoad)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* STEEX & SHANTHA */}
              <motion.div
                variants={itemVariants}
                className="bg-slate-800/40 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 shadow-xl shadow-teal-500/5 hover:shadow-teal-500/15 transition-all duration-300"
              >
                <h3 className="text-sm font-semibold text-teal-300 uppercase tracking-widest mb-6">
                  Steex & Shantha
                </h3>
                <div className="space-y-4">
                  {steexScores.map((score) => (
                    <div key={score.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">{score.label}</span>
                        <span className="text-xs text-gray-400">{score.value}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${score.value}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800/30 to-teal-800/20 backdrop-blur-md border border-teal-500/30 rounded-2xl p-16 shadow-xl shadow-teal-500/5 hover:shadow-teal-500/15 transition-all duration-300 flex items-center justify-center min-h-52"
            >
              <div className="text-center">
                <p className="text-xl font-light text-gray-300 tracking-wide">
                  Main Content Area - Development In Progress
                </p>
              </div>
            </motion.div>

            {/* Suggested for Today Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Suggested for Today:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className={`bg-gradient-to-br ${activity.color} bg-opacity-10 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 shadow-xl shadow-teal-500/5 hover:shadow-teal-500/15 hover:border-teal-400/60 transition-all duration-300 cursor-pointer group`}
                    >
                      <div className="flex flex-col h-full">
                        <Icon size={28} className="text-teal-300 mb-4 group-hover:scale-110 transition-transform duration-300" />
                        <h3 className="text-base font-semibold text-gray-100 mb-2">{activity.title}</h3>
                        {activity.description && (
                          <p className="text-xs text-gray-400 leading-relaxed">{activity.description}</p>
                        )}
                        {activity.activity && (
                          <div className="text-xs text-gray-400 space-y-1">
                            {activity.activity.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-teal-300 mt-0.5">•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Neural Heatmap Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-gradient-to-r from-slate-800/40 to-teal-800/20 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 shadow-xl shadow-teal-500/10 hover:shadow-teal-500/20 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-start gap-6">
                <motion.div
                  animate={pulseVariants}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/50 flex-shrink-0"
                >
                  <Brain size={40} className="text-slate-900" strokeWidth={1.5} />
                </motion.div>

                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-gray-100 mb-2 tracking-wide group-hover:text-teal-300 transition-colors duration-300">
                    NEURAL HEATMAP
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed font-light">
                    An active claim can strengthen their left side and more active sides can help to reduce
                    stress and action play facilitates learning for children and adults alike.
                  </p>
                </div>
              </div>

              {/* Decorative element */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="text-4xl text-teal-500/30 flex-shrink-0"
              >
                ✨
              </motion.div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
