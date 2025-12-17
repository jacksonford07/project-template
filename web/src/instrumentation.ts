/**
 * Next.js Instrumentation
 *
 * This file runs once when the Next.js server starts.
 * We use it to validate environment variables early (fail-fast).
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server startup
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import env to trigger validation
    // This will throw if env vars are invalid in production
    const { env } = await import('@/lib/env');

    console.log(`
┌─────────────────────────────────────────┐
│  ✅ Environment validated successfully  │
│  Mode: ${env.NODE_ENV.padEnd(30)}  │
└─────────────────────────────────────────┘
    `);
  }
}
