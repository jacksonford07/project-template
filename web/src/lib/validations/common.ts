/**
 * Common Validation Schemas
 *
 * Reusable validation primitives and patterns.
 */

import { z } from 'zod';

// ============================================
// Primitive Validators
// ============================================

/**
 * Valid CUID (Prisma default ID format)
 */
export const cuidSchema = z
  .string()
  .min(1)
  .regex(/^c[a-z0-9]{24}$/, 'Invalid ID format');

/**
 * Valid UUID
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Generic ID (accepts CUID or UUID)
 */
export const idSchema = z.string().min(1, 'ID is required');

/**
 * Email with proper validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * Password with strength requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

/**
 * Simple password (development/testing)
 */
export const simplePasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .or(z.literal(''));

/**
 * Optional URL
 */
export const optionalUrlSchema = urlSchema.optional().nullable();

/**
 * Phone number (basic)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

// ============================================
// Pagination
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;

// ============================================
// Sorting
// ============================================

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

export const sortSchema = z.object({
  sortBy: z.string().default('createdAt'),
  sortOrder: sortOrderSchema,
});

export type SortInput = z.infer<typeof sortSchema>;

// ============================================
// Search & Filters
// ============================================

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
});

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.from && data.to) {
      return data.from <= data.to;
    }
    return true;
  },
  { message: 'From date must be before to date' }
);

// ============================================
// API Response Schemas
// ============================================

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  });

// ============================================
// Utility Functions
// ============================================

/**
 * Create a schema that accepts string IDs from URL params
 */
export const idParamSchema = z.object({
  id: idSchema,
});

/**
 * Create optional fields from a schema
 */
export function makeOptional<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial();
}

/**
 * Create a schema for PATCH requests (all fields optional)
 */
export function makePatchSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' }
  );
}
