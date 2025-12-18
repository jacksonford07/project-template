import { NextRequest } from 'next/server';

import { auth } from './auth';
import { env, isDevelopment } from './env';

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
  if (env.ADMIN_MODE === true) {
    return true;
  }

  // Method 2: Secret header
  if (env.ADMIN_SECRET && req?.headers.get('x-admin-secret') === env.ADMIN_SECRET) {
    return true;
  }

  // Method 3: IP allowlist
  const allowedIPs = env.ADMIN_IPS ?? [];
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
  if (isDevelopment) {
    return true;
  }

  return false;
}

/**
 * Get a valid access token for the user.
 *
 * ⚠️  MUST IMPLEMENT FOR PRODUCTION
 *
 * This is a placeholder that returns a fake token. Before deploying to production,
 * implement actual token retrieval based on your auth provider:
 *
 * - OAuth providers: Retrieve and refresh OAuth tokens from the database
 * - JWT: Generate or validate JWT tokens
 * - Session-based: Return session ID or create API tokens
 *
 * @example
 * // For OAuth (e.g., Google, GitHub):
 * async function getValidToken(userId: string): Promise<string | null> {
 *   const account = await prisma.account.findFirst({
 *     where: { userId, provider: 'google' },
 *   });
 *   if (!account?.access_token) return null;
 *
 *   // Check if token is expired and refresh if needed
 *   if (account.expires_at && account.expires_at * 1000 < Date.now()) {
 *     const refreshed = await refreshOAuthToken(account.refresh_token);
 *     return refreshed.access_token;
 *   }
 *   return account.access_token;
 * }
 */
async function getValidToken(userId: string): Promise<string | null> {
  // ⚠️ PLACEHOLDER - Replace with actual implementation before production
  return `token-${userId}`;
}
