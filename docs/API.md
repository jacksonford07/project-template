# API Documentation

This document describes the API architecture, conventions, and available endpoints.

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication](#authentication)
3. [Request/Response Format](#requestresponse-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Versioning](#versioning)
7. [Endpoints](#endpoints)

---

## Architecture

### Route Structure

```
/api/
├── auth/           # NextAuth endpoints (managed)
├── health/         # Health checks
│   ├── route.ts    # GET /api/health
│   └── ready/      # GET /api/health/ready
└── internal/       # Application API
    └── notes/      # Notes CRUD
        ├── route.ts      # GET, POST /api/internal/notes
        └── [id]/route.ts # GET, PATCH, DELETE /api/internal/notes/:id
```

### Route Categories

| Category | Path | Purpose |
|----------|------|---------|
| `auth` | `/api/auth/*` | Authentication (NextAuth) |
| `health` | `/api/health/*` | Health checks |
| `internal` | `/api/internal/*` | Application API |

### Creating New Endpoints

```typescript
// src/app/api/internal/[resource]/route.ts
import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api';
import { createResourceSchema } from '@/lib/validations';
import { prisma, notDeleted } from '@/lib/prisma';
import { RATE_LIMITS } from '@/lib/rate-limit';

// GET /api/internal/[resource]
export const GET = createHandler({
  auth: true,
  rateLimit: RATE_LIMITS.standard,
  handler: async (request, { user }) => {
    const items = await prisma.resource.findMany({
      where: { userId: user!.id, ...notDeleted },
    });
    return NextResponse.json(items);
  },
});

// POST /api/internal/[resource]
export const POST = createHandler({
  schema: createResourceSchema,
  auth: true,
  rateLimit: RATE_LIMITS.standard,
  handler: async (request, { body, user }) => {
    const item = await prisma.resource.create({
      data: { ...body, userId: user!.id },
    });
    return NextResponse.json(item, { status: 201 });
  },
});
```

---

## Authentication

### Session-Based (NextAuth)

All `/api/internal/*` routes require authentication via NextAuth session cookies.

```typescript
// Automatic via middleware
export const GET = createHandler({
  auth: true,  // Requires authentication
  handler: async (request, { user }) => {
    // user.id, user.email available
  },
});
```

### Checking Authentication Status

```bash
# Get current session
GET /api/auth/session
```

Response (authenticated):
```json
{
  "user": {
    "id": "cuid...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "expires": "2024-02-15T10:30:00.000Z"
}
```

Response (not authenticated):
```json
{}
```

---

## Request/Response Format

### Request Headers

```
Content-Type: application/json
Cookie: next-auth.session-token=...
```

### Response Format

**Success:**
```json
{
  "id": "cuid...",
  "title": "Example",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**List Response:**
```json
[
  { "id": "1", "title": "Item 1" },
  { "id": "2", "title": "Item 2" }
]
```

**Paginated Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5,
  "hasMore": true
}
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `sortBy` | string | Field to sort by |
| `sortOrder` | string | `asc` or `desc` |
| `q` | string | Search query |

Example:
```
GET /api/internal/notes?page=2&limit=10&sortBy=createdAt&sortOrder=desc&q=hello
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "details": {
    "field": ["Validation message"]
  }
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

### Validation Errors

```json
{
  "error": "Validation failed",
  "details": {
    "title": ["Title is required"],
    "email": ["Invalid email address"]
  }
}
```

### Handling Errors (Client)

```typescript
import { api, ApiError } from '@/lib/api';

try {
  const note = await api.post('/api/internal/notes', {
    body: { title: '' },
  });
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      // Validation error
      console.log(error.data); // { details: { title: [...] } }
    } else if (error.status === 401) {
      // Redirect to login
    }
  }
}
```

---

## Rate Limiting

### Limits

| Tier | Requests | Window | Use Case |
|------|----------|--------|----------|
| Standard | 100 | 1 minute | General API |
| Strict | 10 | 1 minute | Sensitive operations |
| Auth | 5 | 1 minute | Login/register |
| Public | 30 | 1 minute | Unauthenticated |

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312200000
```

### Rate Limit Response

```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
```

```json
{
  "error": "Too many requests"
}
```

---

## Versioning

### Strategy: URL Path Versioning

When breaking changes are needed:

```
/api/v1/internal/notes  # Original
/api/v2/internal/notes  # New version
```

### When to Version

**Version bump required:**
- Removing fields from responses
- Changing field types
- Removing endpoints
- Changing authentication

**No version bump needed:**
- Adding new fields to responses
- Adding new endpoints
- Adding optional request parameters
- Bug fixes

### Implementation

```typescript
// src/app/api/v2/internal/notes/route.ts
export async function GET() {
  // New implementation
}

// Keep v1 working
// src/app/api/v1/internal/notes/route.ts
export async function GET() {
  // Original implementation
}
```

### Deprecation Process

1. Add `Deprecation` header to old version
2. Document migration path
3. Set sunset date (minimum 6 months)
4. Remove after sunset

```typescript
return NextResponse.json(data, {
  headers: {
    'Deprecation': 'true',
    'Sunset': 'Sat, 15 Jun 2025 00:00:00 GMT',
    'Link': '</api/v2/notes>; rel="successor-version"',
  },
});
```

---

## Endpoints

### Health

#### `GET /api/health`

Check application health.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": "ok"
  }
}
```

#### `GET /api/health/ready`

Check if application is ready for traffic.

**Response:**
```json
{
  "ready": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "database": true,
    "migrations": true
  }
}
```

---

### Notes (Example)

#### `GET /api/internal/notes`

List all notes for authenticated user.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `color` | string | Filter by color |
| `pinned` | boolean | Filter by pinned status |
| `q` | string | Search in title/content |

**Response:**
```json
[
  {
    "id": "cuid...",
    "title": "My Note",
    "content": "Content here",
    "color": "yellow",
    "pinned": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### `POST /api/internal/notes`

Create a new note.

**Request Body:**
```json
{
  "title": "My Note",
  "content": "Optional content",
  "color": "yellow",
  "pinned": false
}
```

**Response:** `201 Created`
```json
{
  "id": "cuid...",
  "title": "My Note",
  ...
}
```

#### `GET /api/internal/notes/:id`

Get a single note.

**Response:**
```json
{
  "id": "cuid...",
  "title": "My Note",
  ...
}
```

#### `PATCH /api/internal/notes/:id`

Update a note.

**Request Body:**
```json
{
  "title": "Updated Title",
  "pinned": true
}
```

**Response:**
```json
{
  "id": "cuid...",
  "title": "Updated Title",
  "pinned": true,
  ...
}
```

#### `DELETE /api/internal/notes/:id`

Soft delete a note.

**Response:**
```json
{
  "success": true
}
```

---

## Client Usage

### Using the API Client

```typescript
import { api, notesApi } from '@/lib/api';

// Generic client
const notes = await api.get<Note[]>('/api/internal/notes');

// Typed API
const notes = await notesApi.list();
const note = await notesApi.create({ title: 'New Note' });
await notesApi.update('id', { pinned: true });
await notesApi.delete('id');
```

### With Query Parameters

```typescript
const filtered = await api.get<Note[]>('/api/internal/notes', {
  query: {
    color: 'blue',
    pinned: true,
    q: 'search term',
  },
});
```

### Error Handling

```typescript
import { ApiError } from '@/lib/api';

try {
  await notesApi.create({ title: '' });
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        // Show validation errors
        break;
      case 401:
        // Redirect to login
        break;
      case 429:
        // Show rate limit message
        break;
    }
  }
}
```

---

## Adding TanStack Query (Recommended)

For production apps with complex data requirements:

```bash
pnpm add @tanstack/react-query
```

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// src/hooks/use-notes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/lib/api';

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: () => notesApi.list(),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
```
