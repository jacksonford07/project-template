/**
 * TanStack Query Setup
 *
 * This file provides the setup for TanStack Query (React Query).
 * It's optional - install when you need it:
 *
 *   pnpm add @tanstack/react-query
 *
 * Benefits:
 * - Automatic caching and refetching
 * - Loading and error states
 * - Optimistic updates
 * - Request deduplication
 * - Background data synchronization
 *
 * @example
 * ```tsx
 * // In your root layout
 * import { QueryProvider } from '@/lib/query';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>
 *           {children}
 *         </QueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

'use client';

// ============================================
// Uncomment below after: pnpm add @tanstack/react-query
// ============================================

/*
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

// Default options for all queries
const defaultOptions = {
  queries: {
    // Data is fresh for 1 minute
    staleTime: 60 * 1000,
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Retry failed requests once
    retry: 1,
    // Refetch on window focus in production
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
  },
  mutations: {
    // Retry mutations once
    retry: 1,
  },
};

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create client inside component to avoid sharing state between requests
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

// ============================================
// Query Key Factory
// ============================================

// Centralized query keys for consistency
export const queryKeys = {
  // Notes
  notes: {
    all: ['notes'] as const,
    lists: () => [...queryKeys.notes.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.notes.lists(), filters] as const,
    details: () => [...queryKeys.notes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.notes.details(), id] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? [...queryKeys.projects.all, 'list', filters] : [...queryKeys.projects.all, 'list'],
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
  },
};

// ============================================
// Example Hooks
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/lib/api';
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/lib/validations';

// List notes with automatic caching
export function useNotes(filters?: { color?: string; pinned?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notes.list(filters ?? {}),
    queryFn: () => notesApi.list(filters),
  });
}

// Get single note
export function useNote(id: string) {
  return useQuery({
    queryKey: queryKeys.notes.detail(id),
    queryFn: () => notesApi.get(id),
    enabled: !!id, // Don't fetch if no ID
  });
}

// Create note with optimistic update
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteInput) => notesApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch notes list
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.lists() });
    },
  });
}

// Update note with optimistic update
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteInput }) =>
      notesApi.update(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.detail(id) });

      // Snapshot previous value
      const previousNote = queryClient.getQueryData<Note>(
        queryKeys.notes.detail(id)
      );

      // Optimistically update
      if (previousNote) {
        queryClient.setQueryData(queryKeys.notes.detail(id), {
          ...previousNote,
          ...data,
        });
      }

      return { previousNote };
    },
    // Rollback on error
    onError: (err, { id }, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(queryKeys.notes.detail(id), context.previousNote);
      }
    },
    // Refetch after mutation
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.lists() });
    },
  });
}

// Delete note
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.lists() });
    },
  });
}
*/

// ============================================
// Placeholder export (until TanStack Query is installed)
// ============================================

export function QueryProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  // TanStack Query not installed - just pass through children
  // Install with: pnpm add @tanstack/react-query
  return <>{children}</>;
}

export const queryKeys = {
  notes: {
    all: ['notes'] as const,
    lists: () => ['notes', 'list'] as const,
    list: (filters: Record<string, unknown>) => ['notes', 'list', filters] as const,
    details: () => ['notes', 'detail'] as const,
    detail: (id: string) => ['notes', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    current: () => ['users', 'current'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (filters?: Record<string, unknown>) =>
      filters ? ['projects', 'list', filters] : ['projects', 'list'],
    detail: (id: string) => ['projects', 'detail', id] as const,
  },
};
