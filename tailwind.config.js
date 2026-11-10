/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ethereal: {
          dark: '#080d1a',
          card: 'rgba(15, 23, 42, 0.75)',
          gold: '#fcd34d',
          cyan: '#38bdf8',
          violet: '#a855f7'
        }
      }
    },
  },
  plugins: [],
}

