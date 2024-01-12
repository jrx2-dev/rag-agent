import { Theme, ThemeSchema } from '@/schemas/theme';
import { useContext, Dispatch, SetStateAction } from 'react';
import { ThemeContext } from '../contexts/themeContext';

export function useTheme() {
  const themeConfig = useContext(ThemeContext);
  let theme: Theme = ThemeSchema.Enum.light;
  let setTheme: Dispatch<SetStateAction<Theme | undefined>> = () => {};

  if (themeConfig) {
    theme = themeConfig.theme;
    setTheme = themeConfig.setTheme;
  }

  return { theme, setTheme };
}
