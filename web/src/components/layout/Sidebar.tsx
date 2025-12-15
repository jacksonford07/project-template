'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function Sidebar({
  sections,
  header,
  footer,
  collapsible = true,
  defaultCollapsed = false,
}: SidebarProps): React.ReactElement {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const pathname = usePathname();

  return (
    <aside
      className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      {header && (
        <div className={`p-4 border-b border-gray-200 ${collapsed ? 'px-2' : ''}`}>
          {header}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && !collapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1 px-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      } ${collapsed ? 'justify-center' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      {item.icon && (
                        <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                          {item.icon}
                        </span>
                      )}
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className={`p-4 border-t border-gray-200 ${collapsed ? 'px-2' : ''}`}>
          {footer}
        </div>
      )}

      {/* Collapse toggle */}
      {collapsible && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 m-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      )}
    </aside>
  );
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  navbar?: React.ReactNode;
}

export function DashboardLayout({
  children,
  sidebar,
  navbar,
}: DashboardLayoutProps): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {sidebar}
        <div className="flex-1 flex flex-col">
          {navbar}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
