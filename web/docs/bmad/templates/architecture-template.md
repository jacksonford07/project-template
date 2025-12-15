# [Feature/System] Architecture Document

**Author**: [Name]
**Date**: [Date]
**Status**: [Draft | Review | Approved]
**Version**: 1.0

---

## Overview

### Summary
[2-3 sentences describing what this architecture document covers]

### Related Documents
- PRD: [Link]
- Design Spec: [Link]

---

## Goals & Non-Goals

### Goals
- [What this architecture aims to achieve]
- [What this architecture aims to achieve]
- [What this architecture aims to achieve]

### Non-Goals
- [What this architecture explicitly does NOT address]
- [What this architecture explicitly does NOT address]

---

## Background

### Current State
[Description of how things work today, if applicable]

### Problem
[Technical problem being solved]

### Constraints
- [Technical constraint]
- [Business constraint]
- [Time constraint]

---

## Technical Design

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Component  │  │  Component  │  │  Component  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  /api/...   │  │  /api/...   │  │  /api/...   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Service    │  │  Service    │  │  Service    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │  PostgreSQL │  │  Cache      │                           │
│  └─────────────┘  └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Component Descriptions

#### [Component Name]
**Responsibility**: [What it does]
**Location**: `src/[path]`
**Dependencies**: [What it depends on]

#### [Component Name]
**Responsibility**: [What it does]
**Location**: `src/[path]`
**Dependencies**: [What it depends on]

---

### Data Flow

#### [Flow Name] (e.g., "User Authentication")
```
1. User submits credentials
   └─→ POST /api/auth/login
       └─→ AuthService.authenticate()
           └─→ Database: Verify credentials
           └─→ JWT: Generate token
       └─→ Response: { token, user }
```

#### [Flow Name]
```
[Describe the data flow]
```

---

### API Contracts

#### `[METHOD] /api/[endpoint]`

**Purpose**: [What this endpoint does]

**Request**:
```typescript
interface Request {
  // Body
  field: string;
}
```

**Response**:
```typescript
interface Response {
  data: {
    field: string;
  };
  error?: string;
}
```

**Error Codes**:
| Code | Description |
|------|-------------|
| 400 | [Reason] |
| 401 | [Reason] |
| 500 | [Reason] |

---

### Database Schema

#### New Tables

```prisma
model [ModelName] {
  id        String   @id @default(cuid())
  // Fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@index([field])
}
```

#### Schema Changes

| Table | Change | Reason |
|-------|--------|--------|
| [Table] | [Add/Modify/Remove] [field] | [Why] |

#### Migration Strategy
- [ ] Backward compatible: [Yes/No]
- [ ] Data migration needed: [Yes/No]
- [ ] Downtime required: [Yes/No]

---

## Trade-offs & Alternatives

### Chosen Approach
**[Approach Name]**

Pros:
- [Advantage]
- [Advantage]

Cons:
- [Disadvantage]
- [Disadvantage]

**Why chosen**: [Rationale]

### Alternatives Considered

#### Alternative 1: [Name]
**Description**: [Brief description]
**Why rejected**: [Reason]

#### Alternative 2: [Name]
**Description**: [Brief description]
**Why rejected**: [Reason]

---

## Security Considerations

### Authentication
- [How auth is handled]

### Authorization
- [How authz is handled]

### Data Protection
- [How sensitive data is protected]

### Input Validation
- [How inputs are validated]

---

## Performance Considerations

### Expected Load
- [Requests/second]
- [Data volume]

### Optimization Strategies
- [ ] Caching: [Strategy]
- [ ] Indexing: [Strategy]
- [ ] Query optimization: [Strategy]

### Monitoring
- [Metrics to track]

---

## Implementation Plan

### Phase 1: Foundation
- [ ] [Task]
- [ ] [Task]

### Phase 2: Core Features
- [ ] [Task]
- [ ] [Task]

### Phase 3: Polish & Optimization
- [ ] [Task]
- [ ] [Task]

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk] | [H/M/L] | [H/M/L] | [Strategy] |
| [Risk] | [H/M/L] | [H/M/L] | [Strategy] |

---

## Open Questions

- [ ] [Question]
- [ ] [Question]

---

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| [Term] | [Definition] |

### References
- [Link to relevant documentation]
- [Link to relevant documentation]

### Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial draft |
