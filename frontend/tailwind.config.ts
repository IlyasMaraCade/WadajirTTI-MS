import type { Config } from 'tailwindcss';

const config: Config = {
  // darkMode disabled
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d3233', // Slightly warmer dark teal
          50: '#f1f6f6',
          100: '#ddecec',
          200: '#bedadb',
          300: '#94c2c3',
          400: '#64a3a4',
          500: '#468688',
          600: '#386a6d',
          700: '#305658',
          800: '#2a484a',
          900: '#0d3233',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#00b5b4', // Adjusted cyan
          50: '#ecfdfd',
          100: '#cff9f9',
          200: '#a3f0f1',
          300: '#66e2e4',
          400: '#2ecdd0',
          500: '#0bb7ba',
          600: '#00b5b4',
          700: '#0b7578',
          800: '#105d5f',
          900: '#124d4f',
          foreground: '#FFFFFF',
        },
        background: '#f8fafc',
        surface: '#FFFFFF',
        border: '#e2e8f0',
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#94a3b8',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.025)',
        sidebar: '2px 0 10px rgba(0, 0, 0, 0.03)',
        glow: '0 0 15px 0 rgba(0, 181, 180, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
