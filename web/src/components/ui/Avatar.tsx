'use client';

import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}: AvatarProps): React.ReactElement {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const getInitials = (name: string): string => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
    }
    return (name[0] ?? '?').toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? name ?? 'Avatar'}
        className={`${sizeStyles[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
  ];

  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`${sizeStyles[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-medium ${className}`}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
}: AvatarGroupProps): React.ReactElement {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  const overlapStyles = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div className="flex items-center">
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className={`${index > 0 ? overlapStyles[size] : ''} ring-2 ring-white rounded-full`}
        >
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`${overlapStyles[size]} ${sizeStyles[size]} bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-medium ring-2 ring-white`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
