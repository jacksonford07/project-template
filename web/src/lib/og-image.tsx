/**
 * OpenGraph Image Generation Utilities
 *
 * Reusable components and functions for generating dynamic OG images.
 *
 * @example
 * ```tsx
 * // In app/blog/[slug]/opengraph-image.tsx
 * import { generateOGImage, OGImageTemplate } from '@/lib/og-image';
 *
 * export default async function OGImage({ params }: Props) {
 *   const post = await getPost(params.slug);
 *   return generateOGImage({
 *     title: post.title,
 *     subtitle: post.category,
 *     date: post.publishedAt,
 *   });
 * }
 * ```
 */

import { ImageResponse } from 'next/og';

// Standard OG image dimensions
export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

// ============================================
// OG Image Templates
// ============================================

interface OGImageOptions {
  title: string;
  subtitle?: string;
  date?: string | Date;
  author?: string;
  logo?: boolean;
  theme?: 'dark' | 'light';
}

/**
 * Generate a standard OG image
 */
export async function generateOGImage({
  title,
  subtitle,
  date,
  author,
  logo = true,
  theme = 'dark',
}: OGImageOptions): Promise<ImageResponse> {
  const isDark = theme === 'dark';

  const colors = isDark
    ? {
        bg: '#0f172a',
        bgGradient: '#1e293b',
        text: '#ffffff',
        textMuted: '#94a3b8',
        accent: '#3b82f6',
      }
    : {
        bg: '#ffffff',
        bgGradient: '#f1f5f9',
        text: '#0f172a',
        textMuted: '#64748b',
        accent: '#3b82f6',
      };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
          backgroundColor: colors.bg,
          backgroundImage: `radial-gradient(circle at 25px 25px, ${colors.bgGradient} 2%, transparent 0%)`,
          backgroundSize: '50px 50px',
        }}
      >
        {/* Header: Logo and optional metadata */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'auto',
          }}
        >
          {logo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
          )}

          {(formattedDate || author) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 4,
              }}
            >
              {formattedDate && (
                <div style={{ fontSize: 20, color: colors.textMuted }}>
                  {formattedDate}
                </div>
              )}
              {author && (
                <div style={{ fontSize: 20, color: colors.textMuted }}>
                  by {author}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {subtitle && (
            <div
              style={{
                fontSize: 24,
                color: colors.accent,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
              }}
            >
              {subtitle}
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 60 ? 48 : 64,
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.1,
              maxWidth: '90%',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: colors.accent,
          }}
        />
      </div>
    ),
    OG_IMAGE_SIZE
  );
}

/**
 * Generate a minimal OG image (just title)
 */
export async function generateMinimalOGImage(
  title: string,
  theme: 'dark' | 'light' = 'dark'
): Promise<ImageResponse> {
  const isDark = theme === 'dark';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: title.length > 40 ? 56 : 72,
            fontWeight: 700,
            color: isDark ? '#ffffff' : '#0f172a',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      </div>
    ),
    OG_IMAGE_SIZE
  );
}

/**
 * Generate a gradient OG image
 */
interface GradientOGImageOptions {
  title: string;
  subtitle?: string;
  gradient?: string;
}

export async function generateGradientOGImage({
  title,
  subtitle,
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}: GradientOGImageOptions): Promise<ImageResponse> {
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
          backgroundImage: gradient,
          padding: 80,
        }}
      >
        {subtitle && (
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            {subtitle}
          </div>
        )}
        <div
          style={{
            fontSize: title.length > 40 ? 56 : 72,
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {title}
        </div>
      </div>
    ),
    OG_IMAGE_SIZE
  );
}

// ============================================
// Export Helpers
// ============================================

export const ogImageConfig = {
  size: OG_IMAGE_SIZE,
  contentType: 'image/png' as const,
  runtime: 'edge' as const,
};
