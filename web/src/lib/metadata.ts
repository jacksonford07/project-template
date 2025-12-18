/**
 * Metadata Utilities
 *
 * Helpers for generating SEO metadata, OpenGraph tags, and structured data.
 * Uses Next.js 15 Metadata API.
 *
 * @example
 * ```tsx
 * // In a page
 * import { generatePageMetadata } from '@/lib/metadata';
 *
 * export const metadata = generatePageMetadata({
 *   title: 'About Us',
 *   description: 'Learn more about our company',
 *   path: '/about',
 * });
 * ```
 */

import type { Metadata } from 'next';

// ============================================
// Configuration
// ============================================

/**
 * Site-wide metadata configuration
 * Update these values for your project
 */
export const siteConfig = {
  name: 'My App',
  description: 'A modern web application built with Next.js',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://example.com',
  ogImage: '/og-image.png',
  creator: '@yourhandle',
  keywords: ['nextjs', 'react', 'typescript'],
  authors: [{ name: 'Your Name', url: 'https://yoursite.com' }],
} as const;

// ============================================
// Metadata Generators
// ============================================

interface PageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Generate metadata for a page
 *
 * @example
 * ```tsx
 * // Static metadata
 * export const metadata = generatePageMetadata({
 *   title: 'Dashboard',
 *   description: 'View your dashboard',
 *   path: '/dashboard',
 * });
 * ```
 */
export function generatePageMetadata({
  title,
  description = siteConfig.description,
  path = '',
  image = siteConfig.ogImage,
  noIndex = false,
  keywords = [],
}: PageMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`;

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: siteConfig.creator,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/**
 * Generate metadata for a dynamic page
 *
 * @example
 * ```tsx
 * // In app/blog/[slug]/page.tsx
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   const post = await getPost(params.slug);
 *   return generateDynamicMetadata({
 *     title: post.title,
 *     description: post.excerpt,
 *     path: `/blog/${params.slug}`,
 *     image: post.coverImage,
 *     publishedTime: post.publishedAt,
 *     authors: [post.author.name],
 *   });
 * }
 * ```
 */
interface DynamicMetadataOptions extends PageMetadataOptions {
  type?: 'article' | 'website';
  publishedTime?: string | Date;
  modifiedTime?: string | Date;
  authors?: string[];
  tags?: string[];
}

export function generateDynamicMetadata({
  title,
  description = siteConfig.description,
  path = '',
  image = siteConfig.ogImage,
  noIndex = false,
  keywords = [],
  type = 'article',
  publishedTime,
  modifiedTime,
  authors = [],
  tags = [],
}: DynamicMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`;

  const metadata: Metadata = {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords, ...tags],
    authors: authors.length > 0
      ? authors.map((name) => ({ name }))
      : siteConfig.authors,
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: 'en_US',
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime: publishedTime
          ? new Date(publishedTime).toISOString()
          : undefined,
        modifiedTime: modifiedTime
          ? new Date(modifiedTime).toISOString()
          : undefined,
        authors: authors.length > 0 ? authors : undefined,
        tags: tags.length > 0 ? tags : undefined,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: siteConfig.creator,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };

  return metadata;
}

// ============================================
// Structured Data (JSON-LD)
// ============================================

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      // Add your social media URLs
      // 'https://twitter.com/yourhandle',
      // 'https://github.com/yourorg',
    ],
  };
}

/**
 * Generate WebSite structured data (for sitelinks search)
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Article structured data
 */
interface ArticleSchemaOptions {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedTime: string | Date;
  modifiedTime?: string | Date;
  authorName: string;
  authorUrl?: string;
}

export function generateArticleSchema({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  authorName,
  authorUrl,
}: ArticleSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
    },
    datePublished: new Date(publishedTime).toISOString(),
    dateModified: modifiedTime
      ? new Date(modifiedTime).toISOString()
      : new Date(publishedTime).toISOString(),
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * Generate Product structured data
 */
interface ProductSchemaOptions {
  name: string;
  description: string;
  url: string;
  image: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: {
    value: number;
    count: number;
  };
}

export function generateProductSchema({
  name,
  description,
  url,
  image,
  price,
  currency = 'USD',
  availability = 'InStock',
  rating,
}: ProductSchemaOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url,
    image,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
    },
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value,
        reviewCount: rating.count,
      },
    }),
  };
}

/**
 * Generate BreadcrumbList structured data
 */
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// ============================================
// JSON-LD Component Helper
// ============================================

/**
 * Render JSON-LD structured data
 *
 * @example
 * ```tsx
 * import { JsonLd, generateArticleSchema } from '@/lib/metadata';
 *
 * export default function BlogPost({ post }) {
 *   const schema = generateArticleSchema({
 *     title: post.title,
 *     description: post.excerpt,
 *     url: `https://example.com/blog/${post.slug}`,
 *     image: post.coverImage,
 *     publishedTime: post.publishedAt,
 *     authorName: post.author.name,
 *   });
 *
 *   return (
 *     <>
 *       <JsonLd data={schema} />
 *       <article>...</article>
 *     </>
 *   );
 * }
 * ```
 */
interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
