import { z } from 'zod';

export const LOCALSTORAGE_THEME_KEY = 'theme';

export const ThemeSchema = z.enum(['light', 'dark']);
export type Theme = z.infer<typeof ThemeSchema>;
