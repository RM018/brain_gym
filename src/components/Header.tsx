import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const Header = () => {

    const [focusMode, setFocusMode] = useState(true);

  return (
    
    <>
    
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
    
    
    
    
    </>

  )
}

export default Header