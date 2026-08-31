import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B2B2C', // Dark Teal from logo text
          50: '#E6F0F0',
          100: '#C0DADA',
          200: '#96C1C1',
          300: '#6BA5A6',
          400: '#478E8F',
          500: '#237677',
          600: '#1B5F60',
          700: '#14494A',
          800: '#0B2B2C',
          900: '#071818',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#00C9C8', // Bright Cyan from logo book/stars
          50: '#E0F9F8',
          100: '#B3EFEB',
          200: '#80E2DE',
          300: '#4DD4D0',
          400: '#26C9C5',
          500: '#00C9C8',
          600: '#00B0AE',
          700: '#008C8B',
          800: '#006B6B',
          900: '#004747',
          foreground: '#FFFFFF',
        },
        background: '#F4F7F9', // Slightly softer slate/gray
        surface: '#FFFFFF',
        border: '#E2E8F0',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(11, 43, 44, 0.05), 0 4px 16px -4px rgba(11, 43, 44, 0.02)',
        'card-hover': '0 4px 12px -2px rgba(11, 43, 44, 0.08), 0 8px 24px -4px rgba(11, 43, 44, 0.04)',
        sidebar: '2px 0 12px 0 rgba(11, 43, 44, 0.05)',
        glow: '0 0 15px 0 rgba(0, 201, 200, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;