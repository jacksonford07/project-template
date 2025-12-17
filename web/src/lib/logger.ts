/**
 * Standardized Logging System
 *
 * Provides consistent logging with:
 * - Clear log levels (debug, info, success, warn, error)
 * - Contextual prefixes
 * - Emoji indicators for quick visual scanning
 * - Automatic error tracking
 * - Performance monitoring
 */

import { isDevelopment } from './env';

export interface LogContext {
  userId?: string;
  route?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

export const logger = {
  /**
   * Debug: Detailed information for development only
   * Only shows in development mode
   */
  debug: (context: string, message: string, data?: LogContext): void => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] [${context}] ${message}`, data ?? '');
    }
  },

  /**
   * Info: Normal operation logs
   * Use for routine operations and flow tracking
   */
  info: (context: string, message: string, data?: LogContext): void => {
    // eslint-disable-next-line no-console
    console.log(`[INFO] [${context}] ${message}`, data ?? '');
  },

  /**
   * Success: Completed operations
   * Use when operations complete successfully
   */
  success: (context: string, message: string, data?: LogContext): void => {
    // eslint-disable-next-line no-console
    console.log(`[SUCCESS] [${context}] ${message}`, data ?? '');
  },

  /**
   * Warn: Issues that need attention but aren't errors
   * Use for recoverable issues, degraded performance, etc.
   */
  warn: (context: string, message: string, data?: LogContext): void => {
    console.warn(`[WARN] [${context}] ${message}`, data ?? '');
  },

  /**
   * Error: Actual errors that need investigation
   * Automatically tracked in database (server-side)
   */
  error: (context: string, message: string, error: Error | unknown, data?: LogContext): void => {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error(`[ERROR] [${context}] ${message}`, errorObj);

    // Track error asynchronously (server-side only)
    if (typeof window === 'undefined') {
      void import('./error-tracker')
        .then(({ ErrorTracker }) => {
          void ErrorTracker.captureError(errorObj, {
            context,
            message,
            ...data,
          });
        })
        .catch((err) => {
          console.error('Failed to track error:', err);
        });
    }
  },

  /**
   * Performance: Track operation timing
   * Records duration for analysis, flags slow operations
   */
  performance: (context: string, operation: string, duration: number, data?: LogContext): void => {
    if (duration > 1000) {
      // Slow operation warning
      console.warn(`[PERF] [${context}] ${operation} took ${duration}ms (SLOW)`, data ?? '');
    } else {
      // eslint-disable-next-line no-console
      console.log(`[PERF] [${context}] ${operation} took ${duration}ms`, data ?? '');
    }

    // Track performance asynchronously (server-side only)
    if (typeof window === 'undefined') {
      void import('./performance-monitor')
        .then(({ PerformanceMonitor }) => {
          void PerformanceMonitor.record({
            context,
            operation,
            duration,
            ...data,
          });
        })
        .catch((err) => {
          console.error('Failed to track performance:', err);
        });
    }
  },
};

/**
 * Convenience wrapper for timing operations
 *
 * Usage:
 *   const timer = startTimer();
 *   await doWork();
 *   timer.end('ServiceName', 'Operation name');
 */
export function startTimer(): {
  end: (context: string, operation: string, data?: LogContext) => number;
} {
  const start = performance.now();

  return {
    end: (context: string, operation: string, data?: LogContext): number => {
      const duration = Math.round(performance.now() - start);
      logger.performance(context, operation, duration, data);
      return duration;
    },
  };
}
