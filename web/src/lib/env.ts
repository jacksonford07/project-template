/**
 * Environment Variable Validation
 *
 * This module validates all environment variables at startup using Zod.
 * If any required variable is missing or invalid, the app will fail fast
 * with a clear error message.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const dbUrl = env.DATABASE_URL; // Type-safe!
 *
 * Benefits:
 * - Type-safe access to env vars
 * - Fail-fast on misconfiguration
 * - Clear error messages
 * - Single source of truth for env schema
 */

import { z } from 'zod';

/**
 * Server-side environment variables schema
 * These are only available on the server
 */
const serverSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid URL')
    .refine(
      (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
      'DATABASE_URL must be a PostgreSQL connection string'
    ),
  DIRECT_URL: z
    .string()
    .url()
    .optional(),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(1, 'NEXTAUTH_SECRET is required')
    .refine(
      (secret) => secret !== 'GENERATE_A_SECURE_SECRET_HERE',
      'NEXTAUTH_SECRET must be changed from the default placeholder'
    ),
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL must be a valid URL')
    .optional(),

  // OAuth Providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),

  // Admin (optional)
  ADMIN_MODE: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional()
    .default('false'),
  ADMIN_SECRET: z.string().optional(),
  ADMIN_IPS: z
    .string()
    .transform((val) => val.split(',').map((ip) => ip.trim()))
    .optional(),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

/**
 * Client-side environment variables schema
 * These are exposed to the browser (NEXT_PUBLIC_ prefix)
 */
const clientSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url('NEXT_PUBLIC_BASE_URL must be a valid URL')
    .optional()
    .default('http://localhost:3000'),
});

/**
 * Combined schema for all environment variables
 */
const envSchema = serverSchema.merge(clientSchema);

/**
 * Type for the validated environment
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Formats Zod errors into readable messages
 */
function formatErrors(errors: z.ZodError): string {
  return errors.errors
    .map((err) => {
      const path = err.path.join('.');
      return `  - ${path}: ${err.message}`;
    })
    .join('\n');
}

/**
 * Validates environment variables and returns typed env object.
 * Throws on validation failure with helpful error messages.
 */
function validateEnv(): Env {
  // Skip validation during build if explicitly requested
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.warn('⚠️  Skipping environment validation (SKIP_ENV_VALIDATION=true)');
    return process.env as unknown as Env;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessage = formatErrors(result.error);

    console.error('\n❌ Invalid environment variables:\n');
    console.error(errorMessage);
    console.error('\n📋 Check your .env file against .env.example\n');

    // Fail fast in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed:\n${errorMessage}`);
    }

    // In development, warn but don't crash (allows partial setup)
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Continuing with invalid env in development mode...\n');
      return process.env as unknown as Env;
    }

    // In test mode, throw to catch issues early
    throw new Error(`Environment validation failed:\n${errorMessage}`);
  }

  return result.data;
}

/**
 * Validated environment variables
 *
 * Import this instead of using process.env directly:
 * ```ts
 * import { env } from '@/lib/env';
 * console.log(env.DATABASE_URL); // Type-safe!
 * ```
 */
export const env = validateEnv();

/**
 * Helper to check if we're in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Helper to check if we're in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Helper to check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Re-export for client components
 * Only includes NEXT_PUBLIC_ variables
 */
export const clientEnv = {
  NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL,
} as const;
