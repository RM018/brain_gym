import { useState } from 'react'
import { motion } from 'framer-motion';
import { User, TrendingUp, Brain, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const [focusMode, setFocusMode] = useState(true);

  return (
    
    <>
    
    {/* Header */}
            <header className="glass-card border-b border-teal-500/30 px-8 py-5 flex items-center justify-between shadow-2xl relative overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 neural-bg opacity-50" />
              
              {/* Brain pulse decoration */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-20 -top-20 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-20 -bottom-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"
              />

              {/* Title with brain icon */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4 relative z-10"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg animate-glow"
                >
                  <Brain className="text-white" size={28} />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold tracking-wider brain-gradient-text" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    The Neural Forge
                  </h1>
                  <p className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">Cognitive Excellence Platform</p>
                </div>
              </motion.div>
    
              {/* Header Right Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4 relative z-10"
              >
                {/* Progress Button */}
                <motion.button
                  onClick={() => navigate('/progress')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 btn-primary rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-teal-500/50 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <TrendingUp size={18} className="relative z-10" />
                  <span className="relative z-10">Progress</span>
                  <Zap size={14} className="relative z-10 opacity-70" />
                </motion.button>

                {/* User Profile */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 glass-card rounded-xl hover:border-teal-400/50 transition-all duration-200 group"
                >
                  <User size={22} className="text-gray-400 group-hover:text-teal-300 transition-colors" />
                </motion.button>
    
                {/* Focus Mode Toggle */}
                <div className="flex items-center gap-3 glass-card px-5 py-2.5 rounded-full">
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-teal-400"
                    />
                    Focus Mode
                  </span>
                  <motion.button
                    onClick={() => setFocusMode(!focusMode)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${
                      focusMode 
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-teal-500/50' 
                        : 'bg-slate-700/50'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ left: focusMode ? 28 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`absolute top-0.5 w-6 h-6 rounded-full shadow-lg ${
                        focusMode ? 'bg-white' : 'bg-slate-500'
                      }`}
                    >
                      {focusMode && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full rounded-full bg-gradient-to-br from-teal-300 to-cyan-400 flex items-center justify-center"
                        >
                          <Zap size={12} className="text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            </header>    
    
    
    
    
    </>

  )
}

export default Header