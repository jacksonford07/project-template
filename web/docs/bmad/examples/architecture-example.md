# Real-Time Notifications Architecture

**Author**: Architect Agent (Winston)
**Date**: 2024-01-15
**Status**: Approved
**Version**: 1.0

---

## Overview

### Summary
This document describes the architecture for adding real-time notifications to the application. Users will receive instant notifications for events like mentions, task assignments, and system alerts without needing to refresh the page.

### Related Documents
- PRD: `docs/bmad/prds/PRD-003-notifications.md`
- Story: `docs/bmad/stories/STORY-015-notifications-backend.md`

---

## Goals & Non-Goals

### Goals
- Deliver notifications to users within 500ms of event occurrence
- Support web push notifications for background tabs
- Scale to 10,000 concurrent connections
- Persist notification history for 30 days

### Non-Goals
- Mobile push notifications (separate project)
- Email notifications (existing system handles this)
- SMS notifications

---

## Background

### Current State
Users must refresh the page to see new notifications. The current polling approach (every 60 seconds) creates unnecessary server load and poor UX.

### Problem
- Users miss time-sensitive notifications
- Polling creates 100k+ unnecessary requests/hour
- No notification when tab is in background

### Constraints
- Must work with existing NextAuth session management
- Vercel has 30-second function timeout (no long-polling)
- Budget limits prevent dedicated WebSocket server

---

## Technical Design

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser                                   │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │  React App  │  │  Service Worker │  │  Notification   │      │
│  │             │◄─┤  (Push)         │  │  Toast UI       │      │
│  └──────┬──────┘  └─────────────────┘  └─────────────────┘      │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │ SSE Connection
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Edge Runtime                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  GET /api/notifications/stream                               ││
│  │  (Server-Sent Events endpoint)                               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Upstash Redis                              │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │  Pub/Sub        │  │  Notification   │                       │
│  │  Channels       │  │  Storage        │                       │
│  │  (user:{id})    │  │  (30 day TTL)   │                       │
│  └─────────────────┘  └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
          ▲
          │ Publish
┌─────────────────────────────────────────────────────────────────┐
│                    Event Producers                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Task       │  │  Comment    │  │  System     │             │
│  │  Service    │  │  Service    │  │  Events     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Component Descriptions

#### SSE Endpoint
**Responsibility**: Maintain persistent connection with browser, stream notifications
**Location**: `src/app/api/notifications/stream/route.ts`
**Dependencies**: Redis pub/sub, NextAuth session

#### Notification Service
**Responsibility**: Create, store, and publish notifications
**Location**: `src/lib/notifications/service.ts`
**Dependencies**: Redis, Prisma

#### Notification Hook
**Responsibility**: Manage SSE connection lifecycle in React
**Location**: `src/hooks/use-notifications.ts`
**Dependencies**: SSE endpoint, Toast context

---

### Data Flow

#### Publishing a Notification
```
1. Event occurs (e.g., user mentioned in comment)
   └─→ CommentService.create()
       └─→ NotificationService.create({
             userId: mentionedUser.id,
             type: 'MENTION',
             title: 'You were mentioned',
             body: 'John mentioned you in "Project Update"',
             link: '/comments/123'
           })
           └─→ Redis: PUBLISH user:123 {notification}
           └─→ Redis: LPUSH notifications:123 {notification}
           └─→ Prisma: notification.create()
```

#### Receiving a Notification
```
1. Browser has SSE connection open
   └─→ GET /api/notifications/stream
       └─→ Redis: SUBSCRIBE user:123
           └─→ On message: stream.write(notification)
               └─→ Browser: EventSource.onmessage
                   └─→ useNotifications hook
                       └─→ Show toast
                       └─→ Update notification count
```

---

### API Contracts

#### `GET /api/notifications/stream`

**Purpose**: Server-Sent Events stream for real-time notifications

**Headers**:
```
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Response**: SSE stream
```
event: notification
data: {"id":"123","type":"MENTION","title":"You were mentioned",...}

event: heartbeat
data: {"timestamp":1705312200000}
```

#### `GET /api/internal/notifications`

**Purpose**: Fetch notification history

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | number | 20 | Max notifications to return |
| cursor | string | - | Pagination cursor |
| unread | boolean | - | Filter to unread only |

**Response**:
```typescript
interface NotificationsResponse {
  notifications: Notification[];
  nextCursor: string | null;
  unreadCount: number;
}
```

#### `PATCH /api/internal/notifications/:id`

**Purpose**: Mark notification as read

**Request**:
```typescript
interface MarkReadRequest {
  read: boolean;
}
```

**Response**:
```typescript
interface Notification {
  id: string;
  read: boolean;
  readAt: string | null;
}
```

---

### Database Schema

#### New Tables

```prisma
model Notification {
  id        String    @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String?
  link      String?
  read      Boolean   @default(false)
  readAt    DateTime?
  metadata  Json?
  createdAt DateTime  @default(now())
  expiresAt DateTime  // 30 days from creation

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@index([userId, createdAt])
  @@index([expiresAt])
}

