/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for API requests and forms.
 * Import and use these throughout the application.
 *
 * @example
 * ```ts
 * import { userSchema, createUserSchema } from '@/lib/validations';
 *
 * // API route
 * const result = createUserSchema.safeParse(body);
 *
 * // Form
 * const form = useForm({ resolver: zodResolver(createUserSchema) });
 * ```
 */

export * from './common';
export * from './user';
export * from './note';
