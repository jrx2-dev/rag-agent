import Link from 'next/link';
import { ModeToggle } from '@/components/system/themeToggle';
import { cn } from '@/utils/cn';
import { useTheme } from '@/utils/hooks/useTheme';
import Image from 'next/image';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();
  return (
    <div
      className={cn(
        'mx-auto flex flex-col space-y-4 justify-between h-full min-h-screen bg-background',
        {
          dark: theme === 'dark',
        },
      )}
    >
      <header className="container sticky top-0 z-40 bg-background">
        <div className="h-16 border-b border-b-slate-600 py-4">
          <nav className="flex justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                alt="RAG Agent"
                src="/favicon.ico"
                width={20}
                height={20}
              />
              <Link
                href="/"
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                RAG Agent
              </Link>
            </div>

            <div className="flex gap-4">
              <Link
                href="/"
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Chat
              </Link>
              <Link
                href="/tools"
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Tools
              </Link>
              <Link
                href="/pinecone"
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Data Store
              </Link>
              <Link
                href="/config"
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Config
              </Link>
              <div className="mt-[-0.5rem]">
                <ModeToggle />
              </div>
            </div>
          </nav>
        </div>
      </header>
      <div>
        <main className="flex w-full flex-1 flex-col overflow-hidden h-auto bg-background">
          {children}
        </main>
      </div>
      <footer className="m-auto p-4 bg-background text-primary">
        <a className="text-slate-600" href="https://twitter.com/niandubay">
          Powered by LangChainAI. Demo built by JR (Twitter: @niandubay).
        </a>
      </footer>
    </div>
  );
}
