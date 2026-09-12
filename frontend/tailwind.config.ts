import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ── Color Palette ─────────────────────────────────────────────────────
      colors: {
        // Backgrounds
        'rpg-bg':          '#0D0F1A', // Deep navy/charcoal main bg
        'rpg-surface':     '#13162A', // Slightly lighter surface
        'rpg-surface-2':   '#1C2040', // Cards, panels
        'rpg-surface-3':   '#252A4A', // Hover states, elevated elements
        'rpg-border':      '#2D3560', // Subtle borders
        'rpg-border-2':    '#3D4A7A', // More visible borders

        // Primary — Warm Gold
        'rpg-gold':        '#F5C842',
        'rpg-gold-light':  '#FFDD70',
        'rpg-gold-dark':   '#C9A030',
        'rpg-gold-muted':  '#7A6020',

        // Secondary — Emerald/Teal
        'rpg-emerald':     '#10B981',
        'rpg-emerald-light': '#34D399',
        'rpg-emerald-dark':  '#059669',

        // Accent — Arcane Purple/Blue
        'rpg-arcane':      '#7C3AED',
        'rpg-arcane-light':'#A78BFA',
        'rpg-arcane-dark': '#5B21B6',

        // RPG Danger
        'rpg-danger':      '#EF4444',
        'rpg-danger-light':'#FCA5A5',

        // Text
        'rpg-text':        '#F0EAD6', // Warm white / parchment
        'rpg-text-muted':  '#94A3B8', // Slate muted
        'rpg-text-faint':  '#475569', // Very faint
      },

      // ── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono:    ['"Fira Code"', '"Cascadia Code"', 'monospace'],
      },

      fontSize: {
        'xs':   ['0.75rem',  { lineHeight: '1rem' }],
        'sm':   ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem',     { lineHeight: '1.6rem' }],
        'lg':   ['1.125rem', { lineHeight: '1.75rem' }],
        'xl':   ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl':  ['1.5rem',   { lineHeight: '2rem' }],
        '3xl':  ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':  ['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':  ['3rem',     { lineHeight: '1.15' }],
        '6xl':  ['3.75rem',  { lineHeight: '1.1' }],
        '7xl':  ['4.5rem',   { lineHeight: '1.05' }],
      },

      // ── Gradients ─────────────────────────────────────────────────────────
      backgroundImage: {
        'rpg-gradient-hero':   'linear-gradient(135deg, #0D0F1A 0%, #1A1040 50%, #0D1A2A 100%)',
        'rpg-gradient-gold':   'linear-gradient(135deg, #F5C842 0%, #C9A030 100%)',
        'rpg-gradient-emerald':'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        'rpg-gradient-arcane': 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
        'rpg-gradient-card':   'linear-gradient(145deg, #1C2040 0%, #13162A 100%)',
        'rpg-gradient-glow':   'radial-gradient(circle, rgba(245,200,66,0.15) 0%, transparent 70%)',
      },

      // ── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        'rpg-sm':  '6px',
        'rpg':     '10px',
        'rpg-lg':  '16px',
        'rpg-xl':  '24px',
      },

      // ── Box Shadow ────────────────────────────────────────────────────────
      boxShadow: {
        'rpg-gold':    '0 2px 8px rgba(0,0,0,0.4), 0 0 6px rgba(245, 200, 66, 0.15)',
        'rpg-emerald': '0 2px 8px rgba(0,0,0,0.4), 0 0 6px rgba(16, 185, 129, 0.15)',
        'rpg-arcane':  '0 2px 8px rgba(0,0,0,0.4), 0 0 6px rgba(124, 58, 237, 0.15)',
        'rpg-card':    '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'rpg-inner':   'inset 0 2px 8px rgba(0,0,0,0.4)',
        'rpg-hover':   '0 8px 32px rgba(0,0,0,0.6)',
      },

      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(245,200,66,0.3)' },
          '50%':       { boxShadow: '0 0 28px rgba(245,200,66,0.6)' },
        },
        'xp-fill': {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--xp-width)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float-reward': {
          '0%':   { opacity: '0', transform: 'translateY(12px) scale(0.9)' },
          '20%':  { opacity: '1', transform: 'translateY(0) scale(1.05)' },
          '80%':  { opacity: '1', transform: 'translateY(-14px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-24px) scale(0.95)' },
        },
        'levelup-glow': {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 15px rgba(245,200,66,0.5))' },
          '50%':       { transform: 'scale(1.04)', filter: 'drop-shadow(0 0 35px rgba(245,200,66,0.85))' },
        },
        'coin-sparkle': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%':       { transform: 'translateY(-6px) rotate(-10deg) scale(1.15)' },
        },
        'card-enter': {
          '0%':   { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in':      'fade-in 0.5s ease-out forwards',
        'fade-in-up':   'fade-in-up 0.6s ease-out forwards',
        'glow-pulse':   'glow-pulse 2.5s ease-in-out infinite',
        'xp-fill':      'xp-fill 1.2s ease-out forwards',
        'float':        'float 3s ease-in-out infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'scale-in':     'scale-in 0.4s ease-out forwards',
        'spin-slow':    'spin-slow 8s linear infinite',
        'float-reward': 'float-reward 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'levelup-glow': 'levelup-glow 2s ease-in-out infinite',
        'coin-sparkle': 'coin-sparkle 0.8s ease-in-out',
        'card-enter':   'card-enter 0.3s ease-out forwards',
      },

      // ── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '54': '13.5rem',
        '58': '14.5rem',
        '62': '15.5rem',
        '66': '16.5rem',
        '70': '17.5rem',
        '74': '18.5rem',
        '78': '19.5rem',
        '82': '20.5rem',
        '86': '21.5rem',
        '90': '22.5rem',
        '94': '23.5rem',
        '98': '24.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
