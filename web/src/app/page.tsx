'use client';

import { useState } from 'react';

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  gradient: string;
  tags: string[];
  downloads: string;
  author: string;
}

const themes: Theme[] = [
  {
    id: '1',
    name: 'Midnight Aurora',
    description: 'A dark theme with vibrant aurora-inspired accent colors',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#0f172a',
      text: '#f8fafc',
    },
    gradient: 'from-indigo-500 via-purple-500 to-cyan-500',
    tags: ['Dark', 'Modern', 'Vibrant'],
    downloads: '24.5k',
    author: 'Aurora Labs',
  },
  {
    id: '2',
    name: 'Sunset Blaze',
    description: 'Warm orange and pink tones reminiscent of a beautiful sunset',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fbbf24',
      background: '#1c1917',
      text: '#fafaf9',
    },
    gradient: 'from-orange-500 via-pink-500 to-amber-500',
    tags: ['Warm', 'Bold', 'Energetic'],
    downloads: '18.2k',
    author: 'SunsetUI',
  },
  {
    id: '3',
    name: 'Ocean Depths',
    description: 'Cool blues and teals inspired by the deep ocean',
    colors: {
      primary: '#0ea5e9',
      secondary: '#14b8a6',
      accent: '#3b82f6',
      background: '#0c1222',
      text: '#e2e8f0',
    },
    gradient: 'from-sky-500 via-teal-500 to-blue-500',
    tags: ['Cool', 'Calm', 'Professional'],
    downloads: '31.8k',
    author: 'DeepBlue',
  },
  {
    id: '4',
    name: 'Forest Canopy',
    description: 'Natural greens with earthy undertones',
    colors: {
      primary: '#22c55e',
      secondary: '#84cc16',
      accent: '#10b981',
      background: '#0a1a0f',
      text: '#ecfdf5',
    },
    gradient: 'from-green-500 via-lime-500 to-emerald-500',
    tags: ['Natural', 'Fresh', 'Organic'],
    downloads: '15.7k',
    author: 'NatureUI',
  },
  {
    id: '5',
    name: 'Neon Dreams',
    description: 'Cyberpunk-inspired neon colors on deep black',
    colors: {
      primary: '#f0abfc',
      secondary: '#a855f7',
      accent: '#22d3ee',
      background: '#030712',
      text: '#faf5ff',
    },
    gradient: 'from-fuchsia-500 via-purple-500 to-cyan-400',
    tags: ['Cyberpunk', 'Neon', 'Futuristic'],
    downloads: '42.1k',
    author: 'NeonLabs',
  },
  {
    id: '6',
    name: 'Minimal Slate',
    description: 'Clean and minimal with sophisticated gray tones',
    colors: {
      primary: '#64748b',
      secondary: '#475569',
      accent: '#94a3b8',
      background: '#020617',
      text: '#f1f5f9',
    },
    gradient: 'from-slate-400 via-slate-500 to-slate-600',
    tags: ['Minimal', 'Clean', 'Professional'],
    downloads: '28.3k',
    author: 'SlateStudio',
  },
  {
    id: '7',
    name: 'Rose Gold',
    description: 'Elegant rose and gold tones for a luxurious feel',
    colors: {
      primary: '#fb7185',
      secondary: '#f472b6',
      accent: '#fcd34d',
      background: '#18181b',
      text: '#fef2f2',
    },
    gradient: 'from-rose-400 via-pink-400 to-amber-300',
    tags: ['Elegant', 'Luxury', 'Feminine'],
    downloads: '19.9k',
    author: 'LuxeUI',
  },
  {
    id: '8',
    name: 'Arctic Frost',
    description: 'Icy blues and whites for a crisp, clean look',
    colors: {
      primary: '#38bdf8',
      secondary: '#7dd3fc',
      accent: '#e0f2fe',
      background: '#0f172a',
      text: '#f0f9ff',
    },
    gradient: 'from-sky-400 via-sky-300 to-blue-200',
    tags: ['Cool', 'Crisp', 'Minimal'],
    downloads: '22.6k',
    author: 'FrostLabs',
  },
];

