# Migration Guide

This guide covers how to customize this template for your project, including renaming, adding features, and common customization patterns.

## Table of Contents

1. [Quick Start: Renaming Your Project](#quick-start-renaming-your-project)
2. [Environment Setup](#environment-setup)
3. [Database Customization](#database-customization)
4. [Authentication Setup](#authentication-setup)
5. [Adding New Features](#adding-new-features)
6. [Common Customization Patterns](#common-customization-patterns)
7. [Deployment Checklist](#deployment-checklist)

---

## Quick Start: Renaming Your Project

### Option 1: Use the Setup Script (Recommended)

```bash
./scripts/setup.sh new
```

This automatically:
- Creates a new directory with your project name
- Updates `package.json` with the new name
- Initializes a fresh Git repository
- Optionally creates a GitHub repo and links to Vercel

### Option 2: Manual Renaming

1. **Update package.json**
   ```bash
   cd web
   # Edit the "name" field
   sed -i '' 's/"name": "web"/"name": "your-project-name"/' package.json
   ```

2. **Update project references**
   ```bash
   # Search for any hardcoded references
   grep -r "project template" --include="*.md" --include="*.json"
   ```

3. **Reinitialize Git** (if starting fresh)
   ```bash
   rm -rf .git
   git init
   git add .
   git commit -m "feat: initial commit from template"
   ```

4. **Update CLAUDE.md and README**
   - Update project name and description
   - Customize tech stack section if adding/removing dependencies
   - Update deployment URLs

---

## Environment Setup

### 1. Copy Environment Template

```bash
cd web
cp .env.example .env
```

### 2. Generate Secure Values

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate database password
openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32
```

### 3. Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Auth encryption key | `(generated)` |
| `NEXTAUTH_URL` | Your app URL | `http://localhost:3000` |

### 4. Database Setup

```bash
# Create database (if using local PostgreSQL)
createdb your_project_name

# Run migrations
pnpm prisma migrate dev

# Seed initial data (optional)
pnpm db:seed
```

---

## Database Customization

### Adding a New Model

1. **Edit `prisma/schema.prisma`**
   ```prisma
   model Product {
     id          String    @id @default(cuid())
     name        String
     description String?
     price       Decimal   @db.Decimal(10, 2)

     // Always include these
     createdAt   DateTime  @default(now())
     updatedAt   DateTime  @updatedAt
     deletedAt   DateTime? // Soft delete

     // Relations
     categoryId  String
     category    Category  @relation(fields: [categoryId], references: [id])
   }
   ```

2. **Create migration**
   ```bash
   pnpm prisma migrate dev --name add_product_model
   ```

3. **Generate client**
   ```bash
   pnpm prisma generate
   ```

### Modifying Existing Models

```bash
# Edit schema.prisma, then:
pnpm prisma migrate dev --name describe_your_change
```

### Common Schema Patterns

**Soft Delete Query Helper**
```typescript
// lib/prisma-helpers.ts
export const notDeleted = { deletedAt: null };

// Usage
const users = await prisma.user.findMany({
  where: notDeleted
});
```

**Pagination**
```typescript
export async function paginate<T>(
  model: any,
  page: number = 1,
  limit: number = 10,
  where: object = {}
) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    model.findMany({ where, skip, take: limit }),
    model.count({ where }),
  ]);
  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
```

---

## Authentication Setup

### Adding OAuth Providers

1. **Get credentials from provider**
   - Google: https://console.cloud.google.com/
   - GitHub: https://github.com/settings/developers

2. **Add to `.env`**
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. **Update `lib/auth.ts`**
   ```typescript
   import Google from "next-auth/providers/google";

   export const { handlers, signIn, signOut, auth } = NextAuth({
     providers: [
       Google({
         clientId: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
       }),
     ],
     // ...
   });
   ```

### Adding Custom Credentials Auth

```typescript
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/password";

Credentials({
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user || !await verifyPassword(credentials.password, user.passwordHash)) {
      return null;
    }

    return { id: user.id, email: user.email, name: user.name };
  },
}),
```

---

## Adding New Features

### Adding a New API Route

1. **Create route file**
   ```bash
   mkdir -p src/app/api/internal/products
   touch src/app/api/internal/products/route.ts
   ```

2. **Implement handler**
   ```typescript
   // src/app/api/internal/products/route.ts
   import { NextResponse } from 'next/server';
   import { prisma } from '@/lib/prisma';
   import { logger } from '@/lib/logger';
   import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

   export const GET = withRateLimit(async (request) => {
     try {
       const products = await prisma.product.findMany({
         where: { deletedAt: null },
         orderBy: { createdAt: 'desc' },
       });

       return NextResponse.json(products);
     } catch (error) {
       logger.error('Products', 'Failed to fetch products', error);
       return NextResponse.json(
         { error: 'Failed to fetch products' },
         { status: 500 }
       );
     }
   }, RATE_LIMITS.standard);
   ```

### Adding a New Page

1. **Create page file**
   ```bash
   mkdir -p src/app/products
   touch src/app/products/page.tsx
   ```

2. **Implement page**
   ```typescript
   // src/app/products/page.tsx
   import { prisma } from '@/lib/prisma';

   export default async function ProductsPage() {
     const products = await prisma.product.findMany({
       where: { deletedAt: null },
     });

     return (
       <main className="container mx-auto p-4">
         <h1 className="text-2xl font-bold mb-4">Products</h1>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {products.map((product) => (
             <ProductCard key={product.id} product={product} />
           ))}
         </div>
       </main>
     );
   }
   ```

### Adding a New Component

1. **Check existing components first**
   ```bash
   ls src/components/ui/
   ```

2. **Create if needed**
   ```bash
   touch src/components/ui/product-card.tsx
   ```

3. **Follow the pattern**
   ```typescript
   // src/components/ui/product-card.tsx
   interface ProductCardProps {
     product: {
       id: string;
       name: string;
       price: number;
     };
   }

   export function ProductCard({ product }: ProductCardProps) {
     return (
       <div className="border rounded-lg p-4">
         <h3 className="font-semibold">{product.name}</h3>
         <p className="text-gray-600">${product.price}</p>
       </div>
     );
   }
   ```

---

## Common Customization Patterns

### Changing the Color Scheme

Update `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        // ... your brand colors
        900: '#0c4a6e',
      },
    },
  },
},
```

### Adding a Global Layout Element

Edit `src/app/layout.tsx`:
```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
        <Toaster /> {/* For toast notifications */}
      </body>
    </html>
  );
}
```

### Adding Middleware

Create `src/middleware.ts`:
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Adding a Custom Hook

```typescript
// src/hooks/use-products.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/internal/products',
    fetcher
  );

  return {
    products: data ?? [],
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
```

---

## Deployment Checklist

### Before First Deploy

- [ ] Update `LICENSE` with your name/organization
- [ ] Update `README.md` with project description
- [ ] Remove or update example code
- [ ] Set all environment variables in Vercel dashboard
- [ ] Configure custom domain (if applicable)
- [ ] Set up database (Vercel Postgres, Supabase, etc.)
- [ ] Run `pnpm prisma migrate deploy` on production

### Environment Variables for Vercel

```bash
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-domain.vercel.app

# Optional (based on features used)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Post-Deploy

- [ ] Verify authentication works
- [ ] Test database connections
- [ ] Check security headers (https://securityheaders.com)
- [ ] Set up monitoring (Vercel Analytics, Sentry, etc.)
- [ ] Configure Dependabot for dependency updates

---

## Troubleshooting

### Common Issues

**Prisma Client not found**
```bash
pnpm prisma generate
```

**Database connection failed**
- Check `DATABASE_URL` format
- Ensure database exists and is accessible
- Check firewall/network settings

**Build fails on Vercel**
- Check all env vars are set
- Run `pnpm build` locally first
- Check Vercel build logs

**Type errors after schema change**
```bash
pnpm prisma generate
pnpm type-check
```

### Getting Help

1. Check existing issues in the template repo
2. Search error messages in Next.js/Prisma docs
3. Open an issue with reproduction steps
