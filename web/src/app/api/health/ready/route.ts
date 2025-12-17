/**
 * Readiness Check Endpoint
 *
 * GET /api/health/ready
 *
 * Returns whether the application is ready to receive traffic.
 * Use this for Kubernetes readiness probes or deployment verification.
 *
 * Difference from /api/health:
 * - /health: Is the app running? (liveness)
 * - /health/ready: Is the app ready for traffic? (readiness)
 *
 * Response:
 * - 200: Application is ready
 * - 503: Application is not ready
 */

import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ReadinessStatus {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    migrations: boolean;
  };
}

export async function GET(): Promise<NextResponse<ReadinessStatus>> {
  const timestamp = new Date().toISOString();

  // Check all dependencies
  const [databaseReady] = await Promise.all([
    checkDatabaseHealth(),
    // Add more checks as needed:
    // checkCacheConnection(),
    // checkExternalApiConnection(),
  ]);

  // For migrations, we assume if DB is connected, migrations are applied
  // In production, you might want to verify specific migration status
  const migrationsApplied = databaseReady;

  const allReady = databaseReady && migrationsApplied;

  const status: ReadinessStatus = {
    ready: allReady,
    timestamp,
    checks: {
      database: databaseReady,
      migrations: migrationsApplied,
    },
  };

  return NextResponse.json(status, {
    status: allReady ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
