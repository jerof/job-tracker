'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export function NavItem({ icon, label, href, isActive, isCollapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`
        relative group flex items-center
        ${isCollapsed ? 'justify-center' : 'justify-start'}
        px-3 py-2.5
        rounded-lg
        transition-all duration-200 ease-out
        ${isActive
          ? 'bg-blue-600/10 text-blue-500'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }
      `}
    >
      {/* Icon */}
      <span className={`
        flex-shrink-0 w-5 h-5
        transition-transform duration-200
        ${isActive ? 'scale-110' : 'group-hover:scale-105'}
      `}>
        {icon}
      </span>

      {/* Label - hidden when collapsed */}
      {!isCollapsed && (
        <span className={`
          ml-3 text-sm font-medium
          transition-opacity duration-200
          whitespace-nowrap
        `}>
          {label}
        </span>
      )}

      {/* Active indicator */}
      {isActive && (
        <span className={`
          absolute left-0 top-1/2 -translate-y-1/2
          w-1 h-6 rounded-r-full
          bg-blue-500
        `} />
      )}

      {/* Tooltip when collapsed */}
      {isCollapsed && (
        <span className={`
          absolute left-full ml-3
          px-2.5 py-1.5
          bg-slate-800 text-slate-200
          text-sm font-medium
          rounded-md
          whitespace-nowrap
          opacity-0 invisible
          group-hover:opacity-100 group-hover:visible
          transition-all duration-200
          z-50
          shadow-lg shadow-black/20
          pointer-events-none
        `}>
          {label}
          {/* Tooltip arrow */}
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45" />
        </span>
      )}
    </Link>
  );
}
