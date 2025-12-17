/**
 * API Middleware
 *
 * Reusable middleware for API routes including validation,
 * authentication, rate limiting, and error handling.
 *
 * @example
 * ```ts
 * // In API route
 * import { withValidation, withAuth } from '@/lib/api/middleware';
 * import { createNoteSchema } from '@/lib/validations';
 *
 * export const POST = withAuth(
 *   withValidation(createNoteSchema, async (request, { body, user }) => {
 *     const note = await prisma.note.create({ data: { ...body, userId: user.id } });
 *     return Response.json(note, { status: 201 });
 *   })
 * );
 * ```
 */

import { NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';
import { auth } from '@/lib/auth';
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface RequestContext<TBody = unknown, TQuery = unknown> {
  body: TBody;
  query: TQuery;
  params: Record<string, string>;
  user?: AuthenticatedUser;
}

type RouteHandler<TBody = unknown, TQuery = unknown> = (
  request: Request,
  context: RequestContext<TBody, TQuery>
) => Promise<Response>;

// ============================================
// Error Formatting
// ============================================

function formatZodError(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

// ============================================
// Validation Middleware
// ============================================

/**
 * Validate request body against a Zod schema
 */
export function withValidation<TBody>(
  schema: ZodSchema<TBody>,
  handler: RouteHandler<TBody>
): (request: Request, routeContext?: { params: Promise<Record<string, string>> }) => Promise<Response> {
  return async (request, routeContext) => {
    try {
      // Parse body
      let rawBody: unknown = {};
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          rawBody = await request.json();
        }
      }

      // Validate
      const result = schema.safeParse(rawBody);

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: formatZodError(result.error),
          },
          { status: 400 }
        );
      }

      // Parse query params
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams);

      // Get route params
      const params = routeContext?.params ? await routeContext.params : {};

      return handler(request, {
        body: result.data,
        query,
        params,
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON body' },
          { status: 400 }
        );
      }
      throw error;
    }
  };
}

/**
 * Validate query parameters against a Zod schema
 */
export function withQueryValidation<TQuery>(
  schema: ZodSchema<TQuery>,
  handler: RouteHandler<unknown, TQuery>
): (request: Request, routeContext?: { params: Promise<Record<string, string>> }) => Promise<Response> {
  return async (request, routeContext) => {
    const url = new URL(request.url);
    const rawQuery = Object.fromEntries(url.searchParams);

    const result = schema.safeParse(rawQuery);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: formatZodError(result.error),
        },
        { status: 400 }
      );
    }

    const params = routeContext?.params ? await routeContext.params : {};

    return handler(request, {
      body: undefined,
      query: result.data,
      params,
    });
  };
}

// ============================================
// Authentication Middleware
// ============================================

/**
 * Require authentication for a route
 */
export function withAuth<TBody = unknown, TQuery = unknown>(
  handler: RouteHandler<TBody, TQuery>
): (request: Request, routeContext?: { params: Promise<Record<string, string>> }) => Promise<Response> {
  return async (request, routeContext) => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user: AuthenticatedUser = {
      id: session.user.id,
      email: session.user.email ?? '',
      name: session.user.name,
    };

    // Parse body if present
    let body: TBody = undefined as TBody;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.clone().json();
      } catch {
        // No body or not JSON
      }
    }

    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams) as TQuery;
    const params = routeContext?.params ? await routeContext.params : {};

    return handler(request, { body, query, params, user });
  };
}

/**
 * Optional authentication - adds user to context if authenticated
 */
export function withOptionalAuth<TBody = unknown, TQuery = unknown>(
  handler: RouteHandler<TBody, TQuery>
): (request: Request, routeContext?: { params: Promise<Record<string, string>> }) => Promise<Response> {
  return async (request, routeContext) => {
    const session = await auth();

    const user: AuthenticatedUser | undefined = session?.user?.id
      ? {
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.name,
        }
      : undefined;

    let body: TBody = undefined as TBody;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.clone().json();
      } catch {
        // No body
      }
    }

    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams) as TQuery;
    const params = routeContext?.params ? await routeContext.params : {};

    return handler(request, { body, query, params, user });
  };
}

// ============================================
// Rate Limiting Middleware
// ============================================

/**
 * Apply rate limiting to a route
 */
export function withRateLimiting(
  config: { windowMs: number; max: number } = RATE_LIMITS.standard
) {
  return <TBody = unknown, TQuery = unknown>(
    handler: RouteHandler<TBody, TQuery>
  ): ((request: Request, routeContext?: { params: Promise<Record<string, string>> }) => Promise<Response>) => {
    return async (request, routeContext) => {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        'unknown';

      const rateLimit = checkRateLimit(ip, config);
      const headers = rateLimitHeaders(rateLimit);

      if (!rateLimit.success) {
        return NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: {
              'Retry-After': String(
                Math.ceil((rateLimit.reset - Date.now()) / 1000)
              ),
              ...headers,
            },
          }
        );
      }

      const response = await handler(request, {
        body: undefined as TBody,
        query: undefined as TQuery,
        params: routeContext?.params ? await routeContext.params : {},
      });

      // Add rate limit headers to response
      const newHeaders = new Headers(response.headers);
      Object.entries(headers).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    };
  };
}

// ============================================
// Error Handling Middleware
// ============================================

/**
 * Wrap handler with error handling
 */
export function withErrorHandling<TBody = unknown, TQuery = unknown>(
  handler: RouteHandler<TBody, TQuery>
): RouteHandler<TBody, TQuery> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      logger.error('API', 'Unhandled error', error, {
        url: request.url,
        method: request.method,
      });

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// ============================================
// Composed Middleware
// ============================================

/**
 * Create a validated, authenticated, rate-limited handler
 *
 * @example
 * ```ts
 * export const POST = createHandler({
 *   schema: createNoteSchema,
 *   auth: true,
 *   rateLimit: RATE_LIMITS.standard,
 *   handler: async (request, { body, user }) => {
 *     // body is typed, user is guaranteed
 *   },
 * });
 * ```
 */
export function createHandler<TBody, TQuery = unknown>(options: {
  schema?: ZodSchema<TBody>;
  querySchema?: ZodSchema<TQuery>;
  auth?: boolean;
  rateLimit?: { windowMs: number; max: number };
  handler: RouteHandler<TBody, TQuery>;
}): (request: Request, routeContext?: { params: Promise<Record<string, string>> }) => Promise<Response> {
  let wrapped = options.handler as RouteHandler<TBody, TQuery>;

  // Apply in reverse order (innermost first)
  wrapped = withErrorHandling(wrapped);

  if (options.rateLimit) {
    const rateLimited = withRateLimiting(options.rateLimit)(wrapped);
    wrapped = rateLimited as RouteHandler<TBody, TQuery>;
  }

  if (options.auth) {
    const authed = withAuth(wrapped);
    wrapped = authed as RouteHandler<TBody, TQuery>;
  }

  if (options.schema) {
    const validated = withValidation(options.schema, wrapped as RouteHandler<TBody>);
    return validated;
  }

  if (options.querySchema) {
    return withQueryValidation(options.querySchema, wrapped as RouteHandler<unknown, TQuery>);
  }

  return wrapped as (request: Request, routeContext?: { params: Promise<Record<string, string>> }) => Promise<Response>;
}
