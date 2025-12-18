# BMAD Method Guide

**BMAD** (Breakthrough Method for Agile AI-Driven Development) provides specialized AI agents for different development phases. This guide helps you choose the right agent and workflow.

## Quick Start: Which Workflow?

```
┌─────────────────────────────────────────────────────────────────┐
│                    What are you building?                        │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
     ┌──────────┐      ┌──────────┐      ┌──────────┐
     │ Bug fix  │      │ Feature  │      │  Major   │
     │ or small │      │ (1-3 day │      │ feature/ │
     │ tweak    │      │  effort) │      │ new sys  │
     └──────────┘      └──────────┘      └──────────┘
            │                 │                 │
            ▼                 ▼                 ▼
     ┌──────────┐      ┌──────────┐      ┌──────────┐
     │  QUICK   │      │ STANDARD │      │ FULL     │
     │  FLOW    │      │   FLOW   │      │ FLOW     │
     │          │      │          │      │          │
     │ 1 agent  │      │ 2 agents │      │ 3+ agents│
     └──────────┘      └──────────┘      └──────────┘
```

---

## Workflow Options

### 1. Quick Flow (Solo Dev) - Most Common

**Time**: 5-30 minutes
**Agent**: `/bmad/quick-flow`
**Best for**: Bug fixes, small features, refactoring, config changes

```bash
# Just use quick-flow for most tasks
/bmad/quick-flow

# Then describe your task
"Add a logout button to the header"
"Fix the login redirect bug"
"Refactor the user service to use the new API"
```

**Output**: Working code, committed with tests.

---

### 2. Standard Flow (Small Teams)

**Time**: 1-4 hours
**Agents**: PM → Dev (or Architect → Dev)
**Best for**: Features needing planning or architecture decisions

```bash
# Step 1: Create a story
/bmad/pm
"Create a story for user profile editing"

# Step 2: Implement it
/bmad/dev
"Implement STORY-001 (user profile editing)"
```

**Output**: Story document → Working implementation

---

### 3. Full Flow (Larger Features)

**Time**: 4+ hours
**Agents**: PM → Architect → Dev
**Best for**: New systems, complex features, architectural changes

```bash
# Step 1: Define requirements
/bmad/pm
"Create PRD for real-time notifications system"

# Step 2: Design architecture
/bmad/architect
"Design architecture for the notifications PRD"

# Step 3: Implement stories
/bmad/dev
"Implement STORY-001 from notifications PRD"
```

**Output**: PRD → Architecture Doc → Working implementation

---

## Agent Reference

### Primary Agents (Use These)

| Agent | Command | When to Use |
|-------|---------|-------------|
| **Quick Flow** | `/bmad/quick-flow` | Bug fixes, small features, refactoring |
| **Dev** | `/bmad/dev` | Implementing stories with TDD |
| **PM** | `/bmad/pm` | Creating stories, defining requirements |
| **Architect** | `/bmad/architect` | System design, technical decisions |

### Supporting Agents (Use When Needed)

| Agent | Command | When to Use |
|-------|---------|-------------|
| **Analyst** | `/bmad/analyst` | Complex requirements gathering |
| **Test Architect** | `/bmad/test-architect` | Test strategy for complex systems |
| **Scrum Master** | `/bmad/sm` | Sprint planning, backlog management |

---

## Choosing the Right Agent

### Decision Tree

```
Is this a bug fix or < 2 hours of work?
├── YES → /bmad/quick-flow
└── NO
    │
    Does it need architecture decisions?
    ├── YES → /bmad/architect then /bmad/dev
    └── NO
        │
        Is the requirement clear?
        ├── YES → /bmad/dev (with story template)
        └── NO → /bmad/pm then /bmad/dev
```

### Common Scenarios

| Scenario | Recommended Flow |
|----------|-----------------|
| "Fix the login bug" | Quick Flow |
| "Add dark mode" | Quick Flow or Standard |
| "Add user authentication" | Standard (PM → Dev) |
| "Build real-time chat" | Full (PM → Architect → Dev) |
| "Refactor the API layer" | Standard (Architect → Dev) |
| "Add a new button" | Quick Flow |
| "Integrate with Stripe" | Standard (Architect → Dev) |

---

## Handoff Procedures

### PM → Dev Handoff

1. PM creates story in `docs/bmad/stories/STORY-XXX.md`
2. PM marks story as "Ready for Development"
3. Dev reads entire story file before starting
4. Dev follows tasks in order, updating status as they go

**Handoff artifact**: Story file with acceptance criteria

### PM → Architect Handoff

1. PM creates PRD in `docs/bmad/prds/PRD-XXX.md`
2. PM identifies technical questions/decisions needed
3. Architect creates architecture doc referencing PRD

**Handoff artifact**: PRD document

### Architect → Dev Handoff

1. Architect creates architecture doc in `docs/bmad/architecture/`
2. Architect breaks down into implementable stories
3. Dev implements stories following architecture guidance

**Handoff artifact**: Architecture doc + Story files

### Handoff Checklist

Before handing off to the next agent:

- [ ] All required documents created
- [ ] Acceptance criteria defined (for stories)
- [ ] Technical decisions documented (for architecture)
- [ ] Open questions resolved or flagged
- [ ] Dependencies identified

---

## Solo Developer Guide

If you're working alone, you don't need all 7 agents. Here's the simplified approach:

### Solo Workflow

```
90% of tasks: /bmad/quick-flow
 9% of tasks: Write a story yourself, then /bmad/dev
 1% of tasks: Full flow for major features
```

### When Solo Devs Should Use Each Agent

| Agent | Solo Dev Usage |
|-------|----------------|
| Quick Flow | Daily - your default |
| Dev | When you want TDD discipline |
| PM | Skip - write stories yourself |
| Architect | Only for major decisions |
| Others | Skip - you don't need them |

### Solo Dev Story Template (Simplified)

```markdown
# Story: [Title]

## What
[1-2 sentences on what to build]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Files to Change
- `src/path/file.ts`

## Notes
[Any technical considerations]
```

---

## Output Examples

### Example: Good Story (PM Output)

See: `docs/bmad/examples/story-example.md`

### Example: Good Architecture Doc (Architect Output)

See: `docs/bmad/examples/architecture-example.md`

---

## Project Context

All agents reference `docs/bmad/project-context.md` for:
- Tech stack decisions
- Coding standards
- Architecture patterns
- Known constraints

**Keep this file updated** as you make decisions.

---

## FAQ

### "This seems complex. Do I need all this?"

No. Most developers only need `/bmad/quick-flow`. The full system exists for larger teams and complex projects.

### "When should I NOT use quick-flow?"

When the task:
- Affects multiple systems
- Needs stakeholder input
- Has unclear requirements
- Is larger than 1 day of work

### "How do I know if I need an architect review?"

You need architect review when:
- Adding new database tables
- Changing API contracts
- Integrating new external services
- Making security-related changes
- Performance is critical

### "What if I'm stuck between two agents?"

Start with `/bmad/quick-flow`. If it tells you to escalate, it will recommend the right agent.
