"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Brain, TrendingUp, Dumbbell, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // URL path-ai kandupidikka
    const [activeTab, setActiveTab] = useState('dashboard');

    // URL maarum pothu active tab-ai update panna
    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setActiveTab('dashboard');
        else if (path === '/training-floor') setActiveTab('training-floor');
        else if (path === '/progress') setActiveTab('progress');
        else if (path === '/settings') setActiveTab('settings');
    }, [location]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
        { id: 'training-floor', label: 'Training Floor', icon: Dumbbell, path: '/training-floor' },
        { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/progress' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
    ];

    const pulseVariants = {
        scale: [1, 1.05, 1],
        boxShadow: [
            '0 0 0 0 rgba(20, 184, 166, 0.7)',
            '0 0 0 15px rgba(20, 184, 166, 0)',
            '0 0 0 0 rgba(20, 184, 166, 0)'
        ]
    };

    const handleMenuClick = (path: string) => {
        // Double click white screen thavirkka, ippo irukira path-ey thirumba click panna navigate panna vendam
        if (location.pathname !== path) {
            navigate(path);
        }
    };

    return (
        <div className="w-64 bg-gradient-to-b from-slate-900/60 to-teal-900/30 backdrop-blur-xl border-r border-teal-500/20 flex flex-col shadow-2xl">
            <div className="p-6 border-b border-teal-500/20 flex justify-center">
                <motion.div
                    animate={pulseVariants}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/50"
                >
                    <Brain size={32} className="text-slate-900" strokeWidth={1.5} />
                </motion.div>
            </div>

            <nav className="flex-1 py-8 space-y-2 px-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === activeTab;
                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => handleMenuClick(item.path)}
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

            <div className="p-4 border-t border-teal-500/20 text-center">
                <p className="text-xs text-gray-500">Neural Forge v2.0</p>
            </div>
        </div>
    );
};

export default Sidebar;