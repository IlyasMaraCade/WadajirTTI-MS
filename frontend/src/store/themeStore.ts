import { create } from 'zustand';

type Theme = 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>(() => ({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
}));

// Always ensure light mode
if (typeof window !== 'undefined') {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('wadajir_theme');
}
