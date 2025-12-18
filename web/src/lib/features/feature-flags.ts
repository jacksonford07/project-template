/**
 * Feature Flags System
 *
 * Simple feature flag implementation for controlling feature rollouts.
 * For production, consider: LaunchDarkly, Flagsmith, or Unleash.
 *
 * @example
 * ```ts
 * import { isFeatureEnabled, getFeatureValue } from '@/lib/features/feature-flags';
 *
 * // Boolean flag
 * if (isFeatureEnabled('newDashboard')) {
 *   return <NewDashboard />;
 * }
 *
 * // Value flag
 * const maxItems = getFeatureValue('maxItemsPerPage', 10);
 * ```
 */

// Feature flag definitions
export interface FeatureFlags {
  // Boolean flags
  newDashboard: boolean;
  betaFeatures: boolean;
  darkModeV2: boolean;
  experimentalApi: boolean;

  // Value flags
  maxItemsPerPage: number;
  apiRateLimit: number;
  cacheTimeout: number;
}

// Default flag values
const defaultFlags: FeatureFlags = {
  newDashboard: false,
  betaFeatures: false,
  darkModeV2: false,
  experimentalApi: false,
  maxItemsPerPage: 10,
  apiRateLimit: 100,
  cacheTimeout: 3600,
};

// Environment-based overrides
const envOverrides: Partial<FeatureFlags> = {
  // Override from environment variables
  betaFeatures: process.env.NEXT_PUBLIC_ENABLE_BETA === 'true',
  experimentalApi: process.env.ENABLE_EXPERIMENTAL_API === 'true',
};

// Get current flags (merge defaults with overrides)
function getFlags(): FeatureFlags {
  return { ...defaultFlags, ...envOverrides };
}

/**
 * Check if a boolean feature flag is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFlags();
  const value = flags[flag];
  return typeof value === 'boolean' ? value : false;
}

/**
 * Get the value of a feature flag
 */
export function getFeatureValue<K extends keyof FeatureFlags>(
  flag: K,
  defaultValue: FeatureFlags[K]
): FeatureFlags[K] {
  const flags = getFlags();
  return flags[flag] ?? defaultValue;
}

/**
 * Get all feature flags (for debugging/admin)
 */
export function getAllFlags(): FeatureFlags {
  return getFlags();
}

/**
 * Feature flag React hook
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  // In a real implementation, this could fetch from an API
  // and support real-time updates
  return isFeatureEnabled(flag);
}

/**
 * Feature flag component wrapper
 */
export function FeatureGate({
  flag,
  children,
  fallback = null,
}: {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.ReactNode {
  const enabled = useFeatureFlag(flag);
  return enabled ? children : fallback;
}

// Type exports for external use
export type FeatureFlagName = keyof FeatureFlags;
