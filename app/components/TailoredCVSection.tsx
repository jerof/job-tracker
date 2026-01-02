'use client';

import { useState, useRef } from 'react';

interface TailoredCVSectionProps {
  applicationId: string;
  company: string;
  jobUrl: string | null;
  tailoredCvUrl: string | null;
  tailoredCvFilename: string | null;
  tailoredCvGeneratedAt: string | null;
  hasMasterCV: boolean;
  onCVGenerated: (data: { url: string; filename: string; generatedAt: string }) => void;
}

type GenerationPhase = 'idle' | 'analyzing' | 'generating';

export function TailoredCVSection({
  applicationId,
  company,
  jobUrl,
  tailoredCvUrl,
  tailoredCvFilename,
  tailoredCvGeneratedAt,
  hasMasterCV,
  onCVGenerated,
}: TailoredCVSectionProps) {
  const [phase, setPhase] = useState<GenerationPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleGenerate = async (regenerateFeedback?: string) => {
    setError(null);
    setPhase('analyzing');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPhase('generating');

      const response = await fetch(`/api/applications/${applicationId}/tailored-cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: regenerateFeedback || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate CV');
      }

      const data = await response.json();
      onCVGenerated({
        url: data.pdfUrl,
        filename: data.filename,
        generatedAt: data.generatedAt,
      });

      setShowFeedback(false);
      setFeedback('');
      setPhase('idle');
    } catch (err) {
      console.error('Error generating CV:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate CV');
      setPhase('idle');
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      handleGenerate(feedback.trim());
    }
  };

  const isGenerating = phase !== 'idle';

  // Empty state: No master CV
  if (!hasMasterCV) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Tailored CV</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Add your master CV to generate tailored versions
            </p>
            <a
              href="/cv"
              className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              Add CV
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Empty state: No job URL
  if (!jobUrl) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Tailored CV</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Add a job URL above to generate a tailored CV
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {phase === 'analyzing' ? 'Analyzing job posting...' : 'Generating your CV...'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {phase === 'analyzing'
                ? 'Extracting requirements and keywords'
                : `Tailoring for ${company}`}
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: phase === 'analyzing' ? '40%' : '80%' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Generation failed</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
              <button
                onClick={() => { setError(null); handleGenerate(); }}
                className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-colors"
              >
                Try again →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Has CV state
  if (tailoredCvUrl) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="group relative">
          {/* CV Card */}
          <div className="flex items-center gap-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            {/* PDF Preview */}
            <div className="w-12 h-14 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
              <span className="text-[10px] font-bold text-white tracking-wide">PDF</span>
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {tailoredCvFilename || `CV for ${company}`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {tailoredCvGeneratedAt ? formatDate(tailoredCvGeneratedAt) : 'Just now'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <a
                href={tailoredCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all"
                title="Download"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </a>
              <button
                onClick={() => { setShowFeedback(true); setTimeout(() => inputRef.current?.focus(), 0); }}
                className="p-2 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all"
                title="Regenerate with feedback"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </div>

          {/* Feedback input */}
          {showFeedback && (
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                How should we improve it?
              </p>
              <form onSubmit={handleFeedbackSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., Emphasize leadership, add more metrics..."
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!feedback.trim()}
                  className="px-3 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Update
                </button>
              </form>
              <button
                onClick={() => { setShowFeedback(false); setFeedback(''); }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Ready state: Can generate
  return (
    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Tailored CV</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Optimized for {company}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleGenerate()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg shadow-sm shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
          Generate
        </button>
      </div>
    </div>
  );
}
