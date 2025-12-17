/**
 * Test Factories
 *
 * Factory functions for creating test data with sensible defaults.
 * Override specific fields as needed in individual tests.
 *
 * @example
 * ```ts
 * // Create a user with defaults
 * const user = createUser();
 *
 * // Override specific fields
 * const admin = createUser({ role: 'admin', email: 'admin@test.com' });
 *
 * // Create multiple users
 * const users = createUsers(5);
 * ```
 */

// ============================================
// Types (mirror your Prisma schema)
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

// ============================================
// ID Generator
// ============================================

let idCounter = 0;

export function generateId(prefix = 'test'): string {
  idCounter += 1;
  return `${prefix}_${idCounter}_${Date.now()}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// ============================================
// User Factory
// ============================================

export function createUser(overrides: Partial<User> = {}): User {
  const id = overrides.id ?? generateId('user');
  const now = new Date();

  return {
    id,
    email: `${id}@test.com`,
    name: 'Test User',
    image: null,
    role: 'user',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}

export function createAdmin(overrides: Partial<User> = {}): User {
  return createUser({ role: 'admin', ...overrides });
}

// ============================================
// Post Factory
// ============================================

export function createPost(overrides: Partial<Post> = {}): Post {
  const id = overrides.id ?? generateId('post');
  const now = new Date();

  return {
    id,
    title: 'Test Post Title',
    content: 'This is test content for the post.',
    published: false,
    authorId: overrides.authorId ?? generateId('user'),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

export function createPosts(count: number, overrides: Partial<Post> = {}): Post[] {
  return Array.from({ length: count }, () => createPost(overrides));
}

export function createPublishedPost(overrides: Partial<Post> = {}): Post {
  return createPost({ published: true, ...overrides });
}

// ============================================
// Session Factory
// ============================================

export function createSession(overrides: Partial<Session> = {}): Session {
  const id = overrides.id ?? generateId('session');

  return {
    id,
    sessionToken: `token_${id}_${Math.random().toString(36).slice(2)}`,
    userId: overrides.userId ?? generateId('user'),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    ...overrides,
  };
}

// ============================================
// Request Factories
// ============================================

export function createRequest(
  url: string,
  options: RequestInit = {}
): Request {
  return new Request(`http://localhost${url}`, options);
}

export function createGetRequest(url: string, headers?: HeadersInit): Request {
  return createRequest(url, { method: 'GET', headers });
}

export function createPostRequest(
  url: string,
  body: Record<string, unknown>,
  headers?: HeadersInit
): Request {
  return createRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

export function createAuthenticatedRequest(
  url: string,
  token: string,
  options: RequestInit = {}
): Request {
  return createRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================
// Response Helpers
// ============================================

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export function expectStatus(response: Response, status: number): void {
  if (response.status !== status) {
    throw new Error(
      `Expected status ${status}, got ${response.status}`
    );
  }
}

// ============================================
// Date Helpers
// ============================================

export function createPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

export function createFutureDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

// ============================================
// Cleanup
// ============================================

/**
 * Reset all factories to initial state.
 * Call in beforeEach to ensure test isolation.
 */
export function resetFactories(): void {
  resetIdCounter();
}
