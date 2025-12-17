# ADR-001: Use Next.js 15 App Router

## Status

Accepted

## Context

We need a React framework that provides:
- Server-side rendering for SEO and performance
- File-based routing for developer experience
- API routes for backend functionality
- Modern React features (Server Components, Suspense)
- Strong TypeScript support
- Active maintenance and community

## Decision

Use Next.js 15 with the App Router (not Pages Router).

## Consequences

### Positive

- **Server Components by default**: Better performance, smaller client bundles
- **Streaming and Suspense**: Improved loading states and user experience
- **Simplified data fetching**: No more getServerSideProps/getStaticProps
- **Nested layouts**: Share UI between routes efficiently
- **Route groups**: Organize routes without affecting URL structure
- **Parallel routes**: Render multiple pages simultaneously
- **Strong Vercel integration**: Easy deployment and preview environments

### Negative

- **Learning curve**: App Router patterns differ from Pages Router
- **Ecosystem catching up**: Some libraries still adapting to Server Components
- **Caching complexity**: New caching semantics can be confusing
- **Beta features**: Some features still maturing

### Neutral

- Migration path exists from Pages Router if needed
- Can use both routers during transition

## Alternatives Considered

### Pages Router (Next.js)

The older, more stable routing system. Rejected because:
- Server Components not fully supported
- Will eventually be deprecated
- Missing newer features (streaming, parallel routes)

### Remix

Full-stack React framework with great DX. Rejected because:
- Smaller ecosystem than Next.js
- Less Vercel integration (though improving)
- Team more familiar with Next.js

### Vite + React Router

Lightweight SPA approach. Rejected because:
- No built-in SSR
- More configuration required
- No API routes out of the box

## References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
