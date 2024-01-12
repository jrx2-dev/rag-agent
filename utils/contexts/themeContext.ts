import { Theme } from '@/schemas/theme';
import { Dispatch, SetStateAction, createContext } from 'react';

export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme | undefined>>;
} | null>(null);
