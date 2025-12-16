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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-lg animate-fade-in-scale flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-500/90 text-white'
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
// DESIGN SYSTEM DATA
// ============================================================================

const colorPalette = {
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

const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  scale: [
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
  ],
};

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

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

function ColorSwatch({ shade }: { shade: { name: string; value: string } }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shade.value);
      setCopied(true);
      showToast(`Copied ${shade.value}`, 'success');
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shade.value, showToast]);

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

function ColorPaletteCard({ palette }: { palette: typeof colorPalette.primary & { key: string } }) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{palette.name}</h3>
        <p className="text-sm text-zinc-500">{palette.description}</p>
      </div>
      <div className="flex gap-2">
        {palette.shades.map((shade) => (
          <ColorSwatch key={shade.name} shade={shade} />
        ))}
      </div>
    </div>
  );
}

function TypographyRow({ item }: { item: typeof typography.scale[0] }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const cssValue = `font-size: ${item.size}; font-weight: ${item.weight}; line-height: ${item.lineHeight};`;
    try {
      await navigator.clipboard.writeText(cssValue);
      setCopied(true);
      showToast(`Copied ${item.name} styles`, 'success');
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [item, showToast]);

  return (
    <div className="flex items-center gap-6 py-4 border-b border-white/5 last:border-0 group">
      <div className="w-32 flex-shrink-0">
        <p className="text-sm font-medium text-white">{item.name}</p>
        <p className="text-xs text-zinc-500">{item.size}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${item.className} text-white truncate`}>
          The quick brown fox jumps over the lazy dog
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

function ButtonVariants() {
  const { showToast } = useToast();

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-4">Buttons</h3>
      <div className="space-y-6">
        {/* Primary Buttons */}
        <div>
          <p className="text-sm text-zinc-400 mb-3">Primary</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => showToast('Primary button clicked', 'success')}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
            >
              Default
            </button>
            <button
              onClick={() => showToast('Hover state shown', 'info')}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg"
            >
              Hover
            </button>
            <button
              disabled
              className="px-4 py-2 bg-indigo-500/50 text-white/50 font-medium rounded-lg cursor-not-allowed"
            >
              Disabled
            </button>
            <button
              onClick={() => showToast('Small button clicked', 'success')}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Small
            </button>
            <button
              onClick={() => showToast('Large button clicked', 'success')}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-medium rounded-lg transition-colors"
            >
              Large
            </button>
          </div>
        </div>

        {/* Secondary Buttons */}
        <div>
          <p className="text-sm text-zinc-400 mb-3">Secondary</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => showToast('Secondary button clicked', 'success')}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors"
            >
              Default
            </button>
            <button
              onClick={() => showToast('Outline button clicked', 'success')}
              className="px-4 py-2 border border-zinc-600 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors"
            >
              Outline
            </button>
            <button
              onClick={() => showToast('Ghost button clicked', 'success')}
              className="px-4 py-2 hover:bg-zinc-800 text-zinc-300 font-medium rounded-lg transition-colors"
            >
              Ghost
            </button>
          </div>
        </div>

        {/* Semantic Buttons */}
        <div>
          <p className="text-sm text-zinc-400 mb-3">Semantic</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => showToast('Success action completed', 'success')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              Success
            </button>
            <button
              onClick={() => showToast('Warning acknowledged', 'info')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              Warning
            </button>
            <button
              onClick={() => showToast('Danger action triggered', 'info')}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Danger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgeVariants() {
  const { showToast } = useToast();

  const badges = [
    { label: 'Default', className: 'bg-zinc-700 text-zinc-200' },
    { label: 'Primary', className: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' },
    { label: 'Success', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
    { label: 'Warning', className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
    { label: 'Danger', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { label: 'Info', className: 'bg-sky-500/20 text-sky-400 border border-sky-500/30' },
  ];

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-4">Badges</h3>
      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => (
          <button
            key={badge.label}
            onClick={() => showToast(`${badge.label} badge clicked`, 'success')}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-transform hover:scale-105 ${badge.className}`}
          >
            {badge.label}
          </button>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-sm text-zinc-400 mb-3">With Dot Indicator</p>
        <div className="flex flex-wrap gap-3">
          {['Online', 'Away', 'Busy', 'Offline'].map((status, i) => (
            <button
              key={status}
              onClick={() => showToast(`Status: ${status}`, 'info')}
              className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full flex items-center gap-2 hover:bg-zinc-700 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${
                i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-500' : i === 2 ? 'bg-red-500' : 'bg-zinc-500'
              }`} />
              {status}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InputVariants() {
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const { showToast } = useToast();

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-4">Inputs</h3>
      <div className="space-y-6">
        {/* Default Input */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Default Input</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter text..."
            className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Search Input</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2.5 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('');
                  showToast('Search cleared', 'info');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-700 text-zinc-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* States */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Error State</label>
            <input
              type="text"
              defaultValue="Invalid input"
              className="w-full px-4 py-2.5 bg-zinc-800 border border-red-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
            <p className="mt-1.5 text-sm text-red-400">This field is required</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Disabled State</label>
            <input
              type="text"
              disabled
              defaultValue="Disabled input"
              className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardVariants() {
  const { showToast } = useToast();

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-4">Cards</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Default Card */}
        <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
          <h4 className="font-medium text-white mb-2">Default Card</h4>
          <p className="text-sm text-zinc-400 mb-4">Basic card with subtle border and background.</p>
          <button
            onClick={() => showToast('Card action clicked', 'success')}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Learn more &rarr;
          </button>
        </div>

        {/* Elevated Card */}
        <div className="bg-zinc-800 rounded-xl p-4 shadow-lg shadow-black/20">
          <h4 className="font-medium text-white mb-2">Elevated Card</h4>
          <p className="text-sm text-zinc-400 mb-4">Card with shadow for emphasis and depth.</p>
          <button
            onClick={() => showToast('Elevated card action', 'success')}
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Learn more &rarr;
          </button>
        </div>

        {/* Interactive Card */}
        <button
          onClick={() => showToast('Interactive card clicked', 'success')}
          className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all text-left group"
        >
          <h4 className="font-medium text-white mb-2 group-hover:text-indigo-400 transition-colors">Interactive Card</h4>
          <p className="text-sm text-zinc-400 mb-4">Clickable card with hover effects.</p>
          <span className="text-sm text-indigo-400 font-medium">
            Click me &rarr;
          </span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

function HomeContent() {
  const [activeSection, setActiveSection] = useState<string>('colors');

  const sections = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'components', label: 'Components' },
  ];

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Design System</h1>
              <p className="text-sm text-zinc-500">Theme Documentation</p>
            </div>
            <nav className="flex gap-1 bg-zinc-900 rounded-lg p-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-indigo-500 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Colors Section */}
        {activeSection === 'colors' && (
          <section>
            <SectionHeader
              title="Color Palette"
              description="Click any color swatch to copy its hex value to your clipboard."
            />
            <div className="space-y-6">
              {Object.entries(colorPalette).map(([key, palette]) => (
                <ColorPaletteCard key={key} palette={{ ...palette, key }} />
              ))}
            </div>
          </section>
        )}

        {/* Typography Section */}
        {activeSection === 'typography' && (
          <section>
            <SectionHeader
              title="Typography Scale"
              description="Consistent type scale for hierarchy and readability. Hover over any row to copy CSS."
            />
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5 mb-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Font Families</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Sans Serif</p>
                    <p className="text-white font-medium">{typography.fontFamily.sans}</p>
                  </div>
                  <div className="p-4 bg-zinc-800 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-1">Monospace</p>
                    <p className="text-white font-mono">{typography.fontFamily.mono}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Type Scale</h3>
                <div>
                  {typography.scale.map((item) => (
                    <TypographyRow key={item.name} item={item} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Components Section */}
        {activeSection === 'components' && (
          <section>
            <SectionHeader
              title="Component Variants"
              description="Interactive component examples. Click any element to see toast feedback."
            />
            <div className="space-y-6">
              <ButtonVariants />
              <BadgeVariants />
              <InputVariants />
              <CardVariants />
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-sm text-zinc-500 text-center">
            Built with Next.js and Tailwind CSS
          </p>
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
