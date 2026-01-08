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
        // Brand Primary Colors
        'deep-blue': 'rgb(var(--deep-blue) / <alpha-value>)',
        teal: 'rgb(var(--teal) / <alpha-value>)',
        purple: 'rgb(var(--purple) / <alpha-value>)',

        // Brand Gradient Spectrum
        magenta: 'rgb(var(--magenta) / <alpha-value>)',
        violet: 'rgb(var(--violet) / <alpha-value>)',
        azure: 'rgb(var(--azure) / <alpha-value>)',
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        seafoam: 'rgb(var(--seafoam) / <alpha-value>)',

        // Neutrals
        ivory: 'rgb(var(--ivory) / <alpha-value>)',
        'ivory-warm': 'rgb(var(--ivory-warm) / <alpha-value>)',
        'ivory-dark': 'rgb(var(--ivory-dark) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',

        // Legacy Aliases
        vermillion: 'rgb(var(--teal) / <alpha-value>)',
        'vermillion-deep': 'rgb(var(--seafoam) / <alpha-value>)',
        midnight: 'rgb(var(--deep-blue) / <alpha-value>)',
        gold: 'rgb(var(--teal) / <alpha-value>)',
        'gold-muted': 'rgb(var(--cyan) / <alpha-value>)',
        petrol: 'rgb(var(--purple) / <alpha-value>)',
        blush: 'rgb(var(--blush) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['Big Caslon CC', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'Source Han Sans SC', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        chinese: ['Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(4rem, 15vw, 14rem)', { lineHeight: '0.85', letterSpacing: '-0.05em' }],
        'display-lg': ['clamp(3.5rem, 12vw, 10rem)', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        'display-md': ['clamp(2.25rem, 6vw, 5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        'section': 'clamp(5rem, 10vw, 8rem)',
        'section-sm': 'clamp(3rem, 6vw, 5rem)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '20px',
        '2xl': '28px',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgb(var(--ink) / 0.04), 0 4px 16px rgb(var(--ink) / 0.06)',
        'brand-md': '0 4px 12px rgb(var(--ink) / 0.04), 0 12px 32px rgb(var(--ink) / 0.08)',
        'brand-lg': '0 8px 24px rgb(var(--ink) / 0.06), 0 24px 48px rgb(var(--ink) / 0.1)',
        'brand-xl': '0 12px 36px rgb(var(--ink) / 0.08), 0 36px 72px rgb(var(--ink) / 0.12)',
        'teal-glow': '0 4px 20px rgb(var(--teal) / 0.3)',
        'teal-glow-lg': '0 8px 30px rgb(var(--teal) / 0.4)',
        'purple-glow': '0 4px 20px rgb(var(--purple) / 0.3)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, rgb(var(--magenta)) 0%, rgb(var(--violet)) 25%, rgb(var(--azure)) 50%, rgb(var(--teal)) 75%, rgb(var(--seafoam)) 100%)',
        'gradient-brand-horizontal': 'linear-gradient(90deg, rgb(var(--teal)), rgb(var(--magenta)))',
        'gradient-brand-vertical': 'linear-gradient(180deg, rgb(var(--magenta)), rgb(var(--violet)), rgb(var(--teal)))',
        'gradient-dark': 'linear-gradient(135deg, rgb(var(--deep-blue)) 0%, rgb(var(--purple)) 100%)',
        'gradient-mesh': 'radial-gradient(ellipse 100% 80% at 80% 0%, rgba(var(--purple), 0.08) 0%, transparent 50%), radial-gradient(ellipse 80% 100% at 0% 100%, rgba(var(--teal), 0.06) 0%, transparent 50%)',
      },
      animation: {
        'reveal': 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal-delayed': 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'marquee': 'marquee 35s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slide-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'blink': 'blink 0.8s infinite',
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
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: '#ffffff',
            foreground: '#424243',
            primary: {
              50: '#e6f7f7',
              100: '#ccefef',
              200: '#99dfdf',
              300: '#66cfcf',
              400: '#4dbfbf',
              500: '#3da6a6', // Primary Teal
              600: '#318585',
              700: '#256464',
              800: '#194242',
              900: '#0c2121',
              DEFAULT: '#3da6a6',
              foreground: '#ffffff',
            },
            secondary: {
              50: '#e8e4f0',
              100: '#d1c9e1',
              200: '#a393c3',
              300: '#755da5',
              400: '#5c3d97',
              500: '#471D8F', // Primary Purple
              600: '#391772',
              700: '#2b1156',
              800: '#1d0c39',
              900: '#0e061d',
              DEFAULT: '#471D8F',
              foreground: '#ffffff',
            },
            focus: '#3da6a6',
          },
        },
        dark: {
          colors: {
            background: '#0c183d',
            foreground: '#ffffff',
            primary: {
              50: '#0c2121',
              100: '#194242',
              200: '#256464',
              300: '#318585',
              400: '#3da6a6',
              500: '#4dbfbf',
              600: '#66cfcf',
              700: '#99dfdf',
              800: '#ccefef',
              900: '#e6f7f7',
              DEFAULT: '#3da6a6',
              foreground: '#0c183d',
            },
            secondary: {
              DEFAULT: '#cc3d8f',
              foreground: '#ffffff',
            },
            focus: '#3da6a6',
          },
        },
      },
    }),
  ],
}

export default config
