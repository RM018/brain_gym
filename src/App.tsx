import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// External pages
import TrainingFloor from './components/TrainingFloor';

// Existing shared components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

/* ================= DASHBOARD CONTENT ================= */
function DashboardContent() {

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
    <main className="flex-1 p-8 overflow-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >

        {/* Top Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="bg-slate-800/40 border border-teal-500/30 rounded-2xl p-8">
            <h3 className="text-sm font-semibold text-teal-300 uppercase tracking-widest mb-6">
              Current Mental Load
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mentalLoadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,.3)" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis domain={[0, 100]} stroke="#6b7280" />
                <Tooltip />
                <Line type="monotone" dataKey="load" stroke="#14b8a6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-800/40 border border-teal-500/30 rounded-2xl p-8">
            <h3 className="text-sm font-semibold text-teal-300 uppercase tracking-widest mb-6">
              Steex & Shantha
            </h3>
            <div className="space-y-4">
              {steexScores.map(score => (
                <div key={score.label}>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>{score.label}</span>
                    <span className="text-gray-400">{score.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score.value}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-teal-400 to-cyan-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Main Placeholder */}
        <motion.div variants={itemVariants} className="bg-slate-800/20 border border-teal-500/10 rounded-2xl h-48 flex items-center justify-center text-gray-500">
          Main Content Area - Development In Progress
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
  const [focusMode, setFocusMode] = useState(true);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header focusMode={focusMode} setFocusMode={setFocusMode} />

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
        </Routes>
      </MainLayout>
    </Router>
  );
}
