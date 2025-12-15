/**
 * Centralized color constants
 * Single source of truth for all colors in the application
 */

export const COLORS = {
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  secondary: '#6B7280',
  secondaryHover: '#4B5563',
  success: '#10B981',
  successHover: '#059669',
  warning: '#F59E0B',
  warningHover: '#D97706',
  error: '#EF4444',
  errorHover: '#DC2626',
  info: '#3B82F6',
  infoHover: '#2563EB',
} as const;

export const STATUS_COLORS = {
  active: COLORS.success,
  pending: COLORS.warning,
  inactive: COLORS.secondary,
  error: COLORS.error,
  completed: COLORS.success,
  cancelled: COLORS.error,
} as const;

export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
] as const;

export const GRAY_SCALE = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

export type ColorKey = keyof typeof COLORS;
export type StatusColorKey = keyof typeof STATUS_COLORS;
