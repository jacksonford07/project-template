'use client';

import React from 'react';

/**
 * Skeleton Loading Components
 *
 * Use these components to show loading states that match the content layout.
 * This provides better UX than generic spinners.
 *
 * @example
 * ```tsx
 * // Basic skeleton
 * <Skeleton className="h-4 w-full" />
 *
 * // Card skeleton
 * <SkeletonCard />
 *
 * // List of items
 * <SkeletonList count={5} />
 *
 * // With Suspense
 * <Suspense fallback={<SkeletonCard />}>
 *   <AsyncCard />
 * </Suspense>
 * ```
 */

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({
  className = '',
  animate = true,
}: SkeletonProps): React.ReactElement {
  return (
    <div
      className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
}

/**
 * Text skeleton with multiple lines
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  className = '',
}: SkeletonTextProps): React.ReactElement {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SkeletonAvatar({
  size = 'md',
  className = '',
}: SkeletonAvatarProps): React.ReactElement {
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <Skeleton className={`rounded-full ${sizeStyles[size]} ${className}`} />
  );
}

/**
 * Button skeleton
 */
interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  width?: string;
  className?: string;
}

export function SkeletonButton({
  size = 'md',
  width = 'w-24',
  className = '',
}: SkeletonButtonProps): React.ReactElement {
  const sizeStyles = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  return (
    <Skeleton className={`${sizeStyles[size]} ${width} rounded-lg ${className}`} />
  );
}

/**
 * Card skeleton
 */
interface SkeletonCardProps {
  hasImage?: boolean;
  lines?: number;
  className?: string;
}

export function SkeletonCard({
  hasImage = false,
  lines = 3,
  className = '',
}: SkeletonCardProps): React.ReactElement {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {hasImage && (
        <Skeleton className="h-48 w-full rounded-none" />
      )}
      <div className="p-5 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <SkeletonText lines={lines} />
        <div className="flex gap-2 pt-2">
          <SkeletonButton size="sm" width="w-20" />
          <SkeletonButton size="sm" width="w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * List skeleton
 */
interface SkeletonListProps {
  count?: number;
  className?: string;
}

export function SkeletonList({
  count = 5,
  className = '',
}: SkeletonListProps): React.ReactElement {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton
 */
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
}: SkeletonTableProps): React.ReactElement {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex border-b border-gray-200 p-4 bg-gray-50">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <Skeleton className="h-4" />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex border-b border-gray-100 last:border-0 p-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 px-2">
              <Skeleton className="h-4" style={{ width: `${70 + Math.random() * 30}%` } as React.CSSProperties} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Form skeleton
 */
interface SkeletonFormProps {
  fields?: number;
  className?: string;
}

export function SkeletonForm({
  fields = 4,
  className = '',
}: SkeletonFormProps): React.ReactElement {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <SkeletonButton size="lg" width="w-full" />
    </div>
  );
}

/**
 * Page header skeleton
 */
export function SkeletonPageHeader(): React.ReactElement {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}

/**
 * Dashboard skeleton (combines multiple elements)
 */
export function SkeletonDashboard(): React.ReactElement {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard lines={5} />
        </div>
        <div>
          <SkeletonList count={4} />
        </div>
      </div>
    </div>
  );
}
