/**
 * Common Test Mocks
 *
 * Reusable mock implementations for external dependencies.
 * Import and use in your test files with vi.mock().
 */

import { vi } from 'vitest';

// ============================================
// Prisma Mock
// ============================================

/**
 * Creates a mock Prisma client.
 *
 * @example
 * ```ts
 * vi.mock('@/lib/prisma', () => ({
 *   prisma: createMockPrisma(),
 * }));
 * ```
 */
export function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    post: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(createMockPrisma())),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };
}

// ============================================
// NextAuth Mock
// ============================================

/**
 * Creates mock auth helpers.
 *
 * @example
 * ```ts
 * vi.mock('@/lib/auth', () => createMockAuth());
 *
 * // In test
 * vi.mocked(auth).mockResolvedValue(mockSession);
 * ```
 */
export function createMockAuth() {
  return {
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: {
      GET: vi.fn(),
      POST: vi.fn(),
    },
  };
}

/**
 * Creates a mock session object.
 */
export function createMockSession(overrides = {}) {
  return {
    user: {
      id: 'user_1',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

// ============================================
// Logger Mock
// ============================================

/**
 * Creates a mock logger.
 *
 * @example
 * ```ts
 * vi.mock('@/lib/logger', () => ({
 *   logger: createMockLogger(),
 * }));
 * ```
 */
export function createMockLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    success: vi.fn(),
  };
}

// ============================================
// Fetch Mock
// ============================================

/**
 * Creates a mock fetch function.
 *
 * @example
 * ```ts
 * const mockFetch = createMockFetch({ data: 'test' });
 * global.fetch = mockFetch;
 * ```
 */
export function createMockFetch(responseData: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(responseData),
    text: vi.fn().mockResolvedValue(JSON.stringify(responseData)),
    headers: new Headers(),
  });
}

/**
 * Creates a mock fetch that rejects.
 */
export function createMockFetchError(error: Error) {
  return vi.fn().mockRejectedValue(error);
}

// ============================================
// Next.js Navigation Mock
// ============================================

/**
 * Creates mock Next.js navigation hooks.
 *
 * @example
 * ```ts
 * vi.mock('next/navigation', () => createMockNavigation());
 * ```
 */
export function createMockNavigation() {
  return {
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    useParams: vi.fn(() => ({})),
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
}

// ============================================
// Environment Mock
// ============================================

/**
 * Sets up mock environment variables.
 *
 * @example
 * ```ts
 * beforeEach(() => {
 *   setupMockEnv({
 *     DATABASE_URL: 'postgresql://test',
 *     NEXTAUTH_SECRET: 'test-secret',
 *   });
 * });
 * ```
 */
export function setupMockEnv(env: Record<string, string>) {
  const originalEnv = { ...process.env };

  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return () => {
    // Restore original env
    Object.keys(env).forEach((key) => {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    });
  };
}

// ============================================
// Storage Mock
// ============================================

/**
 * Creates a mock localStorage/sessionStorage.
 */
export function createMockStorage(): Storage {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
}
