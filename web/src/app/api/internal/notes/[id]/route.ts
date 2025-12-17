/**
 * Single Note API Route
 *
 * @example GET /api/internal/notes/:id - Get a single note
 * @example PATCH /api/internal/notes/:id - Update a note
 * @example DELETE /api/internal/notes/:id - Soft delete a note
 */

import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api';
import { updateNoteSchema } from '@/lib/validations';
import { prisma, notDeleted, softDelete } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { RATE_LIMITS } from '@/lib/rate-limit';

/**
 * GET /api/internal/notes/:id
 * Get a single note by ID
 */
export const GET = createHandler({
  auth: true,
  rateLimit: RATE_LIMITS.standard,
  handler: async (request, { params, user }) => {
    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
        ...notDeleted,
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

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  },
});

/**
 * PATCH /api/internal/notes/:id
 * Update a note
 */
export const PATCH = createHandler({
  schema: updateNoteSchema,
  auth: true,
  rateLimit: RATE_LIMITS.standard,
  handler: async (request, { body, params, user }) => {
    // Verify ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
        ...notDeleted,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const note = await prisma.note.update({
      where: { id: params.id },
      data: body,
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

    logger.info('Notes', 'Updated note', {
      noteId: note.id,
      userId: user!.id,
    });

    return NextResponse.json(note);
  },
});

/**
 * DELETE /api/internal/notes/:id
 * Soft delete a note
 */
export const DELETE = createHandler({
  auth: true,
  rateLimit: RATE_LIMITS.standard,
  handler: async (request, { params, user }) => {
    // Verify ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: user!.id,
        ...notDeleted,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Soft delete
    await prisma.note.update({
      where: { id: params.id },
      data: softDelete,
    });

    logger.info('Notes', 'Deleted note (soft)', {
      noteId: params.id,
      userId: user!.id,
    });

    return NextResponse.json({ success: true });
  },
});
