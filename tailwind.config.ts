import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          light: '#F5F1E8',
          dark: '#162536',
        },
        card: {
          dark: '#1F2937',
        },
        gold: {
          DEFAULT: '#B89651',
          soft: '#C9B98C',
          deep: '#8A7340',
        },
        tan: {
          card: '#E8DDC8',
        },
        ink: {
          DEFAULT: '#1F2937',
          white: '#F5F1E8',
          mutedLt: '#6B7280',
          mutedDk: '#9CA3AF',
        },
        line: {
          dim: '#C9B98C',
          dark: '#3A4A60',
        },
        neg: {
          strong: '#B5443A',
          mild: '#324A66',
        },
      },
      fontFamily: {
        serif: ['"Source Serif Pro"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['11px', { letterSpacing: '0.2em', lineHeight: '1.4' }],
      },
      maxWidth: {
        content: '1200px',
      },
      letterSpacing: {
        eyebrow: '0.2em',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'draw-line': 'drawLine 1.5s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drawLine: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--bar-end, 100%)' },
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;
