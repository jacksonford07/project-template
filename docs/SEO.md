# SEO & Metadata Guide

This guide covers metadata management, OpenGraph images, structured data, and sitemaps.

## Table of Contents

1. [Site Configuration](#site-configuration)
2. [Page Metadata](#page-metadata)
3. [Dynamic Metadata](#dynamic-metadata)
4. [OpenGraph Images](#opengraph-images)
5. [Structured Data](#structured-data)
6. [Sitemap & Robots](#sitemap--robots)

---

## Site Configuration

Update `src/lib/metadata.ts` with your site details:

```typescript
export const siteConfig = {
  name: 'My App',
  description: 'A modern web application',
  url: 'https://myapp.com',
  ogImage: '/og-image.png',
  creator: '@myhandle',
  keywords: ['nextjs', 'react'],
  authors: [{ name: 'Your Name' }],
};
```

Also set the environment variable:
```bash
NEXT_PUBLIC_APP_URL=https://myapp.com
```

---

## Page Metadata

### Static Metadata

For pages with fixed metadata:

```tsx
// app/about/page.tsx
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'About Us',
  description: 'Learn more about our company',
  path: '/about',
});

export default function AboutPage() {
  return <div>...</div>;
}
```

### Using Title Templates

The root layout defines a title template:

```tsx
// Root layout sets:
title: {
  default: 'My App',
  template: '%s | My App',
}

// Page sets:
export const metadata = { title: 'About Us' };

// Result: "About Us | My App"
```

### Available Options

```tsx
generatePageMetadata({
  title: 'Page Title',           // Required
  description: 'Description',    // Optional, defaults to siteConfig
  path: '/page-path',           // For canonical URL
  image: '/custom-og.png',      // Custom OG image
  noIndex: false,               // Block from search engines
  keywords: ['extra', 'keys'],  // Additional keywords
});
```

---

## Dynamic Metadata

For pages with dynamic content (blog posts, products, etc.):

```tsx
// app/blog/[slug]/page.tsx
import { generateDynamicMetadata } from '@/lib/metadata';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  return generateDynamicMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${params.slug}`,
    image: post.coverImage,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [post.author.name],
    tags: post.tags,
  });
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);
  return <article>...</article>;
}
```

---

## OpenGraph Images

### Default Site Image

The template includes a default OG image at `app/opengraph-image.tsx`. This generates an image served at `/opengraph-image`.

To customize, edit the file or replace with a static image at `public/og-image.png`.

### Dynamic OG Images

For pages with unique OG images (blog posts, products):

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { generateOGImage, ogImageConfig } from '@/lib/og-image';

export const { size, contentType, runtime } = ogImageConfig;

interface Props {
  params: { slug: string };
}

export default async function OGImage({ params }: Props) {
  const post = await getPost(params.slug);

  return generateOGImage({
    title: post.title,
    subtitle: post.category,
    date: post.publishedAt,
    author: post.author.name,
  });
}
```

### OG Image Templates

Several templates are available:

```tsx
// Standard with logo and metadata
generateOGImage({
  title: 'Post Title',
  subtitle: 'Category',
  date: new Date(),
  author: 'Author Name',
  theme: 'dark',  // or 'light'
});

// Minimal (just title)
generateMinimalOGImage('Page Title', 'dark');

// Gradient background
generateGradientOGImage({
  title: 'Page Title',
  subtitle: 'Subtitle',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
});
```

### Static OG Images

For static pages, you can use image files:

```
app/
├── about/
│   ├── page.tsx
│   └── opengraph-image.png  # Static image for /about
```

---

## Structured Data

### Organization & Website

Added automatically in root layout:

```tsx
// app/layout.tsx
<JsonLd data={generateOrganizationSchema()} />
<JsonLd data={generateWebsiteSchema()} />
```

### Article Schema

For blog posts:

```tsx
import { JsonLd, generateArticleSchema } from '@/lib/metadata';

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);

  return (
    <>
      <JsonLd
        data={generateArticleSchema({
          title: post.title,
          description: post.excerpt,
          url: `https://myapp.com/blog/${params.slug}`,
          image: post.coverImage,
          publishedTime: post.publishedAt,
          modifiedTime: post.updatedAt,
          authorName: post.author.name,
          authorUrl: post.author.url,
        })}
      />
      <article>...</article>
    </>
  );
}
```

### Product Schema

For e-commerce:

```tsx
import { JsonLd, generateProductSchema } from '@/lib/metadata';

<JsonLd
  data={generateProductSchema({
    name: 'Product Name',
    description: 'Product description',
    url: 'https://myapp.com/products/123',
    image: '/product.jpg',
    price: 99.99,
    currency: 'USD',
    availability: 'InStock',
    rating: { value: 4.5, count: 127 },
  })}
/>
```

### Breadcrumb Schema

For navigation structure:

```tsx
import { JsonLd, generateBreadcrumbSchema } from '@/lib/metadata';

<JsonLd
  data={generateBreadcrumbSchema([
    { name: 'Home', url: 'https://myapp.com' },
    { name: 'Blog', url: 'https://myapp.com/blog' },
    { name: 'Post Title', url: 'https://myapp.com/blog/post-slug' },
  ])}
/>
```

### FAQ Schema

For FAQ pages:

```tsx
import { JsonLd, generateFAQSchema } from '@/lib/metadata';

<JsonLd
  data={generateFAQSchema([
    {
      question: 'How do I sign up?',
      answer: 'Click the Sign Up button...',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Visa, Mastercard...',
    },
  ])}
/>
```

---

## Sitemap & Robots

### Sitemap

Edit `app/sitemap.ts` to include your pages:

```typescript
// Static sitemap
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://myapp.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Add more pages...
  ];
}
```

### Dynamic Sitemap

For sites with database content:

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1 },
    { url: `${baseUrl}/about`, priority: 0.8 },
  ];

  // Dynamic pages from database
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const postPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...postPages];
}
```

### Robots.txt

Edit `app/robots.ts` to control crawling:

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
    ],
    sitemap: 'https://myapp.com/sitemap.xml',
  };
}
```

---

## Verification

### Test OpenGraph

Use these tools to preview how your pages appear when shared:

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Test Structured Data

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

### Test Sitemap

Visit `/sitemap.xml` in your browser to verify it's generated correctly.

---

## Checklist

Before launch:

- [ ] Update `siteConfig` in `lib/metadata.ts`
- [ ] Set `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Add favicon and apple-touch-icon to `/public`
- [ ] Customize default OG image
- [ ] Add structured data to key pages
- [ ] Update sitemap with all pages
- [ ] Test with social sharing debuggers
- [ ] Submit sitemap to Google Search Console
