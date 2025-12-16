# Project Instructions for AI Assistants

This document provides essential context and rules for AI assistants (Claude, Cursor, etc.) working on this project.

## Project Overview

This is a Next.js 15 project with TypeScript, Prisma ORM, and NextAuth for authentication. It follows strict coding standards and patterns designed for maintainability and reliability.

**This project uses the BMAD Method** - an AI-driven agile development framework with specialized agents.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library
- **Package Manager**: pnpm
- **AI Workflow**: BMAD Method

---

## BMAD Method Integration

### What is BMAD?
BMAD (Breakthrough Method for Agile AI-Driven Development) provides specialized AI agents for different development phases. Each agent has a specific role and expertise.

### Available Agents

| Agent | Command | Purpose |
|-------|---------|---------|
| **Dev (Amelia)** | `/bmad/dev` | Implement stories with TDD |
| **Architect (Winston)** | `/bmad/architect` | System design & architecture |
| **PM (Sarah)** | `/bmad/pm` | Product requirements & stories |
| **Quick Flow** | `/bmad/quick-flow` | Rapid small feature dev |
| **Analyst (Maya)** | `/bmad/analyst` | Requirements elicitation |
| **Scrum Master (Alex)** | `/bmad/sm` | Sprint facilitation |
| **Test Architect (Quinn)** | `/bmad/test-architect` | Testing strategy |

### Workflow Tracks

#### Quick Flow (< 5 min)
For: Bug fixes, small features, refactoring
```
User: /bmad/quick-flow
User: Fix the login redirect bug
```

#### Standard Flow (< 15 min)
For: Medium features requiring planning
```
1. /bmad/pm → Create story
2. /bmad/architect → Design solution
3. /bmad/dev → Implement
```

#### Enterprise Flow (< 30 min)
For: Large features, new systems
```
1. /bmad/analyst → Requirements
2. /bmad/pm → PRD & stories
3. /bmad/architect → Architecture
4. /bmad/dev → Implementation
5. /bmad/test-architect → Test strategy
```

### Project Context

All agents reference: `web/docs/bmad/project-context.md`

**Update this file** with:
- Tech stack decisions
- Architecture patterns
- Coding standards
- Known constraints

---

## Critical Rules

### 1. ALWAYS Read Before Modifying

**Before making ANY changes to a file:**
- Read the ENTIRE file first
- Understand the current implementation
- Check for dependencies and usage patterns
- Never make blind search/replace changes

### 2. DRY - Don't Repeat Yourself

**Before creating new code:**
- Check `components/ui/` for existing components
- Check `lib/` for existing utilities
- Search for similar patterns in the codebase
- Reuse before creating

### 3. TypeScript Requirements

- **NO `any` types** - be explicit with types
- **NO non-null assertions (`!`)** - handle null cases properly
- **Handle promises properly** - no floating promises
- **Use modern operators** - `?.` and `??`
- **Add return types** to all functions

### 4. Database Rules

- **ALWAYS use soft deletes** - set `deletedAt` instead of hard deleting
- **Use `prisma migrate dev`** for schema changes, never `db push`
- **Include timestamps** - `createdAt`, `updatedAt`, `deletedAt` on all tables

### 5. API Architecture

- **Primary routes**: `/api/internal/*` - Database-first with caching
- **Sync routes**: `/api/sync/*` - Explicit sync operations
- **External routes**: `/api/[external]/*` - Direct API proxies
- **Always check database first**, external API as fallback

### 6. Logging

Use the centralized logger, not `console`:

```typescript
import { logger } from '@/lib/logger';

logger.info('Context', 'Message', { data });
logger.error('Context', 'Message', error, { data });
logger.success('Context', 'Message', { data });
```

### 7. Git Workflow

- **Conventional commits**: `feat(scope): message`, `fix(scope): message`
- **DO NOT push** without explicit instruction
- **One change at a time** - test after each change

---

## Project Structure

```
project/
├── .claude/commands/bmad/    # Claude Code BMAD agents
├── .cursor/rules/bmad/       # Cursor BMAD agents
├── .github/workflows/        # CI/CD
├── web/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   └── api/
│   │   │       ├── internal/ # Database-first routes
│   │   │       └── sync/     # Sync operations
│   │   ├── components/ui/    # Reusable UI
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities & services
│   │   ├── styles/           # Style constants
│   │   └── types/            # TypeScript types
│   ├── docs/bmad/
│   │   └── project-context.md  # BMAD project context
│   └── prisma/               # Database schema
└── CLAUDE.md                 # This file
```

