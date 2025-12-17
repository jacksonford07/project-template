/**
 * Prisma Client Singleton
 *
 * Properly configured for serverless environments (Vercel, AWS Lambda, etc.)
 * with connection pooling, error handling, and graceful shutdown.
 *
 * Features:
 * - Singleton pattern to prevent connection exhaustion
 * - Connection pooling via Prisma Accelerate or pgBouncer
 * - Graceful error handling with retries
 * - Proper cleanup on shutdown
 * - Development-friendly logging
 *
 * For serverless deployments, consider using:
 * - Prisma Accelerate: https://www.prisma.io/accelerate
 * - Neon with connection pooling: https://neon.tech
 * - Supabase with pgBouncer: https://supabase.com
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { isDevelopment, isProduction, isTest } from './env';

// Extend global type for singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client configuration optimized for serverless
 */
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: isDevelopment
    ? [
        { emit: 'stdout', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ]
    : [{ emit: 'stdout', level: 'error' }],

  // Transaction timeout (important for serverless)
  transactionOptions: {
    maxWait: 5000, // 5s max wait for transaction slot
    timeout: 10000, // 10s max transaction duration
  },
};

/**
 * Create Prisma client with error handling
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient(prismaClientOptions);

  // Log connection events in development
  if (isDevelopment) {
    client.$connect().then(() => {
      console.log('📦 Prisma connected to database');
    }).catch((error) => {
      console.error('❌ Prisma failed to connect:', error);
    });
  }

  return client;
}

/**
 * Prisma client singleton
 *
 * In development: Reuses client across hot reloads
 * In production: Creates fresh client per cold start
 * In test: Creates fresh client per test run
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Prevent multiple instances in development (hot reload)
if (!isProduction) {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown handler
 * Ensures connections are properly closed
 */
async function gracefulShutdown(): Promise<void> {
  console.log('🔌 Disconnecting Prisma client...');
  await prisma.$disconnect();
  console.log('✅ Prisma disconnected');
}

// Register shutdown handlers (Node.js only)
if (typeof process !== 'undefined' && !isTest) {
  process.on('beforeExit', gracefulShutdown);
  process.on('SIGINT', async () => {
    await gracefulShutdown();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await gracefulShutdown();
    process.exit(0);
  });
}

/**
 * Database health check
 *
 * Use this to verify database connectivity, e.g., in health check endpoints
 *
 * @example
 * ```ts
 * // In /api/health/route.ts
 * const isHealthy = await checkDatabaseHealth();
 * return Response.json({ database: isHealthy ? 'ok' : 'error' });
 * ```
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Execute with retry logic
 *
 * Useful for handling transient connection failures in serverless
 *
 * @example
 * ```ts
 * const users = await executeWithRetry(() =>
 *   prisma.user.findMany()
 * );
 * ```
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRetryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P1001', 'P1002', 'P1008', 'P1017'].includes(error.code);

      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }

      console.warn(
        `Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

/**
 * Soft delete helper
 *
 * Standard pattern for marking records as deleted without removing them
 */
export const softDelete = { deletedAt: new Date() };

/**
 * Filter for non-deleted records
 *
 * @example
 * ```ts
 * const users = await prisma.user.findMany({
 *   where: notDeleted,
 * });
 * ```
 */
export const notDeleted = { deletedAt: null };

/**
 * Common Prisma error codes
 *
 * P1001 - Can't reach database server
 * P1002 - Database server timed out
 * P1008 - Operations timed out
 * P1017 - Server closed connection
 * P2002 - Unique constraint failed
 * P2025 - Record not found
 */
export const PrismaErrorCodes = {
  CONNECTION_ERROR: 'P1001',
  TIMEOUT: 'P1002',
  OPERATION_TIMEOUT: 'P1008',
  CONNECTION_CLOSED: 'P1017',
  UNIQUE_CONSTRAINT: 'P2002',
  NOT_FOUND: 'P2025',
} as const;

/**
 * Check if error is a specific Prisma error
 */
export function isPrismaError(
  error: unknown,
  code: string
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}
