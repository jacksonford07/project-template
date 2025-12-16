/**
 * Color Palette Components
 *
 * Interactive color swatches with click-to-copy functionality.
 * Designed for design system documentation pages.
 *
 * Dependencies: toast-system (for copy feedback)
 *
 * @module color-palette
 * @source iteration4
 */

'use client';

import { useState, useCallback } from 'react';
// Import from your toast system location:
// import { useToast } from '@/modules/patterns/toast-system';

// ============================================================================
// TYPES
// ============================================================================

interface ColorShade {
  name: string;
  value: string;
}

interface ColorPaletteData {
  name: string;
  description: string;
  shades: ColorShade[];
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

interface ColorSwatchProps {
  shade: ColorShade;
  /** Called when color is copied. Use with toast system. */
  onCopy?: (value: string) => void;
}

export function ColorSwatch({ shade, onCopy }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shade.value);
      setCopied(true);
      onCopy?.(shade.value);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shade.value, onCopy]);

  const isLight = ['50', '100', '200', '300'].includes(shade.name);

  return (
    <button
      onClick={handleCopy}
      className="group relative flex-1 min-w-0"
    >
      <div
        className="h-16 rounded-lg transition-transform group-hover:scale-105 group-hover:shadow-lg flex items-end justify-between p-2"
        style={{ backgroundColor: shade.value }}
      >
        <span className={`text-xs font-medium ${isLight ? 'text-zinc-700' : 'text-white/90'}`}>
          {shade.name}
        </span>
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isLight ? 'text-zinc-700' : 'text-white'}`}>
          {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-zinc-500 font-mono text-center">{shade.value}</p>
    </button>
  );
}

interface ColorPaletteCardProps {
  palette: ColorPaletteData;
  /** Called when any color is copied */
  onCopy?: (value: string) => void;
}

export function ColorPaletteCard({ palette, onCopy }: ColorPaletteCardProps) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{palette.name}</h3>
        <p className="text-sm text-zinc-500">{palette.description}</p>
      </div>
      <div className="flex gap-2">
        {palette.shades.map((shade) => (
          <ColorSwatch key={shade.name} shade={shade} onCopy={onCopy} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// PRESET PALETTES
// ============================================================================

export const presetPalettes: Record<string, ColorPaletteData> = {
  primary: {
    name: 'Primary',
    description: 'Main brand color for primary actions and key UI elements',
    shades: [
      { name: '50', value: '#eef2ff' },
      { name: '100', value: '#e0e7ff' },
      { name: '200', value: '#c7d2fe' },
      { name: '300', value: '#a5b4fc' },
      { name: '400', value: '#818cf8' },
      { name: '500', value: '#6366f1' },
      { name: '600', value: '#4f46e5' },
      { name: '700', value: '#4338ca' },
      { name: '800', value: '#3730a3' },
      { name: '900', value: '#312e81' },
    ],
  },
  neutral: {
    name: 'Neutral',
    description: 'Gray scale for text, backgrounds, and borders',
    shades: [
      { name: '50', value: '#fafafa' },
      { name: '100', value: '#f4f4f5' },
      { name: '200', value: '#e4e4e7' },
      { name: '300', value: '#d4d4d8' },
      { name: '400', value: '#a1a1aa' },
      { name: '500', value: '#71717a' },
      { name: '600', value: '#52525b' },
      { name: '700', value: '#3f3f46' },
      { name: '800', value: '#27272a' },
      { name: '900', value: '#18181b' },
    ],
  },
  success: {
    name: 'Success',
    description: 'Positive actions, confirmations, and success states',
    shades: [
      { name: '50', value: '#ecfdf5' },
      { name: '100', value: '#d1fae5' },
      { name: '200', value: '#a7f3d0' },
      { name: '300', value: '#6ee7b7' },
      { name: '400', value: '#34d399' },
      { name: '500', value: '#10b981' },
      { name: '600', value: '#059669' },
      { name: '700', value: '#047857' },
      { name: '800', value: '#065f46' },
      { name: '900', value: '#064e3b' },
    ],
  },
  warning: {
    name: 'Warning',
    description: 'Warnings, alerts, and attention-required states',
    shades: [
      { name: '50', value: '#fffbeb' },
      { name: '100', value: '#fef3c7' },
      { name: '200', value: '#fde68a' },
      { name: '300', value: '#fcd34d' },
      { name: '400', value: '#fbbf24' },
      { name: '500', value: '#f59e0b' },
      { name: '600', value: '#d97706' },
      { name: '700', value: '#b45309' },
      { name: '800', value: '#92400e' },
      { name: '900', value: '#78350f' },
    ],
  },
  danger: {
    name: 'Danger',
    description: 'Errors, destructive actions, and critical states',
    shades: [
      { name: '50', value: '#fef2f2' },
      { name: '100', value: '#fee2e2' },
      { name: '200', value: '#fecaca' },
      { name: '300', value: '#fca5a5' },
      { name: '400', value: '#f87171' },
      { name: '500', value: '#ef4444' },
      { name: '600', value: '#dc2626' },
      { name: '700', value: '#b91c1c' },
      { name: '800', value: '#991b1b' },
      { name: '900', value: '#7f1d1d' },
    ],
  },
};

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
import { ColorPaletteCard, presetPalettes } from '@/modules/components/color-palette';
import { useToast } from '@/modules/patterns/toast-system';

function DesignSystemPage() {
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      {Object.entries(presetPalettes).map(([key, palette]) => (
        <ColorPaletteCard
          key={key}
          palette={palette}
          onCopy={(value) => showToast(`Copied ${value}`, 'success')}
        />
      ))}
    </div>
  );
}
*/
