/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#244C3A',
          deep: '#1B382B',
          light: '#2E614A',
          subtle: '#E9EFEA',
        },
        sage: {
          DEFAULT: '#A8B9A0',
          dark: '#879A7E',
          light: '#C4D1BF',
          wash: '#EFF4ED',
        },
        ivory: {
          DEFAULT: '#FAF8F2',
          warm: '#F4EFE6',
          border: '#E8E2D5',
        },
        orange: {
          muted: '#D98B54',
          hover: '#C47741',
          subtle: '#FAF0E7',
        },
        charcoal: {
          DEFAULT: '#252A27',
          soft: '#3D4440',
          muted: '#636B66',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(37, 42, 39, 0.05), 0 2px 6px -1px rgba(37, 42, 39, 0.03)',
        'warm-lg': '0 10px 30px -4px rgba(37, 42, 39, 0.08), 0 4px 12px -2px rgba(37, 42, 39, 0.04)',
      },
    },
  },
  plugins: [],
}
