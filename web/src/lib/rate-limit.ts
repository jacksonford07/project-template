/**
 * Simple in-memory rate limiter for API routes
 *
 * For production with multiple instances, use Redis-based rate limiting
 * (e.g., @upstash/ratelimit with Upstash Redis)
 *
 * @module rate-limit
 */

interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  max: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis for production with multiple instances)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer !== null) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);

  // Don't prevent Node from exiting
  cleanupTimer.unref();
}

/**
 * Check rate limit for a given identifier
 *
 * @param identifier - Unique identifier (IP address, user ID, API key)
 * @param config - Rate limit configuration
 * @returns Object with success status and rate limit info
 *
 * @example
 * ```ts
 * // In API route
 * const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
 * const { success, remaining, reset } = checkRateLimit(ip, {
 *   windowMs: 60 * 1000, // 1 minute
 *   max: 10, // 10 requests per minute
 * });
 *
 * if (!success) {
 *   return new Response('Too Many Requests', {
 *     status: 429,
 *     headers: {
 *       'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
 *       'X-RateLimit-Limit': String(10),
 *       'X-RateLimit-Remaining': '0',
 *       'X-RateLimit-Reset': String(reset),
 *     },
 *   });
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; reset: number; limit: number } {
  startCleanup();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or window expired
  if (entry === undefined || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      remaining: config.max - 1,
      reset: resetTime,
      limit: config.max,
    };
  }

  // Within window, check count
  if (entry.count >= config.max) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
      limit: config.max,
    };
  }

  // Increment count
  entry.count += 1;
  return {
    success: true,
    remaining: config.max - entry.count,
    reset: entry.resetTime,
    limit: config.max,
  };
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(info: {
  limit: number;
  remaining: number;
  reset: number;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(info.limit),
    'X-RateLimit-Remaining': String(info.remaining),
    'X-RateLimit-Reset': String(info.reset),
  };
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 *
 * @example
 * ```ts
 * // app/api/example/route.ts
 * import { withRateLimit } from '@/lib/rate-limit';
 *
 * export const GET = withRateLimit(
 *   async (request) => {
 *     return Response.json({ message: 'Hello' });
 *   },
 *   { windowMs: 60 * 1000, max: 10 }
 * );
 * ```
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig
) {
  return async (request: Request): Promise<Response> => {
    // Get identifier from IP or forwarded header
    const forwardedFor = request.headers.get('x-forwarded-for');
    const identifier = forwardedFor?.split(',')[0]?.trim() ?? 'unknown';

    const rateLimit = checkRateLimit(identifier, config);
    const headers = rateLimitHeaders(rateLimit);

    if (!rateLimit.success) {
      return new Response(
        JSON.stringify({ error: 'Too Many Requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(
              Math.ceil((rateLimit.reset - Date.now()) / 1000)
            ),
            ...headers,
          },
        }
      );
    }

    // Call the actual handler and add rate limit headers
    const response = await handler(request);

    // Clone response to add headers
    const newHeaders = new Headers(response.headers);
    Object.entries(headers).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

// Preset configurations
export const RATE_LIMITS = {
  /** Standard API: 100 requests per minute */
  standard: { windowMs: 60 * 1000, max: 100 },
  /** Strict API: 10 requests per minute */
  strict: { windowMs: 60 * 1000, max: 10 },
  /** Auth endpoints: 5 requests per minute */
  auth: { windowMs: 60 * 1000, max: 5 },
  /** Public endpoints: 30 requests per minute */
  public: { windowMs: 60 * 1000, max: 30 },
} as const;
