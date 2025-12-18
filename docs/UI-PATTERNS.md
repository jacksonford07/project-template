# UI Patterns & Components

This guide covers the UI infrastructure, component library, and patterns used in the template.

## Table of Contents

1. [Component Library](#component-library)
2. [Toast Notifications](#toast-notifications)
3. [Error Handling](#error-handling)
4. [Loading States](#loading-states)
5. [Form Management](#form-management)
6. [Data Fetching](#data-fetching)
7. [Progressive Enhancement](#progressive-enhancement)

---

## Component Library

### Built-in Components

The template includes basic UI components in `src/components/ui/`:

| Component | Description |
|-----------|-------------|
| `Button` | Primary button with variants |
| `Input` | Form input with error states |
| `Card` | Content container |
| `Modal` | Dialog overlay |
| `Badge` | Status indicator |
| `Spinner` | Loading indicator |
| `Toast` | Notification system |
| `Avatar` | User avatar |
| `Skeleton` | Loading placeholders |
| `ErrorBoundary` | Error catching |

### Adding shadcn/ui (Recommended)

For a more complete component library:

```bash
# Initialize shadcn/ui
pnpm dlx shadcn@latest init

# Add components as needed
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add dropdown-menu
```

### Adding Radix UI Primitives

For unstyled, accessible primitives:

```bash
pnpm add @radix-ui/react-dialog
pnpm add @radix-ui/react-dropdown-menu
pnpm add @radix-ui/react-tooltip
```

### Adding Headless UI

Alternative to Radix with Tailwind integration:

```bash
pnpm add @headlessui/react
```

---

## Toast Notifications

### Usage

```tsx
import { useToast } from '@/components/ui/Toast';

function MyComponent() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('Changes saved!');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  return (
    <button onClick={handleSave}>Save</button>
  );
}
```

### Toast Types

```tsx
toast.success('Operation completed');
toast.error('Something went wrong');
toast.warning('Please review your input');
toast.info('New features available');

// Custom duration (ms)
toast.addToast('success', 'Custom message', 10000);
```

### When to Use Toasts

- Form submissions (success/error)
- Copy to clipboard
- Downloads
- Background operations completing
- Temporary confirmations

### When NOT to Use Toasts

- Critical errors (use inline error messages)
- Information that needs user action
- Persistent notifications

---

## Error Handling

### Global Error Page

The template includes `src/app/error.tsx` for route-level errors:

```tsx
// Automatically catches errors in the route
export default function Page() {
  // If this throws, error.tsx handles it
  const data = await fetchData();
  return <Content data={data} />;
}
```

### Component Error Boundary

For component-level error handling:

```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <RiskyComponent />
    </ErrorBoundary>
  );
}

// With reset function
<ErrorBoundary
  fallback={({ error, reset }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )}
>
  <RiskyComponent />
</ErrorBoundary>
```

### AsyncBoundary (Error + Suspense)

Combined error and loading handling:

```tsx
import { AsyncBoundary } from '@/components/ui/ErrorBoundary';

function Page() {
  return (
    <AsyncBoundary
      loadingFallback={<SkeletonCard />}
      errorFallback={<ErrorMessage />}
    >
      <AsyncComponent />
    </AsyncBoundary>
  );
}
```

### Error Handling Best Practices

```tsx
// ❌ Bad: Silent failure
try {
  await saveData();
} catch (e) {
  // Nothing happens - user doesn't know it failed
}

// ✅ Good: User feedback
try {
  await saveData();
  toast.success('Saved!');
} catch (error) {
  toast.error('Failed to save. Please try again.');
  console.error('Save error:', error);
}
```

---

## Loading States

### Spinner

```tsx
import { Spinner, LoadingOverlay, LoadingCard } from '@/components/ui/Spinner';

// Inline spinner
<Spinner size="sm" />

// Full page overlay
<LoadingOverlay message="Loading..." />

// Card placeholder
<LoadingCard lines={3} />
```

### Skeleton Components

```tsx
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonForm,
} from '@/components/ui/Skeleton';

// Basic skeleton
<Skeleton className="h-4 w-full" />

// Text block
<SkeletonText lines={3} />

// Card with optional image
<SkeletonCard hasImage />

// List of items
<SkeletonList count={5} />

// Table
<SkeletonTable rows={10} columns={4} />

// Form
<SkeletonForm fields={5} />
```

### With Suspense

```tsx
import { Suspense } from 'react';
import { SkeletonCard } from '@/components/ui/Skeleton';

function Page() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <AsyncComponent />
    </Suspense>
  );
}
```

### Button Loading State

```tsx
function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button disabled={isLoading}>
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Saving...
        </>
      ) : (
        'Save'
      )}
    </button>
  );
}
```

---

## Form Management

### Built-in useForm Hook

For simple forms, use the built-in hook:

```tsx
import { useForm, FormField } from '@/hooks/useForm';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

function LoginForm() {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({
    schema,
    initialValues: { email: '', password: '' },
    onSubmit: async (data) => {
      await login(data);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Email"
        name="email"
        error={errors.email}
        touched={touched.email}
        required
      >
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className="input"
        />
      </FormField>

      <FormField
        label="Password"
        name="password"
        error={errors.password}
        touched={touched.password}
        required
      >
        <input
          type="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className="input"
        />
      </FormField>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### React Hook Form (Recommended for Complex Forms)

For complex forms, install React Hook Form:

```bash
pnpm add react-hook-form @hookform/resolvers
```

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function ComplexForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

---

## Data Fetching

### Built-in API Client

```tsx
import { notesApi } from '@/lib/api';

// In a Server Component
async function NotesPage() {
  const notes = await notesApi.list();
  return <NotesList notes={notes} />;
}

// In a Client Component
function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesApi.list().then(setNotes).finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonList />;
  return <NotesList notes={notes} />;
}
```

### TanStack Query (Recommended)

For advanced caching and state management:

```bash
pnpm add @tanstack/react-query
```

Then uncomment the code in `src/lib/query.ts` and use:

```tsx
import { useNotes, useCreateNote } from '@/lib/query';

function NotesPage() {
  const { data: notes, isLoading, error } = useNotes();
  const createNote = useCreateNote();

  if (isLoading) return <SkeletonList />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <NotesList notes={notes} />
      <button
        onClick={() => createNote.mutate({ title: 'New Note' })}
        disabled={createNote.isPending}
      >
        Add Note
      </button>
    </div>
  );
}
```

---

## Progressive Enhancement

### Server-First Rendering

Always start with server components:

```tsx
// ✅ Server Component (default)
async function NotesPage() {
  const notes = await prisma.note.findMany();
  return <NotesList notes={notes} />;
}

// Add client interactivity where needed
'use client';
function NoteActions({ noteId }: { noteId: string }) {
  // Client-side logic here
}
```

### Graceful JavaScript Failure

Forms should work without JavaScript:

```tsx
// ✅ Works without JS (form submission)
<form action="/api/notes" method="POST">
  <input name="title" required />
  <button type="submit">Create</button>
</form>

// Enhanced with JS
'use client';
function EnhancedForm() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Enhanced client-side handling
  };

  return (
    <form onSubmit={handleSubmit} action="/api/notes" method="POST">
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Loading States Without JavaScript

Use CSS-only loading indicators as fallback:

```css
/* Base state (no-js friendly) */
.submit-btn {
  position: relative;
}

/* Enhanced loading state */
.submit-btn[data-loading="true"]::after {
  content: "";
  position: absolute;
  /* spinner styles */
}
```

### Feature Detection

```tsx
function ShareButton({ url }: { url: string }) {
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  if (canShare) {
    return (
      <button onClick={() => navigator.share({ url })}>
        Share
      </button>
    );
  }

  // Fallback: copy to clipboard
  return (
    <button onClick={() => navigator.clipboard.writeText(url)}>
      Copy Link
    </button>
  );
}
```

### Offline Support

For offline-first apps:

```tsx
// Check online status
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Usage
function App() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return <OfflineBanner />;
  }

  return <MainContent />;
}
```

---

## Component Exports

Update `src/components/ui/index.ts` for clean imports:

```tsx
// src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Modal } from './Modal';
export { Badge } from './Badge';
export { Spinner, LoadingOverlay, LoadingCard } from './Spinner';
export { ToastProvider, useToast } from './Toast';
export { Avatar } from './Avatar';
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonForm,
  SkeletonPageHeader,
  SkeletonDashboard,
} from './Skeleton';
export { ErrorBoundary, AsyncBoundary } from './ErrorBoundary';
```

---

## Quick Reference

### Adding Features

| Need | Install |
|------|---------|
| More components | `pnpm dlx shadcn@latest init` |
| Complex forms | `pnpm add react-hook-form @hookform/resolvers` |
| Data fetching | `pnpm add @tanstack/react-query` |
| Animations | `pnpm add framer-motion` |
| Date handling | `pnpm add date-fns` |
| Icons | Already included: `lucide-react` |

### Component Checklist

Every interactive component should have:

- [ ] Loading state
- [ ] Error state
- [ ] Empty state
- [ ] Disabled state (if applicable)
- [ ] Hover/focus states
- [ ] Mobile responsiveness
- [ ] Keyboard accessibility
- [ ] ARIA labels
