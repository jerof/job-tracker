'use client';

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
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md group">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search company or role..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full
            pl-10 pr-10 py-2.5
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            rounded-lg
            text-sm text-slate-900 dark:text-slate-100
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200
          "
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              p-0.5 rounded
              text-slate-400 dark:text-slate-500
              hover:text-slate-600 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-700
              transition-colors duration-200
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as ApplicationStatus | 'all')}
          className="
            appearance-none
            w-full sm:w-auto
            px-4 pr-9 py-2.5
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            rounded-lg
            text-sm text-slate-700 dark:text-slate-200
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
            transition-all duration-200
            cursor-pointer
          "
        >
          <option value="all">All Status</option>
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

      {/* Add Button */}
      <button
        onClick={onAddClick}
        className="
          flex items-center justify-center gap-2
          px-4 py-2.5
          bg-blue-600 hover:bg-blue-700
          text-white
          rounded-lg
          text-sm font-medium
          shadow-sm
          transition-all duration-200
          hover:shadow-md hover:-translate-y-0.5
          active:translate-y-0
        "
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add</span>
      </button>
    </div>
  );
}
