'use client';

import { useState, useEffect } from 'react';
import { ResearchChat } from './ResearchChat';

interface ResearchChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  company: string;
  role: string;
  jobUrl?: string;
}

export function ResearchChatModal({
  isOpen,
  onClose,
  applicationId,
  company,
  role,
  jobUrl,
}: ResearchChatModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleExpandToPage = () => {
    // Open in new tab for now - could be a Next.js route later
    window.open(`/research/${applicationId}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`
          fixed inset-4 md:inset-8 lg:inset-16 z-50
          bg-white dark:bg-slate-900
          rounded-2xl shadow-2xl
          flex flex-col
          transform transition-all duration-200 ease-out
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Research: {company}
              </h2>
              {role && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand button */}
            <button
              onClick={handleExpandToPage}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Open in full page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-hidden">
          <ResearchChat
            applicationId={applicationId}
            company={company}
            role={role}
            jobUrl={jobUrl}
          />
        </div>
      </div>
    </>
  );
}
