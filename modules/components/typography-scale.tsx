/**
 * Typography Scale Components
 *
 * Typography showcase with copyable CSS values.
 * Designed for design system documentation pages.
 *
 * Dependencies: toast-system (for copy feedback)
 *
 * @module typography-scale
 * @source iteration4
 */

'use client';

import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface TypeScaleItem {
  name: string;
  size: string;
  weight: string;
  lineHeight: string;
  className: string;
}

interface FontFamily {
  name: string;
  value: string;
  className?: string;
}

// ============================================================================
// ICONS
// ============================================================================

function CopyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface TypographyRowProps {
  item: TypeScaleItem;
  /** Sample text to display */
  sampleText?: string;
  /** Called when CSS is copied */
  onCopy?: (name: string, css: string) => void;
}

export function TypographyRow({
  item,
  sampleText = 'The quick brown fox jumps over the lazy dog',
  onCopy
}: TypographyRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const cssValue = `font-size: ${item.size}; font-weight: ${item.weight}; line-height: ${item.lineHeight};`;
    try {
      await navigator.clipboard.writeText(cssValue);
      setCopied(true);
      onCopy?.(item.name, cssValue);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [item, onCopy]);

  return (
    <div className="flex items-center gap-6 py-4 border-b border-white/5 last:border-0 group">
      <div className="w-32 flex-shrink-0">
        <p className="text-sm font-medium text-white">{item.name}</p>
        <p className="text-xs text-zinc-500">{item.size}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${item.className} text-white truncate`}>
          {sampleText}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-white/5"
      >
        {copied ? (
          <CheckIcon className="w-4 h-4 text-emerald-400" />
        ) : (
          <CopyIcon className="w-4 h-4 text-zinc-400" />
        )}
      </button>
    </div>
  );
}

interface FontFamilyCardProps {
  fonts: FontFamily[];
}

export function FontFamilyCard({ fonts }: FontFamilyCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fonts.map((font) => (
        <div key={font.name} className="p-4 bg-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-400 mb-1">{font.name}</p>
          <p className={`text-white font-medium ${font.className || ''}`}>{font.value}</p>
        </div>
      ))}
    </div>
  );
}

interface TypographyScaleProps {
  scale: TypeScaleItem[];
  fonts?: FontFamily[];
  /** Called when any CSS is copied */
  onCopy?: (name: string, css: string) => void;
  /** Sample text for preview */
  sampleText?: string;
}

export function TypographyScale({
  scale,
  fonts,
  onCopy,
  sampleText
}: TypographyScaleProps) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
      {fonts && fonts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Font Families</h3>
          <FontFamilyCard fonts={fonts} />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Type Scale</h3>
        <div>
          {scale.map((item) => (
            <TypographyRow
              key={item.name}
              item={item}
              sampleText={sampleText}
              onCopy={onCopy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRESET SCALE
// ============================================================================

export const defaultTypeScale: TypeScaleItem[] = [
  { name: 'Display', size: '4.5rem', weight: '700', lineHeight: '1', className: 'text-7xl font-bold' },
  { name: 'H1', size: '3rem', weight: '700', lineHeight: '1.1', className: 'text-5xl font-bold' },
  { name: 'H2', size: '2.25rem', weight: '600', lineHeight: '1.2', className: 'text-4xl font-semibold' },
  { name: 'H3', size: '1.875rem', weight: '600', lineHeight: '1.3', className: 'text-3xl font-semibold' },
  { name: 'H4', size: '1.5rem', weight: '600', lineHeight: '1.4', className: 'text-2xl font-semibold' },
  { name: 'H5', size: '1.25rem', weight: '500', lineHeight: '1.5', className: 'text-xl font-medium' },
  { name: 'Body Large', size: '1.125rem', weight: '400', lineHeight: '1.6', className: 'text-lg' },
  { name: 'Body', size: '1rem', weight: '400', lineHeight: '1.6', className: 'text-base' },
  { name: 'Body Small', size: '0.875rem', weight: '400', lineHeight: '1.5', className: 'text-sm' },
  { name: 'Caption', size: '0.75rem', weight: '400', lineHeight: '1.4', className: 'text-xs' },
];

export const defaultFonts: FontFamily[] = [
  { name: 'Sans Serif', value: 'Inter, system-ui, sans-serif', className: 'font-sans' },
  { name: 'Monospace', value: 'JetBrains Mono, monospace', className: 'font-mono' },
];

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
import {
  TypographyScale,
  defaultTypeScale,
  defaultFonts
} from '@/modules/components/typography-scale';
import { useToast } from '@/modules/patterns/toast-system';

function DesignSystemPage() {
  const { showToast } = useToast();

  return (
    <TypographyScale
      scale={defaultTypeScale}
      fonts={defaultFonts}
      onCopy={(name, css) => showToast(`Copied ${name} styles`, 'success')}
    />
  );
}
*/
