'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

// ============================================================================
// TOAST CONTEXT
// ============================================================================

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg animate-fade-in-scale flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-zinc-800 text-white border border-white/10'
            }`}
          >
            {toast.type === 'success' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================================
// TYPES
// ============================================================================

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  gradient: string;
  tags: string[];
  downloads: number;
  author: string;
}

// ============================================================================
// DATA
// ============================================================================

const themes: Theme[] = [
  {
    id: '1',
    name: 'Midnight Aurora',
    description: 'A sophisticated dark theme with vibrant aurora-inspired accent colors. Perfect for modern dashboards and developer tools.',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#0f172a',
      foreground: '#f8fafc',
    },
    gradient: 'from-indigo-500 via-purple-500 to-cyan-500',
    tags: ['Dark', 'Modern', 'Vibrant'],
    downloads: 24521,
    author: 'Aurora Labs',
  },
  {
    id: '2',
    name: 'Sunset Blaze',
    description: 'Warm orange and pink tones reminiscent of a beautiful sunset. Energetic and bold for creative projects.',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#fbbf24',
      background: '#1c1917',
      foreground: '#fafaf9',
    },
    gradient: 'from-orange-500 via-pink-500 to-amber-400',
    tags: ['Warm', 'Bold', 'Creative'],
    downloads: 18234,
    author: 'SunsetUI',
  },
  {
    id: '3',
    name: 'Ocean Depths',
    description: 'Cool blues and teals inspired by the deep ocean. Calm and professional for business applications.',
    colors: {
      primary: '#0ea5e9',
      secondary: '#14b8a6',
      accent: '#3b82f6',
      background: '#0c1222',
      foreground: '#e2e8f0',
    },
    gradient: 'from-sky-500 via-teal-400 to-blue-600',
    tags: ['Cool', 'Professional', 'Calm'],
    downloads: 31847,
    author: 'DeepBlue',
  },
  {
    id: '4',
    name: 'Forest Canopy',
    description: 'Natural greens with earthy undertones. Fresh and organic for eco-friendly and health apps.',
    colors: {
      primary: '#22c55e',
      secondary: '#84cc16',
      accent: '#10b981',
      background: '#0a1a0f',
      foreground: '#ecfdf5',
    },
    gradient: 'from-green-500 via-lime-400 to-emerald-600',
    tags: ['Natural', 'Fresh', 'Organic'],
    downloads: 15723,
    author: 'NatureUI',
  },
  {
    id: '5',
    name: 'Neon Dreams',
    description: 'Cyberpunk-inspired neon colors on deep black. Futuristic and edgy for gaming and entertainment.',
    colors: {
      primary: '#f0abfc',
      secondary: '#a855f7',
      accent: '#22d3ee',
      background: '#030712',
      foreground: '#faf5ff',
    },
    gradient: 'from-fuchsia-400 via-purple-500 to-cyan-400',
    tags: ['Cyberpunk', 'Neon', 'Gaming'],
    downloads: 42156,
    author: 'NeonLabs',
  },
  {
    id: '6',
    name: 'Minimal Slate',
    description: 'Clean and minimal with sophisticated gray tones. Timeless elegance for professional portfolios.',
    colors: {
      primary: '#64748b',
      secondary: '#475569',
      accent: '#94a3b8',
      background: '#020617',
      foreground: '#f1f5f9',
    },
    gradient: 'from-slate-400 via-slate-500 to-slate-600',
    tags: ['Minimal', 'Clean', 'Professional'],
    downloads: 28312,
    author: 'SlateStudio',
  },
  {
    id: '7',
    name: 'Rose Gold',
    description: 'Elegant rose and gold tones for a luxurious feel. Perfect for fashion and lifestyle brands.',
    colors: {
      primary: '#fb7185',
      secondary: '#f472b6',
      accent: '#fcd34d',
      background: '#18181b',
      foreground: '#fef2f2',
    },
    gradient: 'from-rose-400 via-pink-400 to-amber-300',
    tags: ['Elegant', 'Luxury', 'Fashion'],
    downloads: 19945,
    author: 'LuxeUI',
  },
  {
    id: '8',
    name: 'Arctic Frost',
    description: 'Icy blues and whites for a crisp, clean look. Minimalist and refreshing for tech startups.',
    colors: {
      primary: '#38bdf8',
      secondary: '#7dd3fc',
      accent: '#e0f2fe',
      background: '#0f172a',
      foreground: '#f0f9ff',
    },
    gradient: 'from-sky-400 via-sky-300 to-blue-300',
    tags: ['Cool', 'Minimal', 'Tech'],
    downloads: 22614,
    author: 'FrostLabs',
  },
];

// Curated filter categories (not all tags, just main categories)
const filterCategories = ['All', 'Dark', 'Warm', 'Cool', 'Minimal', 'Vibrant'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

// ============================================================================
// COMPONENTS
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

function SearchIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DownloadIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function GitHubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function ColorSwatch({ name, color }: { name: string; color: string }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      showToast(`Copied ${color}`, 'success');
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [color, showToast]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors group w-full text-left"
    >
      <div
        className={`w-10 h-10 rounded-lg ring-1 ring-white/10 flex-shrink-0 transition-transform group-hover:scale-105 ${copied ? 'animate-copy' : ''}`}
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white capitalize">{name}</p>
        <p className="text-xs text-zinc-500 font-mono">{color}</p>
      </div>
      <div className={`transition-opacity ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {copied ? (
          <CheckIcon className="w-4 h-4 text-green-400" />
        ) : (
          <CopyIcon className="w-4 h-4 text-zinc-400" />
        )}
      </div>
    </button>
  );
}

