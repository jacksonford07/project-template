/**
 * Notes API Tests
 *
 * Example tests for the Notes API demonstrating:
 * - Mocking authentication
 * - Mocking Prisma
 * - Testing different HTTP methods
 * - Testing validation
 * - Testing error cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, createPostRequest, resetFactories } from '../fixtures/factories';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    note: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  withRateLimit: (handler: Function) => handler,
  RATE_LIMITS: {
    standard: { windowMs: 60000, max: 100 },
  },
}));

// Import after mocks
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/internal/notes/route';

describe('Notes API', () => {
  const mockUser = createUser({ id: 'user_123' });

  beforeEach(() => {
    vi.clearAllMocks();
    resetFactories();
  });

  describe('GET /api/internal/notes', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await GET(new Request('http://localhost/api/internal/notes'));

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns user notes when authenticated', async () => {
      const mockNotes = [
        {
          id: 'note_1',
          title: 'Test Note',
          content: 'Content',
          color: 'yellow',
          pinned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(auth).mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      vi.mocked(prisma.note.findMany).mockResolvedValue(mockNotes as any);

      const response = await GET(new Request('http://localhost/api/internal/notes'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Test Note');

      // Verify soft delete filter was applied
      expect(prisma.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            deletedAt: null,
          }),
        })
      );
    });
  });

  describe('POST /api/internal/notes', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: mockUser.id, email: mockUser.email },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });
    });

    it('creates a note with valid data', async () => {
      const noteData = {
        title: 'New Note',
        content: 'Some content',
        color: 'blue',
      };

      const createdNote = {
        id: 'note_new',
        ...noteData,
        pinned: false,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.note.create).mockResolvedValue(createdNote as any);

      const request = createPostRequest('/api/internal/notes', noteData);
      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.title).toBe('New Note');
      expect(data.color).toBe('blue');
    });

    it('returns 400 for invalid data', async () => {
      const request = createPostRequest('/api/internal/notes', {
        title: '', // Empty title should fail validation
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid input');
    });

    it('returns 400 for invalid color', async () => {
      const request = createPostRequest('/api/internal/notes', {
        title: 'Test Note',
        color: 'invalid-color',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = createPostRequest('/api/internal/notes', {
        title: 'Test',
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});

/**
 * Testing Tips:
 *
 * 1. Always mock external dependencies (auth, database, APIs)
 * 2. Test both success and error paths
 * 3. Test validation edge cases
 * 4. Verify correct data is passed to dependencies
 * 5. Use factories for consistent test data
 */