---

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript check
pnpm test             # Run tests
pnpm validate         # Lint + type-check

# Database
pnpm prisma migrate dev --name description
pnpm prisma studio
pnpm db:seed

# Build & CI
pnpm build
pnpm ci:all           # Run full CI locally
```

---

## Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
```

Examples:
- `feat(auth): add oauth2 login support`
- `fix(api): resolve memory leak in processor`
- `docs(readme): update installation steps`

---

## CRITICAL: Feature Completion Rule

**EVERY feature must be 100% functional. No placeholder UI allowed.**

### The Completion Checklist

Before considering ANY UI element done, verify:

1. **Interactive elements work**
   - Buttons trigger actions
   - Forms submit and validate
   - Search bars filter content
   - Links navigate to real destinations
   - Modals open/close properly

2. **All states are handled**
   - Loading states
   - Empty states (no results)
   - Error states
   - Success feedback
   - Disabled states when appropriate

3. **Edge cases covered**
   - What happens with 0 items?
   - What happens with 1000 items?
   - What if the user types special characters?
   - What if network fails?

4. **Links go somewhere real**
   - No `href="#"` unless it's an anchor link
   - External links: Either link to real URLs or remove the element
   - Social links: Connect to actual profiles or remove them

### Examples of INCOMPLETE (Not Allowed)

```tsx
// BAD: Search bar that does nothing
<input placeholder="Search..." />

// BAD: Button with no handler
<button>Submit</button>

// BAD: Link to nowhere
<a href="#">Learn More</a>

// BAD: Social links to hash
<a href="#">Twitter</a>
<a href="#">GitHub</a>
```

### Examples of COMPLETE (Required)

```tsx
// GOOD: Functional search with state
const [query, setQuery] = useState('');
const filtered = items.filter(i => i.name.includes(query));
<input value={query} onChange={e => setQuery(e.target.value)} />

// GOOD: Button with handler
<button onClick={handleSubmit}>Submit</button>

// GOOD: Real link or removed entirely
<a href="https://docs.example.com">Learn More</a>

// GOOD: Either real social links or remove the section
<a href="https://twitter.com/actualhandle">Twitter</a>
// OR just don't include social links if not applicable
```

### Before Marking Any Task Complete

Ask yourself:
- Can a user actually USE every visible element?
- Does clicking everything do what it looks like it should?
- Are there any "dead" buttons or links?
- Would this pass a QA review?

**If any UI element is non-functional, the feature is NOT complete.**

---

## UI Patterns & Best Practices

### 1. Toast Notifications for Button Feedback

**Every button that performs an action must provide visual feedback.** Use a toast notification system so users know their action worked.

```tsx
// Toast Context Pattern
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container renders toasts in bottom-right corner */}
    </ToastContext.Provider>
  );
}

// Usage in components
const { showToast } = useToast();

const handleCopy = async () => {
  await navigator.clipboard.writeText(value);
  showToast('Copied to clipboard!', 'success');
};

const handleDownload = () => {
  // ... download logic
  showToast('Downloaded successfully!', 'success');
};
```

**When to use toasts:**
- Copy to clipboard actions
- Download actions
- Form submissions
- Save/update actions
- Any action that completes without page navigation

### 2. Curated Filter Categories (Not Dynamic)

**Prefer curated filter lists over dynamically generated ones.** Dynamic filters from data tags can create too many options and overwhelm users.

```tsx
// BAD: Dynamic filters from all tags - creates clutter
const allTags = ['All', ...Array.from(new Set(themes.flatMap(t => t.tags)))];
// Result: 18+ filter buttons making UI unusable

// GOOD: Curated, meaningful categories
const filterCategories = ['All', 'Dark', 'Warm', 'Cool', 'Minimal', 'Vibrant'];
// Result: 6 focused options that users can quickly scan
```

**Filter implementation tips:**
- Limit to 5-8 filter options maximum
- Use case-insensitive matching
- Match against multiple fields (tags, description, name)
- Provide a clear "All" option to reset

```tsx
// Good filter logic - case insensitive, multi-field matching
const matchesFilter = filter === 'All' ||
  item.tags.some(tag => tag.toLowerCase() === filter.toLowerCase()) ||
  item.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())) ||
  item.description.toLowerCase().includes(filter.toLowerCase());
```

