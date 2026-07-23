/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          dark: '#0B0F19',
          accent: '#6366F1',
          card: '#111827',
        },
      },
    },
  },
  plugins: [],
};
