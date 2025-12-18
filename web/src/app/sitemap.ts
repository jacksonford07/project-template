/**
 * Sitemap Generation
 *
 * Generates sitemap.xml for search engine discoverability.
 * Next.js automatically serves this at /sitemap.xml
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/metadata';

/**
 * Static sitemap
 *
 * For dynamic content, fetch data from your database here.
 *
 * @example Dynamic sitemap with blog posts:
 * ```ts
 * export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 *   const baseUrl = siteConfig.url;
 *
 *   // Fetch dynamic content
 *   const posts = await prisma.post.findMany({
 *     where: { published: true },
 *     select: { slug: true, updatedAt: true },
 *   });
 *
 *   const postUrls = posts.map((post) => ({
 *     url: `${baseUrl}/blog/${post.slug}`,
 *     lastModified: post.updatedAt,
 *     changeFrequency: 'weekly' as const,
 *     priority: 0.7,
 *   }));
 *
 *   return [
 *     ...staticPages,
 *     ...postUrls,
 *   ];
 * }
 * ```
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Add more static pages here
  ];

  return staticPages;
}

/**
 * For large sites, split into multiple sitemaps
 *
 * @example
 * ```ts
 * // app/sitemap/[id]/route.ts
 * export async function GET(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   const id = parseInt(params.id);
 *   const pageSize = 1000;
 *   const skip = id * pageSize;
 *
 *   const posts = await prisma.post.findMany({
 *     skip,
 *     take: pageSize,
 *     select: { slug: true, updatedAt: true },
 *   });
 *
 *   const xml = generateSitemapXml(posts);
 *   return new Response(xml, {
 *     headers: { 'Content-Type': 'application/xml' },
 *   });
 * }
 * ```
 */
