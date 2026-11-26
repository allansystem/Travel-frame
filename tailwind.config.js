/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        gallery: {
          950: '#090a0c',
          900: '#111317',
          850: '#171a20',
          800: '#222630',
          700: '#323846',
        }
      },
      boxShadow: {
        'matting': 'inset 0 0 50px rgba(0, 0, 0, 0.65), 0 15px 35px rgba(0, 0, 0, 0.5)',
        'plaque': '0 12px 36px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'ken-burns': 'kenburns 20s ease-out infinite alternate',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-1%, -1%)' },
        }
      }
    },
  },
  plugins: [],
}
