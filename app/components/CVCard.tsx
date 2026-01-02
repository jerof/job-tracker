'use client';

import { CV } from '@/lib/types';

interface CVCardProps {
  cv: CV;
  onPreview: (cv: CV) => void;
  onDelete?: (cv: CV) => void;
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

export default function CVCard({ cv, onPreview, onDelete }: CVCardProps) {
  const isTailored = cv.type === 'tailored';

  return (
    <div
      onClick={() => onPreview(cv)}
      className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Delete button */}
      {isTailored && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(cv);
          }}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Delete CV"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* PDF Badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-semibold rounded-md shadow-sm shadow-red-500/20">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6"/>
          </svg>
          PDF
        </div>
        {isTailored && (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-violet-100 text-violet-700 rounded-full">
            Tailored
          </span>
        )}
      </div>

      {/* Filename */}
      <h3 className="font-medium text-gray-900 text-sm truncate mb-2 pr-6">
        {cv.filename}
      </h3>

      {/* Company/Role for tailored CVs */}
      {isTailored && (cv.company || cv.role) && (
        <div className="space-y-1 mb-3">
          {cv.company && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">{cv.company}</span>
            </div>
          )}
          {cv.role && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{cv.role}</span>
            </div>
          )}
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-100">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {formatRelativeDate(cv.createdAt)}
      </div>
    </div>
  );
}
