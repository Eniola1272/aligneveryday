/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0A',
        surface: '#171717',
        elevated: '#202020',
        accent: '#FF9D00',
        cream: '#F7F4EF',
        muted: '#8D8D91',
      },
    },
  },
  plugins: [],
};
