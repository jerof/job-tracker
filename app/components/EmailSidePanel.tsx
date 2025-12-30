'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Email {
  id: string;
  gmailMessageId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  gmailUrl: string;
}

interface EmailDetail extends Email {
  body: string;
}

interface EmailSidePanelProps {
  applicationId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailSidePanel({ applicationId, companyName, isOpen, onClose }: EmailSidePanelProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Animate in when opened
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [isOpen]);

  // Fetch emails when panel opens
  useEffect(() => {
    if (isOpen && applicationId) {
      fetchEmails();
    }
  }, [isOpen, applicationId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    panel.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => panel.removeEventListener('keydown', handleTab);
  }, [isOpen, emails]);

  const fetchEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/applications/${applicationId}/emails`);
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (err) {
      setError('Couldn\'t load emails');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmailDetail = async (gmailMessageId: string) => {
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/emails/${gmailMessageId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch email detail');
      }
      const data = await response.json();
      setEmailDetail(data);
    } catch (err) {
      console.error('Failed to load email detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      // Reset state after close
      setExpandedEmailId(null);
      setEmailDetail(null);
    }, 200);
  }, [onClose]);

  const handleEmailClick = (email: Email) => {
    if (expandedEmailId === email.id) {
      setExpandedEmailId(null);
      setEmailDetail(null);
    } else {
      setExpandedEmailId(email.id);
      fetchEmailDetail(email.gmailMessageId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel - Slide in from right */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-panel-title"
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            {/* Email Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
              </svg>
            </div>
            <div>
              <h2 id="email-panel-title" className="font-semibold text-gray-900 dark:text-white">
                Emails
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{companyName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-2">{error}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Something went wrong while loading emails.</p>
              <button
                onClick={fetchEmails}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && emails.length === 0 && (
            <div className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-2">No emails found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No emails found for this application.
              </p>
            </div>
          )}

          {/* Email List */}
          {!isLoading && !error && emails.length > 0 && (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {emails.map((email) => (
                <div key={email.id}>
                  {/* Email Summary */}
                  <button
                    onClick={() => handleEmailClick(email)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      expandedEmailId === email.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Sender Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm flex-shrink-0">
                        {email.from.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {email.from}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatDate(email.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white font-medium truncate mb-1">
                          {email.subject}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {email.snippet}
                        </p>
                      </div>
                      {/* Expand Indicator */}
                      <svg
                        className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                          expandedEmailId === email.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Email Content */}
                  {expandedEmailId === email.id && (
                    <div className="px-6 pb-4 bg-gray-50 dark:bg-gray-800/50">
                      {/* Full Date */}
                      <div className="flex items-center justify-between mb-4 pt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFullDate(email.date)}
                        </span>
                        <a
                          href={email.gmailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                          </svg>
                          Open in Gmail
                        </a>
                      </div>

                      {/* Email Body */}
                      {isLoadingDetail ? (
                        <div className="space-y-2 animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                        </div>
                      ) : emailDetail ? (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div
                            className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"
                          >
                            {emailDetail.body}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {email.snippet}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {emails.length} email{emails.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
