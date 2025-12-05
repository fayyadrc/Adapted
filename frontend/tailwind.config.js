const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapping 'purple' to a lighter, more vibrant violet for the "light purple" feel
        purple: {
          ...colors.violet,
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Primary brand color
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Mapping 'blue' to sky/light blue for the "light blue" feel
        blue: {
          ...colors.sky,
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Secondary brand color
          600: '#0284c7',
        },
        // Explicit brand aliases if needed, but overriding purple/blue covers most existing code
        brand: {
          purple: '#8b5cf6',
          blue: '#38bdf8',
        }
      }
    },
  },
  plugins: [],
}