import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Sparkles, Shuffle, Lightbulb, Settings as SettingsIcon, Flame } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// External pages
import TrainingFloor from './components/TrainingFloor';
import Settings from './components/Settings';
import Progress from './components/Progress';

// Existing shared components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

/* ================= DASHBOARD CONTENT ================= */
function DashboardContent() {
  const navigate = useNavigate();
  const mentalLoad = 89;
  
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
    <main className="flex-1 p-8 overflow-auto neural-bg">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 max-w-7xl mx-auto"
      >

        {/* Welcome Banner */}
        <motion.div variants={itemVariants} className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-blue-500/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold brain-gradient-text mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                Welcome to Your Neural Dashboard
              </h2>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block w-2 h-2 rounded-full bg-green-400"
                />
                All systems operational • Cognitive enhancement active
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/training-floor')}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 text-white shadow-lg"
            >
              <Zap size={20} />
              Start Training
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 hover:border-teal-400/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={18} className="text-teal-400" />
                Mental Load Curve
              </h3>
              <span className="text-xs px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full font-semibold border border-teal-500/30">
                Real-time
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mentalLoadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,184,166,0.1)" />
                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '11px' }} />
                <YAxis domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '11px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="load" stroke="#14b8a6" strokeWidth={3} dot={{ fill: '#14b8a6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 hover:border-cyan-400/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2">
                <Brain size={18} className="text-cyan-400" />
                Cognitive Metrics
              </h3>
              <span className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full font-semibold border border-cyan-500/30">
                STX Score
              </span>
            </div>
            <div className="space-y-4">
              {steexScores.map(score => (
                <div key={score.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 font-semibold">{score.label === 'S' ? 'Stress Tolerance' : score.label === 'T' ? 'Task Efficiency' : 'Mental Flexibility'}</span>
                    <span className="text-teal-400 font-bold">{score.value}%</span>
                  </div>
                  <div className="relative w-full h-2.5 bg-slate-800/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score.value}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-full relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                      />
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Main Content Area */}
        <motion.div
  variants={itemVariants}
  className="glass-card rounded-3xl p-8 hover:border-teal-400/50 transition-all duration-300 relative overflow-hidden group"
>
  {/* Animated background orbs */}
  <motion.div
    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
    transition={{ duration: 8, repeat: Infinity }}
    className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
  />
  <motion.div
    animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
    transition={{ duration: 10, repeat: Infinity, delay: 2 }}
    className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
  />

  <div className="flex flex-col lg:flex-row gap-8 relative z-10">
    {/* Left Side - Neural Network Visualization */}
    <div className="lg:w-1/2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Brain size={24} className="text-teal-400" />
          </motion.div>
          Neural Activity Map
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-semibold">Live Feed</span>
          <motion.div
            className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
      
      {/* Neural Network Visualization */}
      <div className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 border border-teal-500/30 p-6 shadow-2xl">
        {/* Animated neural connections */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Neural connections */}
          {[...Array(20)].map((_, i) => (
            <motion.path
              key={`connection-${i}`}
              d={`M ${Math.random() * 100}% ${Math.random() * 100}% 
                  Q ${Math.random() * 100}% ${Math.random() * 100}% 
                  ${Math.random() * 100}% ${Math.random() * 100}%`}
              stroke="url(#gradient)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: [0.1, 0.4, 0.1] 
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
          
          {/* Neural nodes */}
          {[...Array(30)].map((_, i) => (
            <motion.circle
              key={`node-${i}`}
              cx={`${Math.random() * 90 + 5}%`}
              cy={`${Math.random() * 80 + 10}%`}
              r={Math.random() * 4 + 2}
              fill="#14b8a6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: [0, 1, 0.7, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Activity indicators */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></div>
              <span className="text-xs text-teal-300 font-semibold">High Activity</span>
            </div>
            <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
              <span className="text-xs text-cyan-300 font-semibold">Learning</span>
            </div>
          </div>
          <span className="text-xs text-gray-500 font-mono">ID: NF-{Date.now().toString().slice(-6)}</span>
        </div>
      </div>
    </div>

    {/* Right Side - Stats & Metrics */}
    <div className="lg:w-1/2">
      <div className="grid grid-cols-2 gap-4">
        {/* Active Session */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card rounded-2xl p-5 border border-teal-500/30 cursor-pointer hover:border-teal-400/60 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Session</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">42m 18s</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: ['0%', '68%'] }}
                transition={{ duration: 2 }}
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              />
            </div>
            <span className="text-xs text-gray-400">68%</span>
          </div>
          <p className="text-xs text-yellow-400 mt-2 font-semibold flex items-center gap-1">
            <Flame size={12} />
            6 day streak
          </p>
        </motion.div>

        {/* Cognitive Load */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card rounded-2xl p-5 border border-cyan-500/30 cursor-pointer hover:border-cyan-400/60 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-cyan-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Cognitive Load</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-3xl font-bold text-white">{mentalLoad}%</p>
            <motion.span 
              className="text-xs px-2 py-1 rounded-full font-bold"
              animate={{ 
                backgroundColor: mentalLoad > 80 
                  ? 'rgba(239, 68, 68, 0.2)' 
                  : mentalLoad > 60 
                  ? 'rgba(245, 158, 11, 0.2)' 
                  : 'rgba(34, 197, 94, 0.2)'
              }}
            >
              <span className={`
                ${mentalLoad > 80 ? 'text-red-400' : 
                  mentalLoad > 60 ? 'text-yellow-400' : 
                  'text-green-400'}
              `}>
                {mentalLoad > 80 ? 'High' : mentalLoad > 60 ? 'Moderate' : 'Optimal'}
              </span>
            </motion.span>
          </div>
          <div className="relative w-full h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${mentalLoad}%` }}
              transition={{ duration: 1.5 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
        </motion.div>

        {/* Daily Progress */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card rounded-2xl p-5 border border-green-500/30 cursor-pointer hover:border-green-400/60 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">Daily Progress</span>
          </div>
          <p className="text-2xl font-bold text-white">78%</p>
          <div className="w-full h-1.5 bg-slate-700/50 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1 }}
            />
          </div>
        </motion.div>

        {/* Neural Efficiency */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="glass-card rounded-2xl p-5 border border-purple-500/30 cursor-pointer hover:border-purple-400/60 transition-all"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">Neural Efficiency</span>
          </div>
          <p className="text-2xl font-bold brain-gradient-text">92%</p>
          <p className="text-xs text-gray-400 mt-1">Optimal brain performance</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-2xl p-5 border border-teal-500/30">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-widest">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              boxShadow: ['0 0 0 rgba(20, 184, 166, 0)', '0 0 20px rgba(20, 184, 166, 0.3)', '0 0 0 rgba(20, 184, 166, 0)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-3 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-400/30 hover:border-teal-400/60 transition-all flex items-center justify-center gap-2"
          >
            <Brain size={16} className="text-teal-400" />
            <span className="text-xs font-medium">Brain Boost</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:border-cyan-400/60 transition-all flex items-center justify-center gap-2"
          >
            <Shuffle size={16} className="text-cyan-400" />
            <span className="text-xs font-medium">Quick Mix</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 hover:border-purple-400/60 transition-all flex items-center justify-center gap-2"
          >
            <Lightbulb size={16} className="text-purple-400" />
            <span className="text-xs font-medium">Insights</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/settings')}
            className="p-3 rounded-lg bg-gradient-to-br from-slate-700/50 to-slate-600/50 border border-slate-600/30 hover:border-slate-500/60 transition-all flex items-center justify-center gap-2"
          >
            <SettingsIcon size={16} className="text-slate-400" />
            <span className="text-xs font-medium">Settings</span>
          </motion.button>
        </div>
      </div>
    </div>
  </div>

  {/* Performance Timeline */}
  <div className="mt-6 pt-6 border-t border-teal-500/20">
    <h4 className="text-sm font-semibold text-gray-300 mb-4">Recent Performance Timeline</h4>
    <div className="flex items-center justify-between">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
        const height = [65, 85, 72, 90, 78, 82, 68][i];
        const isToday = i === 4; // Assuming Friday is today
        
        return (
          <div key={day} className="flex flex-col items-center gap-2">
            <span className={`text-xs ${isToday ? 'text-teal-400 font-semibold' : 'text-gray-400'}`}>
              {day}
            </span>
            <motion.div
              className={`w-8 rounded-t-lg ${
                isToday 
                  ? 'bg-gradient-to-t from-teal-500 to-cyan-500' 
                  : 'bg-gradient-to-t from-slate-700 to-slate-600'
              }`}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              style={{ maxHeight: '80px' }}
            />
            <span className="text-xs text-gray-500">{height}%</span>
          </div>
        );
      })}
    </div>
  </div>
</motion.div>

        {/* ✅ NEURAL HEATMAP CARD (CONFIRMED INCLUDED) */}
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

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-4xl text-teal-500/30"
          >
            ✨
          </motion.div>
        </motion.div>

      </motion.div>
    </main>
  );
}

/* ================= LAYOUT ================= */
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {location.pathname !== '/training-floor' && <Header />}

        {/* Background particles */}
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
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity }}
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            />
          ))}
        </div>

        {children}
      </div>
    </div>
  );
};

/* ================= APP ROOT ================= */
export default function NeuralForge() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/training-floor" element={<TrainingFloor />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
