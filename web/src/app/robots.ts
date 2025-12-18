/**
 * Robots.txt Generation
 *
 * Controls search engine crawling behavior.
 * Next.js automatically serves this at /robots.txt
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/metadata';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',        // Don't crawl API routes
          '/admin/',      // Don't crawl admin pages
          '/_next/',      // Don't crawl Next.js internals
          '/private/',    // Don't crawl private pages
        ],
      },
      // Block specific bots if needed
      // {
      //   userAgent: 'BadBot',
      //   disallow: '/',
      // },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
