'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Theme Toggle Component
 *
 * Allows users to switch between light, dark, and system themes.
 * Uses next-themes for persistence and SSR-safe rendering.
 *
 * @example
 * ```tsx
 * // Simple toggle (light/dark)
 * <ThemeToggle />
 *
 * // With system option
 * <ThemeToggle showSystem />
 *
 * // Dropdown selector
 * <ThemeSelector />
 * ```
 */

interface ThemeToggleProps {
  showSystem?: boolean;
  className?: string;
}

export function ThemeToggle({
  showSystem = false,
  className = '',
}: ThemeToggleProps): React.ReactElement | null {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder with same dimensions to prevent layout shift
    return (
      <button
        className={`p-2 rounded-lg bg-secondary ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  const toggleTheme = () => {
    if (showSystem) {
      // Cycle: light -> dark -> system
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('system');
      else setTheme('light');
    } else {
      // Toggle: light <-> dark
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    }
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg bg-secondary hover:bg-accent transition-colors ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={showSystem ? `Current: ${theme}` : undefined}
    >
      {isDark ? (
        // Sun icon for dark mode (clicking switches to light)
        <SunIcon className="h-5 w-5 text-foreground" />
      ) : (
        // Moon icon for light mode (clicking switches to dark)
        <MoonIcon className="h-5 w-5 text-foreground" />
      )}
    </button>
  );
}

/**
 * Theme Selector Dropdown
 *
 * Shows all theme options in a dropdown menu.
 */
interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({
  className = '',
}: ThemeSelectorProps): React.ReactElement | null {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <select className={`p-2 rounded-lg bg-secondary ${className}`} disabled>
        <option>Theme</option>
      </select>
    );
  }

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className={`p-2 rounded-lg bg-secondary text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
      aria-label="Select theme"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}

/**
 * Theme Toggle with Labels
 *
 * Shows theme options as labeled buttons.
 */
interface ThemeButtonsProps {
  className?: string;
}

export function ThemeButtons({
  className = '',
}: ThemeButtonsProps): React.ReactElement | null {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerIcon },
  ];

  return (
    <div className={`flex rounded-lg bg-muted p-1 ${className}`}>
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={`Use ${label} theme`}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// Icons
function SunIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function ComputerIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}
