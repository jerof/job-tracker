'use client';

import { useState, useEffect, useCallback } from 'react';
import CVGrid from '@/app/components/CVGrid';

interface MasterCV {
  id: string;
  rawText: string;
  updatedAt: string;
}

export default function CVPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [cv, setCV] = useState<MasterCV | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cvText, setCvText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch master CV when editor opens
  const fetchMasterCV = useCallback(async () => {
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

  // Track changes
  useEffect(() => {
    if (cv) {
      setHasChanges(cvText !== cv.rawText);
    } else {
      setHasChanges(cvText.trim().length > 0);
    }
  }, [cvText, cv]);

  // Open editor
  const handleEditMaster = async () => {
    setShowEditor(true);
    await fetchMasterCV();
  };

  const handleAddMaster = () => {
    setShowEditor(true);
    setCV(null);
    setCvText('');
  };

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
        const response = await fetch(`/api/cv/${cv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: cvText }),
        });

        if (!response.ok) throw new Error('Failed to update CV');

        const data = await response.json();
        setCV(data.cv);
        setHasChanges(false);
        setShowEditor(false);
        window.location.reload(); // Refresh to update grid
      } else {
        const response = await fetch('/api/cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: cvText }),
        });

        if (!response.ok) throw new Error('Failed to create CV');

        const data = await response.json();
        setCV(data.cv);
        setHasChanges(false);
        setShowEditor(false);
        window.location.reload(); // Refresh to update grid
      }
    } catch (err) {
      console.error('Error saving CV:', err);
      setError('Failed to save CV. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close
  const handleCloseEditor = () => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    setShowEditor(false);
    setCvText('');
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">CV Library</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage your master CV and tailored versions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <CVGrid
            onEditMaster={handleEditMaster}
            onAddMaster={handleAddMaster}
          />
        </div>
      </div>

      {/* Master CV Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseEditor}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-semibold rounded-md">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  MASTER
                </div>
                <h2 className="font-semibold text-gray-900">
                  {cv ? 'Edit Master CV' : 'Add Master CV'}
                </h2>
              </div>
              <button
                onClick={handleCloseEditor}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <>
                  {/* Error Alert */}
                  {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">CV Content</span>
                    {hasChanges && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                        Unsaved changes
                      </span>
                    )}
                  </div>
                  <textarea
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
                    className="w-full h-96 p-4 text-sm font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 placeholder:text-gray-400"
                  />
                  <div className="mt-2 text-xs text-gray-400">
                    {cvText.length.toLocaleString()} characters
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Your master CV is used as the base for generating tailored CVs
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseEditor}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg shadow-sm shadow-amber-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
