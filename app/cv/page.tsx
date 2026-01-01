'use client';

import { useState, useEffect, useCallback } from 'react';
import { CV } from '@/lib/cv.types';
import { Button } from '@/app/components/ui/Button';

// Icons
const DocumentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8C12 5.79086 13.7909 4 16 4H28.3431C29.404 4 30.4214 4.42143 31.1716 5.17157L39.8284 13.8284C40.5786 14.5786 41 15.596 41 16.6569V40C41 42.2091 39.2091 44 37 44H16C13.7909 44 12 42.2091 12 40V8Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M28 4V12C28 14.2091 29.7909 16 32 16H40" stroke="currentColor" strokeWidth="2"/>
    <path d="M18 26H34M18 34H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 3.5H5C3.89543 3.5 3 4.39543 3 5.5V16C3 17.1046 3.89543 18 5 18H15C16.1046 18 17 17.1046 17 16V5.5C17 4.39543 16.1046 3.5 15 3.5H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 2.5C7 1.94772 7.44772 1.5 8 1.5H12C12.5523 1.5 13 1.94772 13 2.5V4.5C13 5.05228 12.5523 5.5 12 5.5H8C7.44772 5.5 7 5.05228 7 4.5V2.5Z" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4.5H15M6.75 4.5V3C6.75 2.17157 7.42157 1.5 8.25 1.5H9.75C10.5784 1.5 11.25 2.17157 11.25 3V4.5M5.25 7.5V14.25C5.25 15.0784 5.92157 15.75 6.75 15.75H11.25C12.0784 15.75 12.75 15.0784 12.75 14.25V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.75 15.75L9 13.5L11.25 15.75M9 9V13.5M15.75 8.25V14.25C15.75 15.0784 15.0784 15.75 14.25 15.75H3.75C2.92157 15.75 2.25 15.0784 2.25 14.25V3.75C2.25 2.92157 2.92157 2.25 3.75 2.25H11.25L15.75 6.75V8.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function CVPage() {
  const [cv, setCV] = useState<CV | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvText, setCvText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch CV on mount
  const fetchCV = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/cv');

      if (!response.ok) {
        throw new Error('Failed to fetch CV');
      }

      const data = await response.json();
      setCV(data.cv);
      setCvText(data.cv?.rawText || '');
    } catch (err) {
      console.error('Error fetching CV:', err);
      setError('Failed to load CV. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCV();
  }, [fetchCV]);

  // Track changes
  useEffect(() => {
    if (cv) {
      setHasChanges(cvText !== cv.rawText);
    } else {
      setHasChanges(cvText.trim().length > 0);
    }
  }, [cvText, cv]);

  // Handle save
  const handleSave = async () => {
    if (!cvText.trim()) {
      setError('Please enter some CV content');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (cv) {
        // Update existing CV
        const response = await fetch(`/api/cv/${cv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: cvText }),
        });

        if (!response.ok) throw new Error('Failed to update CV');

        const data = await response.json();
        setCV(data.cv);
        setHasChanges(false);
      } else {
        // Create new CV
        const response = await fetch('/api/cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: cvText }),
        });

        if (!response.ok) throw new Error('Failed to create CV');

        const data = await response.json();
        setCV(data.cv);
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Error saving CV:', err);
      setError('Failed to save CV. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!cv) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/cv/${cv.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete CV');

      setCV(null);
      setCvText('');
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting CV:', err);
      setError('Failed to delete CV. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-950">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </header>
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4" />
              <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                CV
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {cv ? 'Edit your CV content below' : 'Paste your CV content to get started'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {cv && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-slate-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  <TrashIcon />
                  <span className="hidden sm:inline ml-1.5">Delete</span>
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                isLoading={isSaving}
                data-testid="cv-save-button"
              >
                <SaveIcon />
                <span className="ml-1.5">{cv ? 'Save Changes' : 'Save CV'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!cv && !cvText && (
            <div data-testid="cv-empty-state" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <DocumentIcon />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No CV uploaded yet
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Paste your CV content below to save it. You can edit and update it anytime.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <ClipboardIcon />
                  <span>Paste text in the editor below</span>
                </div>
              </div>
            </div>
          )}

          {/* CV Editor Card */}
          <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden ${!cv && !cvText ? 'mt-6' : ''}`}>
            {/* Editor Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  CV Content
                </span>
                {hasChanges && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    Unsaved changes
                  </span>
                )}
              </div>
              {cv && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Last updated: {new Date(cv.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Editor */}
            <div className="p-4">
              <textarea
                data-testid="cv-textarea"
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV content here...

Example:
John Doe
Software Engineer

EXPERIENCE
Senior Developer at TechCorp (2020-Present)
- Led development of core product features
- Managed team of 5 engineers

EDUCATION
BS in Computer Science, MIT (2016)"
                className="w-full h-[500px] p-4 text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 dark:focus:border-violet-400 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Character Count */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {cvText.length.toLocaleString()} characters
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
              Tips for a great CV
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>Keep it concise - 1-2 pages is ideal</li>
              <li>Include quantifiable achievements where possible</li>
              <li>Tailor your CV for each job application</li>
              <li>Proofread carefully before sending</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Delete CV?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              This action cannot be undone. Your CV content will be permanently deleted.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
