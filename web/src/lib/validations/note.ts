/**
 * Note Validation Schemas
 *
 * Example schemas for the Notes feature.
 */

import { z } from 'zod';
import { idSchema, paginationSchema, sortSchema, searchSchema } from './common';

// ============================================
// Enums
// ============================================

export const noteColorSchema = z.enum([
  'yellow',
  'blue',
  'green',
  'pink',
  'purple',
]);

export type NoteColor = z.infer<typeof noteColorSchema>;

// ============================================
// Base Note Schema
// ============================================

export const noteSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  content: z.string().max(10000).nullable(),
  color: noteColorSchema.nullable(),
  pinned: z.boolean(),
  userId: idSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Note = z.infer<typeof noteSchema>;

// ============================================
// Create Note
// ============================================

export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .max(10000, 'Content must be less than 10,000 characters')
    .optional(),
  color: noteColorSchema.optional(),
  pinned: z.boolean().optional().default(false),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

// ============================================
// Update Note
// ============================================

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(10000).nullable().optional(),
  color: noteColorSchema.nullable().optional(),
  pinned: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// ============================================
// Query Parameters
// ============================================

export const listNotesQuerySchema = paginationSchema
  .merge(sortSchema)
  .merge(searchSchema)
  .extend({
    color: noteColorSchema.optional(),
    pinned: z.coerce.boolean().optional(),
  });

export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;

// ============================================
// Route Parameters
// ============================================

export const noteIdParamSchema = z.object({
  id: idSchema,
});

export type NoteIdParam = z.infer<typeof noteIdParamSchema>;
