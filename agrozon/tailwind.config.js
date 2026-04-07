/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Agrozon brand palette — earthy, organic
        forest: {
          50:  '#f0faf4',
          100: '#d9f2e3',
          200: '#b4e5c9',
          300: '#7dd0a6',
          400: '#45b47e',
          500: '#22975f',
          600: '#14794b',
          700: '#10603c',
          800: '#0d4d31',
          900: '#0a3d27',
        },
        harvest: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        soil: {
          50:  '#fdf8f3',
          100: '#faeee0',
          200: '#f4dac0',
          300: '#ebbf94',
          400: '#df9e64',
          500: '#d4824a',
          600: '#b86538',
          700: '#974f2e',
          800: '#7c4029',
          900: '#663524',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
