# Modules Library

Reusable modules extracted from projects. These are battle-tested patterns and components that can be imported into new projects.

## Quick Start

```bash
# List available modules
./scripts/modules.sh list

# Import a module into your project
./scripts/modules.sh import toast-system

# Save a new module from your project
./scripts/modules.sh save
```

## Available Modules

### Patterns

| Module | Description |
|--------|-------------|
| `toast-system` | Context-based toast notifications with success/info/error types |
| `filter-tabs` | Tab-based filtering with curated categories (not dynamic) |

### Components

| Module | Description |
|--------|-------------|
| `color-palette` | Interactive color swatches with click-to-copy |
| `typography-scale` | Typography showcase with copyable CSS values |

## Directory Structure

```
modules/
├── registry.json       # Module manifest with metadata
├── README.md           # This file
├── components/         # Reusable UI components
│   ├── color-palette.tsx
│   └── typography-scale.tsx
├── patterns/           # Code patterns and architectural pieces
│   ├── toast-system.tsx
│   └── filter-tabs.tsx
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # Reusable style definitions
```

## Using Modules

### 1. Import into Project

```bash
./scripts/modules.sh import toast-system
```

This copies the module to your project's `src/modules/` directory.

### 2. Update Imports

After importing, update your code to use the local path:

```tsx
// Before (if copying manually)
import { ToastProvider, useToast } from '@/path/to/toast';

// After importing
import { ToastProvider, useToast } from '@/modules/patterns/toast-system';
```

### 3. Use the Module

```tsx
// Wrap your app
export default function App() {
  return (
    <ToastProvider>
      <MyApp />
    </ToastProvider>
  );
}

// Use in components
function MyComponent() {
  const { showToast } = useToast();

  return (
    <button onClick={() => showToast('Saved!', 'success')}>
      Save
    </button>
  );
}
```

## Saving New Modules

When you build something reusable, save it back to the template:

### 1. Interactive Save

```bash
./scripts/modules.sh save
```

This will prompt for:
- Module ID (e.g., `my-cool-hook`)
- Name and description
- Category (components, patterns, hooks, utils, styles)
- Files to include
- Tags for searchability

### 2. Push to Template

```bash
./scripts/modules.sh push
```

This commits and pushes module changes to the template repository.

## Module Guidelines

### When to Save a Module

Save a module when:
- ✅ You've used it in 2+ projects
- ✅ It solves a common problem
- ✅ It's self-contained with clear interfaces
- ✅ It has good documentation/comments

Don't save:
- ❌ Project-specific business logic
- ❌ Incomplete/experimental code
- ❌ Code with hardcoded values

### Module Structure

Each module should have:

```tsx
/**
 * Module Name
 *
 * Description of what this module does.
 *
 * Dependencies: list any required modules
 *
 * @module module-id
 * @source iteration-name or project
 */

// Types
interface MyModuleProps { ... }

// Component/Hook/Utility
export function MyModule() { ... }

// Usage example in comments
/*
import { MyModule } from '@/modules/category/my-module';

function Example() {
  return <MyModule />;
}
*/
```

## Iterative Improvement

This is an iterative process:

1. **Build** - Create something in a project
2. **Refine** - Use it, improve it, generalize it
3. **Extract** - Save to modules when it's stable
4. **Reuse** - Import into future projects
5. **Improve** - Update the module based on new learnings

Each project makes the template better!
