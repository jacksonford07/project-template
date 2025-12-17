/**
 * API Module
 *
 * Exports all API-related utilities.
 */

// Client
export { api, ApiError, notesApi } from './client';
export type { ApiClientConfig, RequestOptions, ApiResponse } from './client';

// Middleware
export {
  withValidation,
  withQueryValidation,
  withAuth,
  withOptionalAuth,
  withRateLimiting,
  withErrorHandling,
  createHandler,
} from './middleware';
export type { AuthenticatedUser, RequestContext } from './middleware';
