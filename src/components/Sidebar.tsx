"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, TrendingUp, Dumbbell, Settings, Zap, Brain } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setActiveTab('dashboard');
        else if (path === '/training-floor') setActiveTab('training-floor');
        else if (path === '/progress') setActiveTab('progress');
        else if (path === '/settings') setActiveTab('settings');
    }, [location]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/', badge: null },
        { id: 'training-floor', label: 'Training Floor', icon: Dumbbell, path: '/training-floor', badge: 'Hot' },
        { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/progress', badge: null },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', badge: null }
    ];

    const pulseVariants = {
        scale: [1, 1.08, 1],
        boxShadow: [
            '0 0 0 0 rgba(20, 184, 166, 0.7)',
            '0 0 0 20px rgba(20, 184, 166, 0)',
            '0 0 0 0 rgba(20, 184, 166, 0)'
        ]
    };

    const handleMenuClick = (path: string) => {
        if (location.pathname !== path) {
            navigate(path);
        }
    };

    return (
        <div className="w-64 glass-card border-r border-teal-500/30 flex flex-col shadow-2xl relative overflow-hidden">
            {/* Animated neural background */}
            <div className="absolute inset-0 neural-bg opacity-30" />
            <motion.div
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-500/20 to-transparent blur-2xl"
              />

            {/* Logo Section */}
            <div className="p-6 border-b border-teal-500/30 flex flex-col items-center gap-3 relative z-10">
                <motion.div
                    animate={pulseVariants}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-teal-500/50 overflow-hidden relative group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-float" />
                    <img src="/logo2.png" alt="Neural Forge Logo" className="w-16 h-16 object-contain p-2 bg-white rounded-xl relative z-10" />
                </motion.div>
                <div className="text-center">
                    <h3 className="font-bold text-sm brain-gradient-text" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        NEURAL FORGE
                    </h3>
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full bg-green-400"
                        />
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">System Active</span>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-6 space-y-2 px-4 relative z-10">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = item.id === activeTab;
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <motion.button
                                onClick={() => handleMenuClick(item.path)}
                                whileHover={{ x: 6, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                                    isActive
                                        ? 'glass-card border-teal-400 text-white shadow-lg shadow-teal-500/30'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/30'
                                }`}
                            >
                                {/* Active indicator glow */}
                                {isActive && (
                                    <>
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-400 to-cyan-500 rounded-r-full shadow-lg shadow-teal-500/50" />
                                    </>
                                )}
                                
                                {/* Icon with animation */}
                                <motion.div
                                    animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative z-10"
                                >
                                    <Icon size={20} className={isActive ? 'text-teal-300' : ''} />
                                </motion.div>
                                
                                {/* Label */}
                                <span className={`font-semibold text-sm relative z-10 ${isActive ? 'text-teal-50' : ''}`}>
                                    {item.label}
                                </span>

                                {/* Badge */}
                                {item.badge && (
                                    <motion.span
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="ml-auto px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full shadow-lg relative z-10"
                                    >
                                        {item.badge}
                                    </motion.span>
                                )}

                                {/* Hover effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                            </motion.button>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Neural Activity Indicator */}
            <div className="px-4 py-3 border-t border-teal-500/30 relative z-10">
                <div className="glass-card rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain size={14} className="text-teal-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Neural Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ width: ['0%', '85%'] }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                            />
                        </div>
                        <span className="text-xs font-bold text-teal-400">85%</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] text-gray-500">Cognitive Load</span>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="flex items-center gap-1"
                        >
                            <Zap size={10} className="text-yellow-400" />
                            <span className="text-[9px] text-yellow-400 font-semibold">Optimal</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-teal-500/30 text-center relative z-10">
                <p className="text-[10px] text-gray-500 font-medium">Brain Gym v1.0</p>
                <p className="text-[9px] text-gray-600 mt-0.5">Neural Excellence</p>
            </div>
        </div>
    );
};

export default Sidebar;