enum NotificationType {
  MENTION
  ASSIGNMENT
  COMMENT
  SYSTEM
  REMINDER
}
```

#### Migration Strategy
- [x] Backward compatible: Yes
- [ ] Data migration needed: No
- [ ] Downtime required: No

---

## Trade-offs & Alternatives

### Chosen Approach: Server-Sent Events + Redis Pub/Sub

Pros:
- Works with Vercel Edge Runtime (no timeout issues)
- Simple implementation compared to WebSockets
- Native browser support, no client library needed
- Redis pub/sub scales horizontally

Cons:
- One-way communication only (client can't send through SSE)
- Need separate POST endpoints for user actions
- IE11 not supported (acceptable)

**Why chosen**: SSE provides real-time push without the complexity of WebSockets, and works within Vercel's serverless constraints.

### Alternatives Considered

#### Alternative 1: WebSocket (Pusher/Ably)
**Description**: Use managed WebSocket service
**Why rejected**: Monthly cost ($99+/mo for scale needed), adds external dependency

#### Alternative 2: Polling with Short Interval
**Description**: Poll every 5 seconds instead of 60
**Why rejected**: Still creates 720 requests/user/hour, doesn't scale

#### Alternative 3: Vercel's Edge Config
**Description**: Use Edge Config for notification state
**Why rejected**: Not designed for high-frequency updates, 10k reads/day limit

---

## Security Considerations

### Authentication
- SSE endpoint requires valid NextAuth session
- User can only subscribe to their own channel
- Session validated on connection and periodically

### Authorization
- Notifications scoped to userId
- No cross-user notification access
- Admin can send system-wide notifications

### Data Protection
- Notification content sanitized before storage
- Links validated to prevent XSS
- Sensitive data never included in notification body

---

## Performance Considerations

### Expected Load
- 5,000 concurrent users = 5,000 SSE connections
- ~100 notifications/minute across all users
- 99th percentile delivery: < 500ms

### Optimization Strategies
- [x] Redis pub/sub for horizontal scaling
- [x] Edge Runtime for low-latency connections
- [x] Batch notification fetches on page load
- [x] Index on (userId, read) for unread queries

### Monitoring
- Track SSE connection count
- Track notification delivery latency
- Alert on > 1000ms p99 latency
- Alert on connection error rate > 1%

---

## Implementation Plan

### Phase 1: Backend Foundation (Story-015)
- [ ] Add Notification model to schema
- [ ] Create NotificationService
- [ ] Set up Redis pub/sub
- [ ] Create SSE endpoint

### Phase 2: Frontend Integration (Story-016)
- [ ] Create useNotifications hook
- [ ] Add notification bell icon with count
- [ ] Create notification dropdown panel
- [ ] Integrate with toast system

### Phase 3: Event Integration (Story-017)
- [ ] Add notification triggers to TaskService
- [ ] Add notification triggers to CommentService
- [ ] Add system notification support
- [ ] Create notification preferences

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| SSE connections overwhelm server | High | Medium | Use Edge Runtime, connection limits |
| Redis pub/sub message loss | Medium | Low | Persist to DB before publish |
| Browser SSE reconnection storms | High | Medium | Exponential backoff in client |
| Notification spam | Medium | Medium | Rate limiting per user |

---

## Open Questions

- [x] ~~Which Redis provider?~~ → Upstash (serverless, Vercel integration)
- [x] ~~Notification retention period?~~ → 30 days
- [ ] Should we support notification preferences? → Deferred to Phase 3

---

## Appendix

### Glossary
| Term | Definition |
|------|------------|
| SSE | Server-Sent Events - HTTP-based one-way real-time communication |
| Pub/Sub | Publish/Subscribe messaging pattern |

### References
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Upstash Redis Pub/Sub](https://docs.upstash.com/redis/features/pubsub)
- [Vercel Edge Runtime](https://vercel.com/docs/concepts/functions/edge-functions)

### Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | Winston | Initial draft |
| 1.1 | 2024-01-16 | Winston | Added Redis pub/sub after review |
