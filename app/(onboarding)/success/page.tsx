'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OnboardingCard } from '../../components/onboarding/OnboardingCard';

// Confetti component - rendered only on client side
function Confetti() {
  const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#60A5FA', '#34D399', '#FBBF24'];
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  if (windowHeight === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        // Generate random values for each confetti piece
        const leftPos = `${(i * 17 + 7) % 100}%`;
        const rotateAmount = ((i * 23) % 720) - 360;
        const duration = 2 + (i % 3);
        const delay = (i % 10) * 0.05;

        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: colors[i % colors.length],
              left: leftPos,
              top: -20,
            }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{
              y: windowHeight + 100,
              rotate: rotateAmount,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

// Helper to get initial job details from localStorage (safe for SSR)
function getInitialJobDetails(): { company: string; role: string } | null {
  if (typeof window === 'undefined') return null;

  const savedJob = localStorage.getItem('onboarding_job');
  if (savedJob) {
    const job = JSON.parse(savedJob);
    if (!job.skipped) {
      return {
        company: job.company || 'Example Company',
        role: job.role || 'Software Engineer',
      };
    }
  }
  return null;
}

export default function SuccessPage() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize job details on mount
  const [jobDetails, setJobDetails] = useState<{ company: string; role: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    setJobDetails(getInitialJobDetails());

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    // Placeholder for PDF download functionality
    alert('PDF download will be implemented with the API integration.');
  };

  const handleGoToDashboard = () => {
    // Mark onboarding as complete
    localStorage.setItem('onboarding_completed', 'true');
    router.push('/dashboard');
  };

  return (
    <>
      {mounted && showConfetti && <Confetti />}

      <OnboardingCard className="text-center">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-success-400 to-success-600 rounded-full flex items-center justify-center"
        >
          <motion.svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </motion.svg>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          Your tailored CV is ready!
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-8"
        >
          {jobDetails ? (
            <>
              We&apos;ve customized your CV for{' '}
              <span className="text-gray-900 font-medium">{jobDetails.role}</span> at{' '}
              <span className="text-gray-900 font-medium">{jobDetails.company}</span>.
              <br />
              Keywords matched, experience reordered, ready to impress.
            </>
          ) : (
            <>
              Your master CV is saved and ready. Add a job posting anytime to get a tailored version.
            </>
          )}
        </motion.p>

        {/* PDF Preview placeholder */}
        {jobDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="
              bg-gray-50 border border-gray-200
              rounded-xl p-6 mb-4
              relative overflow-hidden
            ">
              {/* Simulated PDF preview */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-16 bg-red-50 rounded flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-gray-900 font-medium mb-1">
                    CV_Tailored_{jobDetails.company.replace(/\s+/g, '_')}.pdf
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Customized for {jobDetails.role}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full">
                      Skills matched
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                      Experience reordered
                    </span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
                      Keywords optimized
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Download button */}
            <motion.button
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="
                w-full px-6 py-3
                bg-gray-900 text-white font-medium rounded-xl
                hover:bg-gray-800
                transition-all duration-200
                flex items-center justify-center gap-2
                shadow-lg shadow-gray-900/25
              "
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </motion.button>
          </motion.div>
        )}

        {/* Go to dashboard button */}
        <motion.button
          onClick={handleGoToDashboard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full px-6 py-3
            font-medium rounded-xl
            transition-all duration-200
            flex items-center justify-center gap-2
            ${jobDetails
              ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/25'
            }
          `}
        >
          Go to dashboard
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>

        {/* Share prompt */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-gray-500 text-sm"
        >
          Love it? Share Canopy with a friend who&apos;s job hunting.
        </motion.p>
      </OnboardingCard>
    </>
  );
}
