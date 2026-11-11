import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c9a84c',
          light: '#f0c040',
          dark: '#a07830',
        },
        studio: {
          bg: '#0a0a0a',
          panel: 'rgba(255,255,255,0.04)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(201, 168, 76, 0.7)',
          },
          '50%': {
            boxShadow: '0 0 0 20px rgba(201, 168, 76, 0)',
          },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        shimmer: 'shimmer 3s linear infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #a07830, #c9a84c, #f0c040)',
      },
    },
  },
  plugins: [],
}
export default config