### 3. Testable Buttons Checklist

Every button in the UI should be testable by the user. This means:

1. **Copy buttons** → Show toast with "Copied [value]"
2. **Download buttons** → Show toast with "Downloaded [item name]"
3. **Submit buttons** → Show loading state, then success/error toast
4. **Toggle buttons** → Show clear visual state change
5. **Filter buttons** → Immediately update content, show active state
6. **Search inputs** → Filter content in real-time as user types
7. **Clear/Reset buttons** → Reset to initial state, optionally show toast

---

## What NOT to Do

1. **Don't delete files** without checking dependencies first
2. **Don't make many changes at once** - one change, then test
3. **Don't use `any` types** - be explicit
4. **Don't hardcode values** - use constants and configs
5. **Don't create new utilities** without checking for existing ones
6. **Don't push** without explicit approval
7. **Don't skip BMAD workflow** for non-trivial features
8. **Don't add placeholder UI** - every element must be functional
9. **Don't use `href="#"`** - either link to something real or remove it
10. **Don't add search/filter UI** without implementing the logic

## What TO Do

1. **Read files** before modifying them
2. **Use BMAD agents** for structured development
3. **Update project-context.md** with decisions
4. **Use the logger** for all logging needs
5. **Follow database-first** pattern for APIs
6. **Use conventional commits** for all commits
7. **Test incrementally** after each change
8. **Complete every feature** - no visual-only elements
9. **Verify all interactivity** before marking done
10. **Remove unused UI** rather than leaving it broken

---

## Deployment

### First-Time Setup for New Users

When a new user clones this template, use the setup script:

```bash
./scripts/setup.sh
```

This will:
1. Check for required tools (Node.js, pnpm, Git)
2. Install GitHub CLI if missing and prompt for login
3. Install Vercel CLI if missing and prompt for login
4. Create a new GitHub repository
5. Link the project to Vercel

### CLI Detection Pattern

When deploying, always check if CLIs are available and the user is authenticated:

```bash
# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel..."
    vercel login
fi

# Deploy
vercel --prod
```

### Deployment Commands

```bash
# Interactive setup (recommended for new users)
./scripts/setup.sh

# Quick deploy (if already set up)
./scripts/setup.sh deploy

# Manual deploy
cd web && vercel --prod
```

### Creating Separate Repositories

Each project should have its own repository, not use template branches:

```bash
# Option 1: Use setup script
./scripts/setup.sh new

# Option 2: Manual
rm -rf .git
git init
gh repo create my-project --private --source=. --push
```

### Environment Variables on Vercel

When deploying to Vercel, set these environment variables in the Vercel dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random string for auth
- `NEXTAUTH_URL` - Your deployment URL

---

## Module Library System

The template includes a **module library** for saving and reusing patterns across projects. This is an iterative system - each project makes the template better.

### Philosophy

```
Build → Refine → Extract → Reuse → Improve
```

When you build something reusable in a project, save it back to the template for future projects.

### Available Modules

```bash
# List all modules
./scripts/modules.sh list
```

Current modules:
- `toast-system` - Context-based toast notifications
- `filter-tabs` - Curated filter tabs (not dynamic)
- `color-palette` - Interactive color swatches with copy
- `typography-scale` - Typography showcase with copyable CSS

### Importing Modules

```bash
# Import a module into current project
./scripts/modules.sh import toast-system

# Import with dependencies
./scripts/modules.sh import color-palette
# (will prompt to import toast-system dependency)
```

Files are copied to `src/modules/<category>/`.

### Saving New Modules

When you build something reusable:

```bash
# Interactive save wizard
./scripts/modules.sh save
```

Or manually:
1. Copy file to `modules/<category>/`
2. Add entry to `modules/registry.json`
3. Push to template repo

### When to Save a Module

**DO save when:**
- Used pattern in 2+ projects
- Solves a common problem
- Self-contained with clear interface
- Well-documented

**DON'T save:**
- Project-specific business logic
- Incomplete/experimental code
- Hardcoded values

### Module Structure

```tsx
/**
 * Module Name
 *
 * Description of what this module does.
 *
 * Dependencies: list any required modules
 *
 * @module module-id
 * @source iteration-name
 */

// Types
interface Props { ... }

// Export
export function MyModule() { ... }

// Usage example in comments at bottom
```

### Pushing Module Updates

After saving or modifying modules:

```bash
./scripts/modules.sh push
```

This commits and pushes to the template repository.
