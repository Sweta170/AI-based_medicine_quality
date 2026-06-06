/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A56A0',
        lightblue: '#D5E8F0',
        brand: {
          DEFAULT: '#1A56A0',
          light:   '#2563EB',
          dark:    '#1E3A5F',
        },
        surface: {
          900: '#0C1628',
          800: '#111827',
          700: '#1a2438',
          600: '#1f2d42',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
        greenAccent: '#16A34A',
        orangeAccent: '#D97706',
        redAccent: '#DC2626',
        bgLight: '#F9FAFB',
        textDark: '#1F2937',
        // Compatibility brand colors
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#031b2e',
        },
        darkbg: {
          50: '#f6f6f9',
          100: '#eef1f6',
          200: '#dbe1ed',
          300: '#bdc9dd',
          400: '#97abc9',
          500: '#788eb2',
          600: '#5e729a',
          700: '#4c5c7f',
          800: '#414e6a',
          900: '#2c3548',
          950: '#0a0f1d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
