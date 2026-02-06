/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#a855f7',
        'neon-pink': '#ec4899',
        'neon-blue': '#3b82f6',
        'neon-green': '#10b981',
        'neuro-darker': '#0a0e27',
      },
    },
  },
  plugins: [],
}
