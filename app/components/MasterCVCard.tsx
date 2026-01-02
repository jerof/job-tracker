'use client';

import { CV } from '@/lib/types';

interface MasterCVCardProps {
  cv: CV | null;
  onEdit: () => void;
  onAdd?: () => void;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MasterCVCard({ cv, onEdit, onAdd }: MasterCVCardProps) {
  // Empty state - no master CV
  if (!cv) {
    return (
      <div
        onClick={onAdd}
        className="relative bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-md transition-all duration-200 cursor-pointer min-h-[160px] flex flex-col items-center justify-center"
      >
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <p className="text-sm font-medium text-amber-700 mb-1">Add Master CV</p>
        <p className="text-xs text-amber-600/70 text-center">Your base CV for tailoring to jobs</p>
      </div>
    );
  }

  return (
    <div
      onClick={onEdit}
      className="group relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Master badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-semibold rounded-md shadow-sm shadow-amber-500/20">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          MASTER
        </div>
      </div>

      {/* Title */}
      <h3 className="font-medium text-gray-900 text-sm mb-2">
        Master CV
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-3">
        Your base CV used for tailoring
      </p>

      {/* Edit button */}
      <div className="flex items-center gap-2 text-xs text-amber-600 group-hover:text-amber-700">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="font-medium">Edit</span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-3 pt-2 border-t border-amber-100">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Updated {formatRelativeDate(cv.updatedAt)}
      </div>
    </div>
  );
}
