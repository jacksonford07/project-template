/**
 * Observability Module
 *
 * Unified interface for error tracking, performance monitoring, and logging.
 * Supports multiple backends: database, Sentry, DataDog, etc.
 *
 * Setup:
 * 1. Database logging works out of the box
 * 2. For Sentry: pnpm add @sentry/nextjs && npx @sentry/wizard -i nextjs
 * 3. For DataDog: pnpm add dd-trace
 *
 * @example
 * ```ts
 * import { observability } from '@/lib/observability';
 *
 * // Track errors
 * observability.captureError(error, { userId: '123', action: 'checkout' });
 *
 * // Track performance
 * const stop = observability.startTimer('api', 'fetchUsers');
 * await fetchUsers();
 * stop();
 * ```
 */

import { prisma } from './prisma';
import { isProduction, isDevelopment } from './env';

// ============================================
// Types
// ============================================

export interface ErrorContext {
  userId?: string;
  requestUrl?: string;
  requestMethod?: string;
  action?: string;
  component?: string;
  [key: string]: unknown;
}

export interface PerformanceContext {
  route?: string;
  method?: string;
  userId?: string;
  statusCode?: number;
  cached?: boolean;
  [key: string]: unknown;
}

// ============================================
// Sentry Integration (optional)
// ============================================

let Sentry: typeof import('@sentry/nextjs') | null = null;

async function getSentry() {
  if (Sentry !== null) return Sentry;

  try {
    Sentry = await import('@sentry/nextjs');
    return Sentry;
  } catch {
    // Sentry not installed
    return null;
  }
}

// ============================================
// Observability Class
// ============================================

class Observability {
  /**
   * Capture and track an error
   *
   * Sends to:
   * - Database (ErrorLog table)
   * - Sentry (if configured)
   * - Console (in development)
   */
  async captureError(
    error: Error | unknown,
    context: ErrorContext = {}
  ): Promise<void> {
    const err = error instanceof Error ? error : new Error(String(error));

    // Console in development
    if (isDevelopment) {
      console.error('[Observability] Error captured:', err.message, context);
    }

    // Database logging
    try {
      await prisma.errorLog.create({
        data: {
          level: 'error',
          context: context.component ?? context.action ?? 'unknown',
          message: err.message,
          stack: err.stack,
          userId: context.userId,
          requestUrl: context.requestUrl,
          requestMethod: context.requestMethod,
          metadata: context as object,
        },
      });
    } catch (dbError) {
      console.error('[Observability] Failed to save to database:', dbError);
    }

    // Sentry (if available)
    const sentry = await getSentry();
    if (sentry) {
      sentry.captureException(err, {
        extra: context,
        user: context.userId ? { id: context.userId } : undefined,
      });
    }
  }

  /**
   * Capture a warning (non-critical issue)
   */
  async captureWarning(
    message: string,
    context: ErrorContext = {}
  ): Promise<void> {
    if (isDevelopment) {
      console.warn('[Observability] Warning:', message, context);
    }

    try {
      await prisma.errorLog.create({
        data: {
          level: 'warn',
          context: context.component ?? context.action ?? 'unknown',
          message,
          userId: context.userId,
          requestUrl: context.requestUrl,
          requestMethod: context.requestMethod,
          metadata: context as object,
        },
      });
    } catch (dbError) {
      console.error('[Observability] Failed to save warning:', dbError);
    }

    const sentry = await getSentry();
    if (sentry) {
      sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
      });
    }
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(
    operation: string,
    durationMs: number,
    context: PerformanceContext = {}
  ): Promise<void> {
    // Console in development for slow operations
    if (isDevelopment && durationMs > 1000) {
      console.warn(
        `[Observability] Slow operation: ${operation} took ${durationMs}ms`
      );
    }

    try {
      await prisma.performanceMetric.create({
        data: {
          route: context.route ?? operation,
          method: context.method ?? 'UNKNOWN',
          duration: durationMs,
          userId: context.userId,
          statusCode: context.statusCode ?? 200,
          cached: context.cached ?? false,
        },
      });
    } catch (dbError) {
      console.error('[Observability] Failed to save metric:', dbError);
    }
  }

  /**
   * Start a performance timer
   *
   * @returns Function to stop timer and record metric
   *
   * @example
   * ```ts
   * const stop = observability.startTimer('fetchUsers');
   * const users = await fetchUsers();
   * stop({ route: '/api/users', statusCode: 200 });
   * ```
   */
  startTimer(operation: string): (context?: PerformanceContext) => void {
    const start = performance.now();

    return (context: PerformanceContext = {}) => {
      const duration = Math.round(performance.now() - start);
      void this.trackPerformance(operation, duration, context);
    };
  }

  /**
   * Set user context for all subsequent events
   * Call this after user authentication
   */
  async setUser(userId: string, email?: string): Promise<void> {
    const sentry = await getSentry();
    if (sentry) {
      sentry.setUser({ id: userId, email });
    }
  }

  /**
   * Clear user context (on logout)
   */
  async clearUser(): Promise<void> {
    const sentry = await getSentry();
    if (sentry) {
      sentry.setUser(null);
    }
  }

  /**
   * Add breadcrumb for debugging
   * Breadcrumbs show the trail of events leading to an error
   */
  async addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const sentry = await getSentry();
    if (sentry) {
      sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    }

    if (isDevelopment) {
      console.log(`[Breadcrumb] ${category}: ${message}`, data);
    }
  }

  /**
   * Wrap an async function with automatic error tracking
   *
   * @example
   * ```ts
   * const fetchUsers = observability.withErrorTracking(
   *   async () => prisma.user.findMany(),
   *   { component: 'UserService', action: 'fetchUsers' }
   * );
   * ```
   */
  withErrorTracking<T>(
    fn: () => Promise<T>,
    context: ErrorContext
  ): () => Promise<T> {
    return async () => {
      try {
        return await fn();
      } catch (error) {
        await this.captureError(error, context);
        throw error;
      }
    };
  }

  /**
   * Wrap a function with automatic performance tracking
   */
  withPerformanceTracking<T>(
    fn: () => Promise<T>,
    operation: string,
    context: PerformanceContext = {}
  ): () => Promise<T> {
    return async () => {
      const stop = this.startTimer(operation);
      try {
        const result = await fn();
        stop({ ...context, statusCode: 200 });
        return result;
      } catch (error) {
        stop({ ...context, statusCode: 500 });
        throw error;
      }
    };
  }
}

// Export singleton
export const observability = new Observability();

// ============================================
// Convenience exports
// ============================================

export const captureError = observability.captureError.bind(observability);
export const captureWarning = observability.captureWarning.bind(observability);
export const trackPerformance = observability.trackPerformance.bind(observability);
export const startTimer = observability.startTimer.bind(observability);
