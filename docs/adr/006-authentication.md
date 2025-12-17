# ADR-006: NextAuth v5 for Authentication

## Status

Accepted

## Context

The application needs:
- User authentication (login/logout)
- Session management
- OAuth provider support (Google, GitHub, etc.)
- Secure credential handling
- Database session storage
- TypeScript support

## Decision

Use NextAuth.js v5 (Auth.js) with Prisma adapter for session storage.

## Consequences

### Positive

- **Built for Next.js**: First-class App Router support
- **OAuth made easy**: Pre-built providers for major services
- **Secure by default**: CSRF protection, secure cookies
- **Prisma integration**: Sessions stored in database
- **TypeScript support**: Full type safety
- **Middleware support**: Protect routes easily
- **Active community**: Well-maintained, good documentation

### Negative

- **v5 is beta**: Some features still stabilizing
- **Breaking changes**: Migration from v4 required changes
- **Complexity**: Many configuration options
- **Provider limitations**: Some OAuth quirks per provider

### Neutral

- Learning curve for NextAuth patterns
- Configuration can be verbose

## Implementation

### Basic Setup

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

### Route Handler

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

### Protected Route

```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

### Middleware Protection

```typescript
// middleware.ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/login", req.url));
  }
});
```

## Alternatives Considered

### Clerk

Managed authentication service. Rejected because:
- External dependency
- Costs money at scale
- Less control over data

### Lucia Auth

Lightweight auth library. Rejected because:
- Less mature than NextAuth
- Fewer OAuth providers
- More manual setup required

### Custom JWT Implementation

Build auth from scratch. Rejected because:
- Security risks
- Significant development time
- OAuth implementation complex

### Supabase Auth

Part of Supabase stack. Rejected because:
- Ties to Supabase ecosystem
- Overkill if just need auth
- Less flexible than NextAuth

## References

- [NextAuth.js v5 Docs](https://authjs.dev/)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [NextAuth Security](https://authjs.dev/concepts/security)