function ThemeCard({
  theme,
  isSelected,
  onClick
}: {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-indigo-500 scale-[1.02]'
          : 'hover:scale-[1.01] ring-1 ring-white/10 hover:ring-white/20'
      }`}
    >
      {/* Gradient Preview */}
      <div className={`h-36 bg-gradient-to-br ${theme.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Mini UI Preview */}
        <div className="absolute inset-3 flex flex-col">
          <div className="flex gap-1.5 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
          </div>
          <div className="flex-1 flex items-end">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 w-full">
              <div className="h-1.5 w-2/3 bg-white/50 rounded mb-1.5" />
              <div className="h-1.5 w-1/2 bg-white/30 rounded" />
            </div>
          </div>
        </div>

        {/* Download Badge */}
        <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white/90 flex items-center gap-1">
          <DownloadIcon className="w-3 h-3" />
          {formatNumber(theme.downloads)}
        </div>
      </div>

      {/* Theme Info */}
      <div className="p-4 bg-zinc-900/80">
        <div className="mb-2">
          <h3 className="font-semibold text-white mb-0.5">{theme.name}</h3>
          <p className="text-xs text-zinc-500">by {theme.author}</p>
        </div>

        {/* Color Dots */}
        <div className="flex gap-1.5 mb-3">
          {Object.values(theme.colors).slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full ring-1 ring-white/10"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {theme.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-zinc-400 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ThemePreview({ theme }: { theme: Theme }) {
  const [allCopied, setAllCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopyAll = useCallback(async () => {
    const css = Object.entries(theme.colors)
      .map(([name, color]) => `  --${name}: ${color};`)
      .join('\n');
    const fullCss = `:root {\n${css}\n}`;

    try {
      await navigator.clipboard.writeText(fullCss);
      setAllCopied(true);
      showToast('Copied all CSS variables!', 'success');
      setTimeout(() => setAllCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [theme.colors, showToast]);

  const handleDownload = useCallback(() => {
    const css = Object.entries(theme.colors)
      .map(([name, color]) => `  --${name}: ${color};`)
      .join('\n');
    const fullCss = `/* ${theme.name} Theme by ${theme.author} */\n:root {\n${css}\n}`;
    showToast(`Downloaded ${theme.name} theme!`, 'success');

    const blob = new Blob([fullCss], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [theme, showToast]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/50">
      {/* Preview Header */}
      <div className={`h-44 bg-gradient-to-br ${theme.gradient} relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-5 flex flex-col">
          {/* Browser Chrome */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <div className="w-3 h-3 rounded-full bg-white/30" />
            </div>
            <div className="flex-1 bg-white/10 rounded-full h-5 mx-3" />
          </div>

          {/* Content Preview */}
          <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-lg p-3">
            <div className="h-2.5 w-1/3 bg-white/50 rounded mb-2" />
            <div className="h-2 w-full bg-white/20 rounded mb-1.5" />
            <div className="h-2 w-4/5 bg-white/20 rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-7 w-16 rounded-md" style={{ backgroundColor: theme.colors.primary }} />
              <div className="h-7 w-16 rounded-md bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Theme Details */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-1">{theme.name}</h3>
        <p className="text-sm text-zinc-400 mb-5">{theme.description}</p>

        {/* Color Palette */}
        <div className="space-y-1 mb-5">
          {Object.entries(theme.colors).map(([name, color]) => (
            <ColorSwatch key={name} name={name} color={color} />
          ))}
        </div>

        {/* CSS Variables */}
        <div className="bg-black/30 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-400">CSS Variables</span>
            <button
              onClick={handleCopyAll}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                allCopied
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'
              }`}
            >
              {allCopied ? 'Copied!' : 'Copy All'}
            </button>
          </div>
          <pre className="text-xs text-zinc-500 font-mono overflow-x-auto">
{`:root {
${Object.entries(theme.colors).map(([name, color]) => `  --${name}: ${color};`).join('\n')}
}`}
          </pre>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${theme.gradient} text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.98]`}
        >
          <DownloadIcon className="w-5 h-5" />
          Download Theme
        </button>
      </div>
    </div>
  );
}

function EmptyState({
  searchQuery,
  filter,
  onClear
}: {
  searchQuery: string;
  filter: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
        <SearchIcon className="w-8 h-8 text-zinc-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No themes found</h3>
      <p className="text-zinc-500 mb-5 max-w-sm">
        {searchQuery && filter !== 'All' ? (
          <>No themes match &quot;{searchQuery}&quot; in {filter}</>
        ) : searchQuery ? (
          <>No themes match &quot;{searchQuery}&quot;</>
        ) : (
          <>No themes in {filter} category</>
        )}
      </p>
      <button
        onClick={onClear}
        className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors font-medium"
      >
        Clear filters
      </button>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

function HomeContent() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0] as Theme);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter themes based on search and category
  const filteredThemes = themes.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.author.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query));

    // Case-insensitive tag matching - check if any theme tag contains or equals the filter
    const matchesFilter = filter === 'All' ||
      t.tags.some(tag => tag.toLowerCase() === filter.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())) ||
      t.description.toLowerCase().includes(filter.toLowerCase());

    return matchesSearch && matchesFilter;
  });

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilter('All');
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-white/5">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-ring" />
              {themes.length} themes available
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 tracking-tight">
              Beautiful UI{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Themes
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
              Discover stunning color palettes for your next project.
              Copy CSS variables with one click.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="Search by name, author, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3.5 pl-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center gap-2 flex-wrap" style={{ animationDelay: '0.1s' }}>
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === category
                    ? 'bg-white text-zinc-900'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Theme Grid */}
          <div className="lg:col-span-2">
            {filteredThemes.length === 0 ? (
              <EmptyState
                searchQuery={searchQuery}
                filter={filter}
                onClear={clearFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredThemes.map((theme, i) => (
                  <div
                    key={theme.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <ThemeCard
                      theme={theme}
                      isSelected={selectedTheme.id === theme.id}
                      onClick={() => setSelectedTheme(theme)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview
              </h2>
              <ThemePreview theme={selectedTheme} />
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              Built with Next.js and Tailwind CSS
            </p>
            <a
              href="https://github.com/jacksonford07/project-template"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <GitHubIcon />
              View on GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}
