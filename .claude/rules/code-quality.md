# Code Quality Standards

## TypeScript Requirements

### Strict Mode
- Enable all strict flags
- No `any` types - use `unknown` if type is truly unknown
- Explicit return types on exported functions

### Type Patterns

```typescript
// GOOD: Proper types
interface UserProps {
  id: string;
  name: string;
  email: string;
}

// BAD: Using any
function processData(data: any) { }

// GOOD: Using unknown
function processData(data: unknown) {
  if (isValidData(data)) { }
}
```

### Boolean Expressions
```typescript
// BAD
if (items.length) { }
if (value) { }

// GOOD
if (items.length > 0) { }
if (value !== undefined) { }
if (Boolean(value)) { }
```

### Promise Handling
```typescript
// BAD: Fire and forget
fetchData();

// GOOD: Handle or explicitly ignore
await fetchData();
void fetchData(); // Explicitly ignored
```

### Optional Chaining
```typescript
// BAD
if (user && user.profile && user.profile.settings) { }

// GOOD
if (user?.profile?.settings) { }
```

## Import Order

Maintain consistent import order:
1. React/Next.js
2. External libraries
3. Internal modules (@/)
4. Relative imports
5. Types
6. Styles

```typescript
// Example
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { formatCurrency } from './utils';
import type { User } from '@/types';
import './styles.css';
```

## File Structure

### Component Files
```
ComponentName/
├── index.tsx          # Main export
├── ComponentName.tsx  # Component implementation
├── types.ts           # Type definitions
└── utils.ts           # Component-specific utilities
```

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utils: camelCase (`formatDate.ts`)
- Types: PascalCase (`User`, `ApiResponse`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)

## Error Handling

```typescript
// Always handle errors explicitly
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error
  }
  logger.error('Operation failed', { error });
  throw error; // Re-throw if can't handle
}
```

## Comments

- Don't add comments explaining obvious code
- DO add comments for non-obvious business logic
- Use JSDoc for public APIs

```typescript
// BAD: Obvious comment
// Loop through users
users.forEach(user => { });

// GOOD: Explains why
// Filter inactive users first to reduce API calls
// since the external service charges per request
const activeUsers = users.filter(u => u.isActive);
```
