/**
 * Notes API Route
 *
 * Example API route demonstrating the template patterns:
 * - Zod validation via middleware
 * - Authentication via middleware
 * - Rate limiting
 * - Soft deletes
 * - Proper error handling
 *
 * @example GET /api/internal/notes - List all notes
 * @example POST /api/internal/notes - Create a new note
 */

import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api';
import { createNoteSchema } from '@/lib/validations';
import { prisma, notDeleted } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { RATE_LIMITS } from '@/lib/rate-limit';

/**
 * GET /api/internal/notes
 * List all notes for the authenticated user
 */
export const GET = createHandler({
  auth: true,
  rateLimit: RATE_LIMITS.standard,
  handler: async (request, { user }) => {
    const notes = await prisma.note.findMany({
      where: {
        userId: user!.id,
        ...notDeleted,
      },
      orderBy: [
        { pinned: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        content: true,
        color: true,
        pinned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('Notes', `Fetched ${notes.length} notes`, {
      userId: user!.id,
    });

    return NextResponse.json(notes);
  },
});

/**
 * POST /api/internal/notes
 * Create a new note
 */
export const POST = createHandler({
  schema: createNoteSchema,
  auth: true,
  rateLimit: RATE_LIMITS.standard,
  handler: async (request, { body, user }) => {
    const note = await prisma.note.create({
      data: {
        title: body.title,
        content: body.content,
        color: body.color,
        pinned: body.pinned ?? false,
        userId: user!.id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        color: true,
        pinned: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('Notes', 'Created note', {
      noteId: note.id,
      userId: user!.id,
    });

    return NextResponse.json(note, { status: 201 });
  },
});
