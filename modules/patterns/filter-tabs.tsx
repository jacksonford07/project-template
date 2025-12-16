/**
 * Curated Filter Tabs
 *
 * A tab-based filtering system with curated categories.
 * Uses curated list instead of dynamic tags to prevent UI clutter.
 *
 * Key principles:
 * - Limit to 5-8 filter options maximum
 * - Use case-insensitive matching
 * - Match against multiple fields
 * - Always include an "All" option
 *
 * @module filter-tabs
 * @source iteration3
 */

'use client';

import { useState, useCallback, useMemo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface FilterTabsProps<T> {
  /** Array of items to filter */
  items: T[];
  /** Curated list of filter categories (5-8 max recommended) */
  categories: string[];
  /** Function to determine if an item matches a filter */
  matchFn: (item: T, filter: string) => boolean;
  /** Render function for filtered items */
  children: (filteredItems: T[], activeFilter: string) => React.ReactNode;
  /** Optional class for the tab container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FilterTabs<T>({
  items,
  categories,
  matchFn,
  children,
  className = ''
}: FilterTabsProps<T>) {
  const [activeFilter, setActiveFilter] = useState<string>(categories[0] || 'All');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return items;
    return items.filter(item => matchFn(item, activeFilter));
  }, [items, activeFilter, matchFn]);

  return (
    <>
      {/* Filter Tabs */}
      <div className={`flex gap-2 flex-wrap ${className}`}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === category
                ? 'bg-white text-zinc-900'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Render filtered content */}
      {children(filteredItems, activeFilter)}
    </>
  );
}

// ============================================================================
// HELPER: Case-insensitive multi-field matcher
// ============================================================================

/**
 * Creates a matcher function for items with tags and description
 *
 * @example
 * const matchFn = createMatcher<Theme>(['tags', 'description']);
 * <FilterTabs matchFn={matchFn} ... />
 */
export function createMatcher<T extends Record<string, unknown>>(
  fields: (keyof T)[]
): (item: T, filter: string) => boolean {
  return (item: T, filter: string) => {
    const filterLower = filter.toLowerCase();

    for (const field of fields) {
      const value = item[field];

      // Handle array fields (like tags)
      if (Array.isArray(value)) {
        if (value.some(v =>
          String(v).toLowerCase() === filterLower ||
          String(v).toLowerCase().includes(filterLower)
        )) {
          return true;
        }
      }
      // Handle string fields
      else if (typeof value === 'string') {
        if (value.toLowerCase().includes(filterLower)) {
          return true;
        }
      }
    }

    return false;
  };
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
interface Theme {
  id: string;
  name: string;
  tags: string[];
  description: string;
}

const themes: Theme[] = [...];

// BAD: Dynamic filters - creates too many options
const allTags = ['All', ...Array.from(new Set(themes.flatMap(t => t.tags)))];

// GOOD: Curated filters - focused and scannable
const filterCategories = ['All', 'Dark', 'Warm', 'Cool', 'Minimal', 'Vibrant'];

// Usage:
<FilterTabs
  items={themes}
  categories={filterCategories}
  matchFn={createMatcher(['tags', 'description'])}
>
  {(filteredThemes, activeFilter) => (
    <div>
      {filteredThemes.map(theme => <ThemeCard key={theme.id} theme={theme} />)}
    </div>
  )}
</FilterTabs>
*/
