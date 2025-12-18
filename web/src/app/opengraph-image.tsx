/**
 * Default OpenGraph Image
 *
 * This file generates the default OG image for the site.
 * Next.js automatically serves this at /opengraph-image
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */

import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/metadata';

// Image dimensions (recommended for social sharing)
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Optionally configure runtime and revalidation
export const runtime = 'edge';

export default async function OGImage(): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 24,
            backgroundColor: '#3b82f6',
            marginBottom: 40,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Site Name */}
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          {siteConfig.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#94a3b8',
            maxWidth: 800,
            textAlign: 'center',
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
