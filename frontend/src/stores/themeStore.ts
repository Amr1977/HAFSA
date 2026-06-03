import { create } from 'zustand';

type Theme = 'light' | 'dark';

const getInitial = (): Theme => {
  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const apply = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

export const useTheme = create<ThemeState>((set) => {
  const initial = getInitial();
  apply(initial);

  return {
    theme: initial,
    toggle: () => set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light';
      apply(next);
      localStorage.setItem('theme', next);
      return { theme: next };
    }),
  };
});
