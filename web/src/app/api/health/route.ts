/**
 * Health Check Endpoint
 *
 * GET /api/health
 *
 * Returns basic application health status.
 * Use this for load balancer health checks and uptime monitoring.
 *
 * Response:
 * - 200: Application is healthy
 * - 503: Application is unhealthy
 */

import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: 'ok' | 'error';
  };
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version ?? '0.0.0';

  // Check database connectivity
  const databaseHealthy = await checkDatabaseHealth();

  const status: HealthStatus = {
    status: databaseHealthy ? 'healthy' : 'unhealthy',
    timestamp,
    version,
    checks: {
      database: databaseHealthy ? 'ok' : 'error',
    },
  };

  return NextResponse.json(status, {
    status: databaseHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
