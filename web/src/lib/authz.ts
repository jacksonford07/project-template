import { NextRequest } from 'next/server';

import { auth } from './auth';

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  accessToken: string;
  isAdmin: boolean;
}

/**
 * Require authentication for API routes
 * Returns user context or throws
 */
export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id;
  const email = session.user.email ?? '';
  const role = session.user.role ?? 'viewer';
  const accessToken = await getValidToken(userId);
  const isAdmin = isAdminRequest(req);

  if (!accessToken) {
    throw new Error('Failed to get valid access token');
  }

  return {
    userId,
    email,
    role,
    accessToken,
    isAdmin,
  };
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(
  role: string,
  requiredRole: 'owner' | 'editor' | 'viewer'
): boolean {
  const hierarchy = { owner: 3, editor: 2, viewer: 1 };
  const userLevel = hierarchy[role as keyof typeof hierarchy] ?? 0;
  const requiredLevel = hierarchy[requiredRole];

  return userLevel >= requiredLevel;
}

/**
 * Check if request is from admin
 */
export function isAdminRequest(req?: NextRequest): boolean {
  // Method 1: Environment variable flag
  if (process.env['ADMIN_MODE'] === 'true') {
    return true;
  }

  // Method 2: Secret header
  const adminSecret = process.env['ADMIN_SECRET'];
  if (adminSecret && req?.headers.get('x-admin-secret') === adminSecret) {
    return true;
  }

  // Method 3: IP allowlist
  const allowedIPs = process.env['ADMIN_IPS']?.split(',') ?? [];
  if (allowedIPs.length > 0 && req) {
    const clientIP =
      req.headers.get('x-forwarded-for')?.split(',')[0] ??
      req.headers.get('x-real-ip') ??
      'unknown';
    if (allowedIPs.includes(clientIP)) {
      return true;
    }
  }

  // Method 4: Development mode
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}

async function getValidToken(userId: string): Promise<string | null> {
  // TODO: Implement token retrieval/refresh logic
  // This is a placeholder - implement based on your auth provider
  return `token-${userId}`;
}
