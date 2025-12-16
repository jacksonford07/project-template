# Project Template

A production-ready Next.js 15 project template with TypeScript, Prisma, BMAD Method, and best practices baked in.

## For New Users

### One-Command Setup

```bash
# Clone the template
git clone https://github.com/jacksonford07/project-template.git my-project
cd my-project

# Run the setup script
./scripts/setup.sh
```

The setup script will:
1. **Check your environment** - Node.js, pnpm, Git
2. **Install GitHub CLI** (if missing) and log you in
3. **Install Vercel CLI** (if missing) and log you in
4. **Create a new GitHub repository** for your project
5. **Link to Vercel** for deployment

### What Gets Installed

| Tool | Purpose | Auto-Install |
|------|---------|--------------|
| Node.js 18+ | Runtime | Manual (shows link) |
| pnpm | Package manager | Yes (via npm) |
| GitHub CLI | Repository management | Yes (via brew/apt) |
| Vercel CLI | Deployment | Yes (via npm) |

---

## Quick Start (Manual)

If you prefer manual setup:

1. **Clone and rename**:
   ```bash
   git clone https://github.com/jacksonford07/project-template.git my-project
   cd my-project
   rm -rf .git && git init
   ```

2. **Install dependencies**:
   ```bash
   cd web
   pnpm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Start development**:
   ```bash
   pnpm dev
   ```

5. **Deploy to Vercel**:
   ```bash
   vercel login  # If not logged in
   vercel --prod
   ```

---

## Creating Your Own Repository

The setup script can create a new GitHub repository for you:

```bash
./scripts/setup.sh new
```

Or manually:

```bash
# 1. Remove template's git history
rm -rf .git
git init

# 2. Create GitHub repo
gh repo create my-project --private --source=. --push
```

---

## Deployment

### First-Time Deploy

```bash
cd web

# Log in to Vercel (opens browser)
vercel login

# Deploy to production
vercel --prod
```

### Subsequent Deploys

```bash
vercel --prod
```

### Using the Setup Script

```bash
./scripts/setup.sh deploy
```

---

## What's Included

### Configuration
- TypeScript strict mode
- ESLint with strict rules
- Prettier formatting
- Commitlint for conventional commits
- Vitest for testing
- Husky + lint-staged for pre-commit hooks

### Core Libraries
- Centralized logger with error tracking
- Prisma client setup
- NextAuth authentication
- Authorization middleware
- Format utilities

### Project Structure
- Database-first API architecture
- Soft deletes by default
- Observability tables (ErrorLog, PerformanceMetric)
- React context providers
- Custom hooks

### CI/CD
- GitHub Actions workflow
- Local CI script
- Standard-version for releases

### AI Assistant Integration
- `.cursor/rules/` - Cursor AI guidelines (10 rules)
- `.cursor/rules/bmad/` - BMAD agents for Cursor
- `.claude/commands/bmad/` - BMAD agents for Claude Code
- `CLAUDE.md` - Claude/AI assistant instructions

---

## BMAD Method

This template integrates the **BMAD Method** (Breakthrough Method for Agile AI-Driven Development) - a framework that provides specialized AI agents for structured development.

### Available Agents

| Agent | Claude Command | Purpose |
|-------|----------------|---------|
| Dev (Amelia) | `/bmad/dev` | TDD implementation |
| Architect (Winston) | `/bmad/architect` | System design |
| PM (Sarah) | `/bmad/pm` | Requirements & stories |
| Quick Flow | `/bmad/quick-flow` | Rapid feature dev |
| Analyst (Maya) | `/bmad/analyst` | Requirements analysis |
| Scrum Master (Alex) | `/bmad/sm` | Sprint facilitation |
| Test Architect (Quinn) | `/bmad/test-architect` | Testing strategy |

### Workflow Tracks

#### Quick Flow (< 5 min)
For bug fixes, small features:
```
/bmad/quick-flow
> Fix the login redirect bug
```

#### Standard Flow (< 15 min)
For medium features:
```
1. /bmad/pm         → Create story
2. /bmad/architect  → Design solution
3. /bmad/dev        → Implement with TDD
```

#### Enterprise Flow (< 30 min)
For large features:
```
1. /bmad/analyst        → Requirements elicitation
2. /bmad/pm             → PRD & stories
3. /bmad/architect      → Architecture design
4. /bmad/dev            → Implementation
5. /bmad/test-architect → Testing strategy
```

### Using with AI

**Claude Code**:
```
/bmad/dev
> Implement the story in web/docs/bmad/stories/story-001.md
```

**Cursor**:
Reference agents with `@bmad/dev`, `@bmad/architect`, etc.

### Project Context

All agents reference `web/docs/bmad/project-context.md`. Keep this file updated with:
- Tech stack decisions
- Architecture patterns
- Coding standards
- Known constraints

### Templates

Find templates in `web/docs/bmad/templates/`:
- `story-template.md` - Development story format
- `prd-template.md` - Product requirements document
- `architecture-template.md` - Architecture document

---

## Setup Script Commands

```bash
# Interactive menu
./scripts/setup.sh

# Check environment only
./scripts/setup.sh check

# Create new project
./scripts/setup.sh new

# Deploy to Vercel
./scripts/setup.sh deploy
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | TypeScript check |
| `pnpm test` | Run tests |
| `pnpm validate` | Lint + type-check |
| `pnpm ci:all` | Run full CI locally |

## Documentation

- `CLAUDE.md` - AI assistant instructions & project rules
- `web/docs/bmad/project-context.md` - Project-specific context for AI agents
- `web/docs/bmad/templates/` - Document templates

## License

MIT
