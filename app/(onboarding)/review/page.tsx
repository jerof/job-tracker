'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  OnboardingCard,
  OnboardingTitle,
  OnboardingSubtitle,
  OnboardingFooter,
  TimeIndicator,
} from '../../components/onboarding/OnboardingCard';

export default function ReviewPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [masterCV, setMasterCV] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function enhanceCV() {
      try {
        // Get stored CV text and answers from localStorage
        const cvText = localStorage.getItem('onboarding_cv_text') || '';
        const answersJson = localStorage.getItem('onboarding_answers');
        const answers = answersJson ? JSON.parse(answersJson) : {};

        // Call the enhance-cv API with the user's actual data
        const response = await fetch('/api/onboarding/enhance-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cvText,
            answers,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to enhance CV');
        }

        setMasterCV(data.masterCV);
      } catch (err) {
        console.error('Error enhancing CV:', err);
        setError(err instanceof Error ? err.message : 'Failed to enhance CV');

        // Fallback: show the original CV if enhancement fails
        const originalCV = localStorage.getItem('onboarding_cv_text') || '';
        if (originalCV.trim()) {
          setMasterCV(originalCV);
        }
      } finally {
        setIsLoading(false);
      }
    }

    enhanceCV();
  }, []);

  const handleContinue = () => {
    localStorage.setItem('onboarding_master_cv', masterCV);
    router.push('/add-job');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    localStorage.setItem('onboarding_master_cv', masterCV);
  };

  if (isLoading) {
    return (
      <OnboardingCard>
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full mb-4"
            style={{ borderWidth: 3 }}
          />
          <p className="text-white text-lg font-medium">Crafting your enhanced CV...</p>
          <p className="text-neutral-400 text-sm mt-2">This usually takes a few seconds</p>
        </div>
      </OnboardingCard>
    );
  }

  return (
    <OnboardingCard className="max-w-2xl">
      <TimeIndicator text="Quick review, then the fun part" />
      <OnboardingTitle>Your enhanced CV</OnboardingTitle>
      <OnboardingSubtitle>
        {error
          ? 'We couldn\'t enhance your CV automatically. Here\'s your original - you can edit it below.'
          : 'This is your master CV. We\'ve organized everything and filled in the gaps. You can edit anytime, and we\'ll tailor it for each job you apply to.'}
      </OnboardingSubtitle>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* CV Preview/Edit */}
      <div className="relative">
        {isEditing ? (
          <textarea
            value={masterCV}
            onChange={(e) => setMasterCV(e.target.value)}
            className="
              w-full h-96 px-4 py-4
              bg-white/5 border border-white/10
              rounded-xl text-white font-mono text-sm
              focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50
              resize-none transition-all duration-200
              leading-relaxed
            "
            autoFocus
          />
        ) : (
          <div className="
            bg-white/5 border border-white/10
            rounded-xl p-4 max-h-96 overflow-y-auto
          ">
            <pre className="text-white font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {masterCV}
            </pre>
          </div>
        )}
      </div>

      {/* Encouragement message - only show when no error */}
      {!error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex items-center justify-center gap-2 text-success-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">Nice work! Your CV is looking strong.</span>
        </motion.div>
      )}

      <OnboardingFooter className="flex items-center justify-between">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="text-neutral-500 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleSaveEdit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="
                px-6 py-2.5
                bg-gradient-to-r from-primary-500 to-primary-600
                text-white font-medium rounded-lg
                hover:from-primary-600 hover:to-primary-700
                transition-all duration-200
                shadow-lg shadow-primary-500/25
              "
            >
              Save changes
            </motion.button>
          </>
        ) : (
          <>
            <button
              onClick={handleEdit}
              className="
                px-4 py-2
                text-neutral-400 hover:text-white
                border border-white/10 hover:border-white/20
                rounded-lg text-sm transition-all duration-200
                flex items-center gap-2
              "
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit CV
            </button>

            <motion.button
              onClick={handleContinue}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="
                px-6 py-2.5
                bg-gradient-to-r from-primary-500 to-primary-600
                text-white font-medium rounded-lg
                hover:from-primary-600 hover:to-primary-700
                transition-all duration-200
                shadow-lg shadow-primary-500/25
                flex items-center gap-2
              "
            >
              <span>Looks good!</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </>
        )}
      </OnboardingFooter>
    </OnboardingCard>
  );
}
