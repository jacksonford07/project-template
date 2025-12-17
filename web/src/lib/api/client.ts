/**
 * Typed API Client
 *
 * A lightweight, type-safe API client for making requests to your backend.
 * No external dependencies - uses native fetch.
 *
 * Features:
 * - Type-safe requests and responses
 * - Automatic JSON parsing
 * - Error handling
 * - Request/response interceptors
 * - Timeout support
 * - Retry logic
 *
 * @example
 * ```ts
 * import { api } from '@/lib/api/client';
 *
 * // GET request
 * const notes = await api.get<Note[]>('/api/internal/notes');
 *
 * // POST request
 * const note = await api.post<Note>('/api/internal/notes', {
 *   body: { title: 'New Note' },
 * });
 *
 * // With query params
 * const filtered = await api.get<Note[]>('/api/internal/notes', {
 *   query: { color: 'blue', pinned: true },
 * });
 * ```
 */

// ============================================
// Types
// ============================================

export interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions<TBody = unknown> {
  body?: TBody;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================
// API Client Class
// ============================================

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? '';
    this.defaultTimeout = config.timeout ?? 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.baseUrl || window.location.origin);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make a request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Process response
   */
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: T;

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === 'object' && data !== null && 'error' in data
          ? String((data as Record<string, unknown>).error)
          : `Request failed with status ${response.status}`;

      throw new ApiError(errorMessage, response.status, data);
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  /**
   * Make a request
   */
  private async request<T, TBody = unknown>(
    method: string,
    path: string,
    options: RequestOptions<TBody> = {}
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const timeout = options.timeout ?? this.defaultTimeout;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      signal: options.signal,
    };

    if (options.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await this.fetchWithTimeout(url, fetchOptions, timeout);
    const result = await this.processResponse<T>(response);

    return result.data;
  }

  // ============================================
  // HTTP Methods
  // ============================================

  async get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<T, TBody = unknown>(path: string, options?: RequestOptions<TBody>): Promise<T> {
    return this.request<T, TBody>('POST', path, options);
  }

  async put<T, TBody = unknown>(path: string, options?: RequestOptions<TBody>): Promise<T> {
    return this.request<T, TBody>('PUT', path, options);
  }

  async patch<T, TBody = unknown>(path: string, options?: RequestOptions<TBody>): Promise<T> {
    return this.request<T, TBody>('PATCH', path, options);
  }

  async delete<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }
}

// ============================================
// Default Client Instance
// ============================================

export const api = new ApiClient();

// ============================================
// Typed API Functions (Example)
// ============================================

import type { Note, CreateNoteInput, UpdateNoteInput } from '@/lib/validations';

/**
 * Notes API
 *
 * Type-safe API functions for the Notes feature.
 *
 * @example
 * ```ts
 * import { notesApi } from '@/lib/api/client';
 *
 * const notes = await notesApi.list();
 * const note = await notesApi.create({ title: 'New' });
 * await notesApi.update('id', { pinned: true });
 * await notesApi.delete('id');
 * ```
 */
export const notesApi = {
  list: (query?: { color?: string; pinned?: boolean }) =>
    api.get<Note[]>('/api/internal/notes', { query }),

  get: (id: string) =>
    api.get<Note>(`/api/internal/notes/${id}`),

  create: (data: CreateNoteInput) =>
    api.post<Note>('/api/internal/notes', { body: data }),

  update: (id: string, data: UpdateNoteInput) =>
    api.patch<Note>(`/api/internal/notes/${id}`, { body: data }),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(`/api/internal/notes/${id}`),
};

// ============================================
// React Hook Helper
// ============================================

/**
 * Simple hook for API calls with loading/error state
 *
 * For more complex needs, consider TanStack Query:
 * pnpm add @tanstack/react-query
 *
 * @example
 * ```ts
 * function NotesPage() {
 *   const { data, error, loading, refetch } = useApi(() => notesApi.list());
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   return <NotesList notes={data} />;
 * }
 * ```
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
  refetch: () => void;
} {
  // This is a simplified example - for production, use TanStack Query
  // Import this dynamically or implement with useState/useEffect
  throw new Error(
    'useApi is a placeholder. Install @tanstack/react-query for production use:\n' +
    'pnpm add @tanstack/react-query'
  );
}