function ThemeCard({ theme, isSelected, onClick }: { theme: Theme; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ${
        isSelected ? 'ring-2 ring-white/50 scale-[1.02]' : 'hover:scale-[1.02]'
      }`}
    >
      {/* Background gradient preview */}
      <div className={`h-40 bg-gradient-to-br ${theme.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />

        {/* Floating UI preview elements */}
        <div className="absolute inset-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
            <div className="w-3 h-3 rounded-full bg-white/30" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 w-full">
              <div className="h-2 w-3/4 bg-white/40 rounded mb-2" />
              <div className="h-2 w-1/2 bg-white/30 rounded" />
            </div>
          </div>
        </div>

        {/* Download count badge */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/90 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {theme.downloads}
        </div>
      </div>

      {/* Theme info */}
      <div className="p-5 bg-[#141414] border-t border-white/5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-white mb-1">{theme.name}</h3>
            <p className="text-sm text-gray-400">by {theme.author}</p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{theme.description}</p>

        {/* Color palette preview */}
        <div className="flex gap-1.5 mb-4">
          {Object.values(theme.colors).slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full ring-1 ring-white/10 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {theme.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-gray-400 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#141414]">
      <div className={`h-48 bg-gradient-to-br ${theme.gradient} relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-6 flex flex-col">
          {/* Browser chrome mockup */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <div className="w-3 h-3 rounded-full bg-white/30" />
            </div>
            <div className="flex-1 bg-white/10 rounded-full h-6 mx-4" />
          </div>

          {/* Content mockup */}
          <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-lg p-4">
            <div className="h-3 w-1/3 bg-white/40 rounded mb-3" />
            <div className="h-2 w-full bg-white/20 rounded mb-2" />
            <div className="h-2 w-4/5 bg-white/20 rounded mb-4" />
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-lg" style={{ backgroundColor: theme.colors.primary }} />
              <div className="h-8 w-20 rounded-lg bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{theme.name}</h3>
        <p className="text-gray-400 mb-6">{theme.description}</p>

        {/* Full color palette */}
        <div className="space-y-3 mb-6">
          {Object.entries(theme.colors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg ring-1 ring-white/10"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white capitalize">{name}</p>
                <p className="text-xs text-gray-500 font-mono">{color}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(color)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                title="Copy color"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* CSS Variables */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-400">CSS Variables</span>
            <button
              onClick={() => {
                const css = Object.entries(theme.colors)
                  .map(([name, color]) => `--${name}: ${color};`)
                  .join('\n  ');
                navigator.clipboard.writeText(`:root {\n  ${css}\n}`);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Copy All
            </button>
          </div>
          <pre className="text-xs text-gray-500 font-mono overflow-x-auto">
{`:root {
${Object.entries(theme.colors).map(([name, color]) => `  --${name}: ${color};`).join('\n')}
}`}
          </pre>
        </div>

        <button className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${theme.gradient} text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Theme
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0] as Theme);
  const [filter, setFilter] = useState<string>('All');

  const filters = ['All', 'Dark', 'Minimal', 'Vibrant', 'Cool', 'Warm'];

  const filteredThemes = filter === 'All'
    ? themes
    : themes.filter(t => t.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())));

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-40 right-40 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {themes.length} themes available
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Beautiful UI{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Themes
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Discover stunning color palettes and themes for your next project.
              Copy CSS variables with one click.
            </p>

            {/* Search bar */}
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search themes..."
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Theme grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredThemes.map((theme, i) => (
                <div
                  key={theme.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <ThemeCard
                    theme={theme}
                    isSelected={selectedTheme.id === theme.id}
                    onClick={() => setSelectedTheme(theme)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Selected theme preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Theme Preview
              </h2>
              <ThemePreview theme={selectedTheme} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Built with Next.js and Tailwind CSS
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">GitHub</a>
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
