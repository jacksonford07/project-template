/**
 * PWA Utilities
 *
 * Progressive Web App utilities for service worker registration,
 * install prompts, and update notifications.
 *
 * @example
 * ```tsx
 * import { usePWA } from '@/lib/features/pwa';
 *
 * function App() {
 *   const { isInstallable, isOffline, promptInstall, updateAvailable } = usePWA();
 *
 *   return (
 *     <>
 *       {isOffline && <OfflineBanner />}
 *       {isInstallable && <InstallButton onClick={promptInstall} />}
 *       {updateAvailable && <UpdateNotification />}
 *     </>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/lib/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    logger.warn('PWA', 'Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    logger.info('PWA', 'Service worker registered', {
      scope: registration.scope,
    });

    // Check for updates periodically
    setInterval(() => {
      void registration.update();
    }, 60 * 60 * 1000); // Every hour

    return registration;
  } catch (error) {
    logger.error('PWA', 'Service worker registration failed', error as Error);
    return null;
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
    logger.info('PWA', 'Service workers unregistered');
    return true;
  } catch (error) {
    logger.error('PWA', 'Failed to unregister service workers', error as Error);
    return false;
  }
}

/**
 * Check if app is running as installed PWA
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

/**
 * React hook for PWA functionality
 */
export function usePWA(): PWAState & {
  promptInstall: () => Promise<boolean>;
  skipWaiting: () => void;
} {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOffline: false,
    updateAvailable: false,
    registration: null,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Register service worker on mount
  useEffect(() => {
    // Check initial states
    setState((prev) => ({
      ...prev,
      isInstalled: isStandalone(),
      isOffline: typeof navigator !== 'undefined' && !navigator.onLine,
    }));

    // Register service worker
    void registerServiceWorker().then((registration) => {
      if (registration) {
        setState((prev) => ({ ...prev, registration }));

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState((prev) => ({ ...prev, updateAvailable: true }));
                logger.info('PWA', 'Update available');
              }
            });
          }
        });
      }
    });

    // Listen for install prompt
    const handleBeforeInstall = (e: Event): void => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState((prev) => ({ ...prev, isInstallable: true }));
      logger.info('PWA', 'Install prompt available');
    };

    // Listen for app installed
    const handleAppInstalled = (): void => {
      setDeferredPrompt(null);
      setState((prev) => ({ ...prev, isInstalled: true, isInstallable: false }));
      logger.info('PWA', 'App installed');
    };

    // Listen for online/offline
    const handleOnline = (): void => {
      setState((prev) => ({ ...prev, isOffline: false }));
      logger.info('PWA', 'Back online');
    };

    const handleOffline = (): void => {
      setState((prev) => ({ ...prev, isOffline: true }));
      logger.info('PWA', 'Gone offline');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Prompt user to install
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      logger.warn('PWA', 'No install prompt available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      logger.info('PWA', `Install prompt outcome: ${outcome}`);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState((prev) => ({ ...prev, isInstallable: false }));
        return true;
      }
      return false;
    } catch (error) {
      logger.error('PWA', 'Install prompt failed', error as Error);
      return false;
    }
  }, [deferredPrompt]);

  // Skip waiting and activate new service worker
  const skipWaiting = useCallback((): void => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [state.registration]);

  return {
    ...state,
    promptInstall,
    skipWaiting,
  };
}

/**
 * Component to show update notification
 */
export function useUpdateNotification(): {
  showUpdate: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
} {
  const { updateAvailable, skipWaiting } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  return {
    showUpdate: updateAvailable && !dismissed,
    applyUpdate: skipWaiting,
    dismissUpdate: () => setDismissed(true),
  };
}
