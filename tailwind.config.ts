import { nextui } from '@nextui-org/theme'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: 'rgb(var(--ivory) / <alpha-value>)',
        'ivory-dark': 'rgb(var(--ivory-dark) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        vermillion: 'rgb(var(--vermillion) / <alpha-value>)',
        'vermillion-deep': 'rgb(var(--vermillion-deep) / <alpha-value>)',
        midnight: 'rgb(var(--midnight) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-muted': 'rgb(var(--gold-muted) / <alpha-value>)',
        petrol: 'rgb(var(--petrol) / <alpha-value>)',
        blush: 'rgb(var(--blush) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'reveal': 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'marquee': 'marquee 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: '#fcfaf5',
            foreground: '#0f0f14',
            primary: {
              50: '#fff5f4',
              100: '#ffe8e6',
              200: '#ffd4cf',
              300: '#ffb3ab',
              400: '#ff877b',
              500: '#e84132',
              600: '#c43528',
              700: '#a32b21',
              800: '#87251c',
              900: '#70211a',
              DEFAULT: '#e84132',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#14161f',
              foreground: '#fcfaf5',
            },
            focus: '#e84132',
          },
        },
      },
    }),
  ],
}

export default config
