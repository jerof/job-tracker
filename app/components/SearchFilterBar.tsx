'use client';

import { useEffect, useRef } from 'react';
import { ApplicationStatus } from '@/lib/types';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ApplicationStatus | 'all';
  onStatusFilterChange: (status: ApplicationStatus | 'all') => void;
  onAddClick: () => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
}: SearchFilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onSearchChange('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      {/* Search Input - Command palette style */}
      <div className="relative flex-1 max-w-lg group">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full
            px-4 pr-20 py-2.5
            bg-slate-50 dark:bg-slate-800/50
            border border-slate-200 dark:border-slate-700/50
            rounded-xl
            text-sm text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:bg-white dark:focus:bg-slate-800
            focus:border-slate-300 dark:focus:border-slate-600
            focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800
            focus:shadow-lg focus:shadow-slate-200/50 dark:focus:shadow-slate-900/50
            transition-all duration-200
          "
        />

        {/* Right side: Clear button or keyboard shortcut */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="
                p-1 rounded-md
                text-slate-400 dark:text-slate-500
                hover:text-slate-600 dark:hover:text-slate-300
                hover:bg-slate-200 dark:hover:bg-slate-700
                transition-colors duration-150
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Status Filter - Pill style */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as ApplicationStatus | 'all')}
          className="
            appearance-none
            w-full sm:w-auto
            pl-4 pr-9 py-2.5
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700/50
            rounded-xl
            text-sm font-medium text-slate-600 dark:text-slate-300
            focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800
            focus:border-slate-300 dark:focus:border-slate-600
            hover:border-slate-300 dark:hover:border-slate-600
            hover:bg-slate-50 dark:hover:bg-slate-700/50
            transition-all duration-200
            cursor-pointer
          "
        >
          <option value="all">All jobs</option>
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer">Offer</option>
          <option value="closed">Closed</option>
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Add Button - Prominent CTA */}
      <button
        onClick={onAddClick}
        className="
          flex items-center justify-center gap-2
          px-5 py-2.5
          bg-slate-900 dark:bg-white
          text-white dark:text-slate-900
          rounded-xl
          text-sm font-semibold
          shadow-sm
          transition-all duration-200
          hover:bg-slate-800 dark:hover:bg-slate-100
          hover:shadow-md hover:scale-[1.02]
          active:scale-100
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Job</span>
      </button>
    </div>
  );
}
