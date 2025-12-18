# Performance Guide

This guide covers performance monitoring, optimization patterns, and budgets for this project.

## Table of Contents

1. [Core Web Vitals](#core-web-vitals)
2. [Performance Budgets](#performance-budgets)
3. [Lighthouse CI](#lighthouse-ci)
4. [Bundle Analysis](#bundle-analysis)
5. [Caching Strategy](#caching-strategy)
6. [Optimization Patterns](#optimization-patterns)

---

## Core Web Vitals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4s | > 4s |
| **FID** (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | < 1.8s | 1.8s - 3s | > 3s |
| **TTFB** (Time to First Byte) | < 800ms | 800ms - 1.8s | > 1.8s |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms |

---

## Performance Budgets

Defined in `lighthouserc.json`:

```json
{
  "assertions": {
    "categories:performance": ["warn", { "minScore": 0.8 }],
    "first-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
    "largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
    "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }],
    "total-blocking-time": ["warn", { "maxNumericValue": 300 }],
    "interactive": ["warn", { "maxNumericValue": 3500 }]
  }
}
```

### Bundle Size Budgets

| Resource Type | Budget |
|--------------|--------|
| JavaScript (initial) | < 200KB gzipped |
| CSS | < 50KB gzipped |
| Images (per image) | < 200KB |
| Fonts | < 100KB total |
| Third-party scripts | < 100KB |

---

## Lighthouse CI

Lighthouse CI runs automatically on PRs via `.github/workflows/lighthouse.yml`.

### Local Testing

```bash
# Install Lighthouse
npm install -g @lhci/cli

# Run local audit
lhci autorun --config=./web/lighthouserc.json

# Or use npx
npx lighthouse http://localhost:3000 --view
```

### Understanding Scores

| Score | Rating |
|-------|--------|
| 90-100 | Good (green) |
| 50-89 | Needs Improvement (orange) |
| 0-49 | Poor (red) |

---

## Bundle Analysis

### Built-in Next.js Analysis

```bash
# Enable in next.config.ts
ANALYZE=true pnpm build
```

Add to `next.config.ts`:

```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

### What to Look For

1. **Large dependencies** - Consider alternatives or tree-shaking
2. **Duplicate packages** - Check for multiple versions
3. **Unused exports** - Enable `sideEffects: false` in package.json
4. **Dynamic imports** - Split code for routes

---

## Caching Strategy

### HTTP Caching Headers

```typescript
// In API routes or middleware
return new Response(data, {
  headers: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
});
```

### Caching Strategies by Content Type

| Content | Strategy | Cache-Control |
|---------|----------|---------------|
| Static assets | Immutable | `public, max-age=31536000, immutable` |
| API responses | Stale-while-revalidate | `public, max-age=60, stale-while-revalidate=600` |
| HTML pages | No-store or short | `no-store` or `max-age=60` |
| User data | Private | `private, no-cache` |

### Redis Caching (Optional)

> **Note**: Redis is not included by default. Install it if needed:
> ```bash
> pnpm add ioredis
> pnpm add -D @types/ioredis
> ```

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheSet(
  key: string,
  data: unknown,
  ttlSeconds = 3600
): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
}

// Usage
const cached = await cacheGet<User>(`user:${id}`);
if (cached) return cached;

const user = await fetchUser(id);
await cacheSet(`user:${id}`, user, 3600);
return user;
```

---

## Optimization Patterns

### Image Optimization

```tsx
import Image from 'next/image';

// GOOD: Optimized image
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For LCP images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// For external images, configure in next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'example.com' }
  ]
}
```

### Code Splitting

```tsx
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false, // If not needed on server
});
```

### Font Optimization

```tsx
// app/layout.tsx - already optimized
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

### Preloading Critical Resources

```tsx
// In head or layout
<link rel="preload" href="/fonts/custom.woff2" as="font" crossOrigin="" />
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />
```

### Lazy Loading

```tsx
// Intersection Observer pattern
'use client';
import { useEffect, useRef, useState } from 'react';

function useLazyLoad<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Usage
function LazyComponent() {
  const { ref, isVisible } = useLazyLoad<HTMLDivElement>();

  return (
    <div ref={ref}>
      {isVisible ? <ExpensiveComponent /> : <Skeleton />}
    </div>
  );
}
```

### Debouncing & Throttling

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in search
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    search(debouncedQuery);
  }
}, [debouncedQuery]);
```

---

## Monitoring

### Real User Monitoring (RUM)

```typescript
// lib/analytics.ts
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
}) {
  // Send to analytics
  console.log(metric);

  // Example: Send to analytics service
  // analytics.track('Web Vitals', {
  //   metric_id: metric.id,
  //   metric_name: metric.name,
  //   metric_value: metric.value,
  // });
}

// app/layout.tsx
export { reportWebVitals } from '@/lib/analytics';
```

### Performance Testing Commands

```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --output html --view

# Bundle analysis
ANALYZE=true pnpm build

# Check bundle size
npx bundlesize

# Speed test
npx speedcli http://localhost:3000
```
