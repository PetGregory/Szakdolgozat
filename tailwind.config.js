/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        accent1: '#FF5722',
        accent2: '#673AB7',
        darkgray: '#121212',
        primary: '#F7F7F7',
        secondary: '#E4E4E4',
        hovercolor: '#FFEB3B',
      },
    },
  },
  plugins: [],
};