/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A56A0',
        lightblue: '#D5E8F0',
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
