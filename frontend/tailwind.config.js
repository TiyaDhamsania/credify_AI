/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Sora', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Sora', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink:   '#0A0B0F',
        slate: '#1C1E27',
        card:  '#13151C',
        muted: '#2A2D3A',
        edge:  '#333748',
        lime:  { DEFAULT: '#C8F04D', dark: '#A8CC30' },
        coral: { DEFAULT: '#FF6B6B', dark: '#E05555' },
        sky:   { DEFAULT: '#5EBBF0', dark: '#3A9ED4' },
        text: {
          primary:   '#F2F3F7',
          secondary: '#9499B0',
          muted:     '#5A5F78',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        glow:      '0 0 40px rgba(200, 240, 77, 0.12)',
        'glow-lg': '0 0 80px rgba(200, 240, 77, 0.18)',
        card:      '0 4px 24px rgba(0,0,0,0.4)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-lime': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(200,240,77,0.4)' },
          '50%':     { boxShadow: '0 0 0 12px rgba(200,240,77,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.6s ease both',
        'fade-in':    'fade-in 0.4s ease both',
        'pulse-lime': 'pulse-lime 2s infinite',
        shimmer:      'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [],
}
