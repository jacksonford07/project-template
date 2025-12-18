'use client';

/**
 * Application Providers
 *
 * Wraps the application with all necessary context providers.
 * Add new providers here to keep the root layout clean.
 *
 * Current providers:
 * - ThemeProvider: Dark/light mode (next-themes)
 * - UserProvider: User session context
 * - ToastProvider: Toast notification system
 * - QueryProvider: TanStack Query (optional, see lib/query.ts)
 */

import { type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { UserProvider } from '@/contexts/UserContext';
import { ToastProvider } from '@/components/ui/Toast';
import { QueryProvider } from '@/lib/query';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): React.ReactElement {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <UserProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </UserProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
