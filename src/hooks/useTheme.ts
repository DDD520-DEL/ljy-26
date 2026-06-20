import { useAppStore } from '@/store';

type Theme = 'light' | 'dark';

export function useTheme() {
  const theme = useAppStore(s => s.theme);
  const isDark = useAppStore(s => s.isDark);
  const toggleTheme = useAppStore(s => s.toggleTheme);
  const setTheme = useAppStore(s => s.setTheme);

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark,
  };
}
