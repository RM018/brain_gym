import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Lock, Palette, Database,
  Moon, Sun, Monitor, Trash2,
  Download, Upload, Check
} from 'lucide-react';

const Settings = () => {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [language] = useState('en');

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

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <motion.button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        enabled ? 'bg-teal-500' : 'bg-slate-600'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ left: enabled ? 28 : 4 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
      />
    </motion.button>
  );

  const sections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      items: [
        { label: 'Username', value: 'User', type: 'input' },
        { label: 'Email', value: 'user@aaruchudar.com', type: 'input' },
        { label: 'Bio', value: 'Cognitive enhancement enthusiast', type: 'textarea' },
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      items: [
        { label: 'Theme', value: theme, type: 'theme-select' },
        { label: 'Language', value: language, type: 'select', options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Español' },
          { value: 'fr', label: 'Français' },
          { value: 'de', label: 'Deutsch' }
        ]},
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Enable Notifications', value: notifications, type: 'toggle', onChange: () => setNotifications(!notifications) },
        { label: 'Sound Effects', value: soundEffects, type: 'toggle', onChange: () => setSoundEffects(!soundEffects) },
        { label: 'Email Notifications', value: true, type: 'toggle' },
        { label: 'Push Notifications', value: false, type: 'toggle' },
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Lock,
      items: [
        { label: 'Two-Factor Authentication', value: false, type: 'toggle' },
        { label: 'Data Sharing', value: false, type: 'toggle' },
        { label: 'Activity Tracking', value: true, type: 'toggle' },
      ]
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: Database,
      items: [
        { label: 'Auto-Save Progress', value: autoSave, type: 'toggle', onChange: () => setAutoSave(!autoSave) },
        { label: 'Backup Frequency', value: 'daily', type: 'select', options: [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' }
        ]},
      ]
    },
  ];

  return (
    <main className="flex-1 p-8 overflow-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-4xl font-light tracking-wider text-gray-100 mb-2">Settings</h1>
          <p className="text-gray-400">Customize your Neural Forge experience</p>
        </motion.div>

        {/* Settings Sections */}
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.id}
              variants={itemVariants}
              className="bg-slate-800/40 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 shadow-xl shadow-teal-500/5 hover:shadow-teal-500/15 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                  <Icon size={20} className="text-teal-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-100">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-300">{item.label}</label>
                      {item.type === 'input' && (
                        <input
                          type="text"
                          defaultValue={item.value as string}
                          className="mt-2 w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-teal-400 transition-colors"
                        />
                      )}
                      {item.type === 'textarea' && (
                        <textarea
                          defaultValue={item.value as string}
                          rows={3}
                          className="mt-2 w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-teal-400 transition-colors resize-none"
                        />
                      )}
                      {item.type === 'select' && (
                        <select
                          defaultValue={item.value as string}
                          className="mt-2 w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-teal-400 transition-colors"
                        >
                          {('options' in item && item.options) && item.options?.map((option: { value: string; label: string }) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {item.type === 'theme-select' && (
                        <div className="mt-2 flex gap-3">
                          {[
                            { value: 'light', icon: Sun, label: 'Light' },
                            { value: 'dark', icon: Moon, label: 'Dark' },
                            { value: 'auto', icon: Monitor, label: 'Auto' }
                          ].map((themeOption) => {
                            const ThemeIcon = themeOption.icon;
                            return (
                              <motion.button
                                key={themeOption.value}
                                onClick={() => setTheme(themeOption.value)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                                  theme === themeOption.value
                                    ? 'bg-teal-500/30 border border-teal-400 text-teal-300'
                                    : 'bg-slate-700/50 border border-slate-600 text-gray-400 hover:text-gray-200'
                                }`}
                              >
                                <ThemeIcon size={16} />
                                <span className="text-sm">{themeOption.label}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {item.type === 'toggle' && (
                      <ToggleSwitch 
                        enabled={item.value as boolean} 
                        onChange={('onChange' in item && item.onChange) ? item.onChange : () => {}} 
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800/40 backdrop-blur-md border border-teal-500/30 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:bg-blue-500/30 transition-colors"
            >
              <Download size={18} />
              <span>Export All Data</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 hover:bg-yellow-500/30 transition-colors"
            >
              <Upload size={18} />
              <span>Import Data</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 size={18} />
              <span>Clear All Data</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={itemVariants} className="flex justify-end gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-gray-300 hover:text-gray-100 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold shadow-lg shadow-teal-500/50 hover:shadow-teal-500/70 transition-all"
          >
            <span className="flex items-center gap-2">
              <Check size={18} />
              Save Changes
            </span>
          </motion.button>
        </motion.div>

      </motion.div>
    </main>
  );
};

export default Settings;
