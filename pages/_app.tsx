import 'regenerator-runtime/runtime';
import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { LOCALSTORAGE_THEME_KEY, Theme, ThemeSchema } from '@/schemas/theme';
import { useLocalStorage } from '@/utils/hooks/useLocalStorage';
import { ThemeContext } from '@/utils/contexts/themeContext';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useLocalStorage<Theme>(
    LOCALSTORAGE_THEME_KEY,
    ThemeSchema.Enum.light,
  );
  return (
    <main className={inter.variable}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Component {...pageProps} />
        <Toaster />
      </ThemeContext.Provider>
    </main>
  );
}

export default MyApp;
