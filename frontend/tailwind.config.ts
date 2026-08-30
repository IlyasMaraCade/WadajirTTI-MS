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
          DEFAULT: '#1B4E4A',
          50: '#E8F5F4',
          100: '#C5E8E5',
          200: '#8DD0CC',
          300: '#55B8B3',
          400: '#26B5A3',
          500: '#1B4E4A',
          600: '#163F3C',
          700: '#11302D',
          800: '#0B211F',
          900: '#061110',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#26B5A3',
          foreground: '#FFFFFF',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        text: {
          primary: '#1A1A2E',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
          info: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        sidebar: '2px 0 8px 0 rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;