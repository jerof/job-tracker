'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  OnboardingCard,
  OnboardingTitle,
  OnboardingSubtitle,
  OnboardingFooter,
  OnboardingHelperText,
  TimeIndicator,
} from '../../components/onboarding/OnboardingCard';

export default function AddJobPage() {
  const router = useRouter();
  const [jobUrl, setJobUrl] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);

    // Save job details to localStorage
    localStorage.setItem('onboarding_job', JSON.stringify({
      url: jobUrl,
      company: company || 'Example Company',
      role: role || 'Software Engineer',
    }));

    // Simulate API call for fetching job details / generating CV
    setTimeout(() => {
      router.push('/success');
    }, 2000);
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_job', JSON.stringify({
      url: '',
      company: '',
      role: '',
      skipped: true,
    }));
    router.push('/success');
  };

  const hasInput = jobUrl.trim() || (company.trim() && role.trim());

  return (
    <OnboardingCard>
      <TimeIndicator text="Final step - let's see the magic" />
      <OnboardingTitle>Let&apos;s tailor your first CV</OnboardingTitle>
      <OnboardingSubtitle>
        Paste a job posting link and watch the magic happen. We&apos;ll customize your CV
        to match exactly what they&apos;re looking for.
      </OnboardingSubtitle>

      {/* URL Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <input
          type="url"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          placeholder="https://jobs.lever.co/company/role-abc123"
          className="
            w-full pl-12 pr-4 py-3
            bg-gray-50 border border-gray-200
            rounded-xl text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
            transition-all duration-200
            text-sm
          "
        />
      </div>

      <OnboardingHelperText>
        Works with LinkedIn, Lever, Greenhouse, Workday, and most job boards.
      </OnboardingHelperText>

      {/* Manual entry toggle */}
      <div className="mt-6">
        <button
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="text-gray-500 hover:text-gray-900 text-sm transition-colors flex items-center gap-1"
        >
          <span>Or enter manually</span>
          <motion.svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={{ rotate: showManualEntry ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>

        {/* Manual entry fields */}
        <motion.div
          initial={false}
          animate={{
            height: showManualEntry ? 'auto' : 0,
            opacity: showManualEntry ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pt-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Where are you applying?"
                className="
                  w-full px-4 py-2.5
                  bg-gray-50 border border-gray-200
                  rounded-lg text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
                  transition-all duration-200
                  text-sm
                "
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1.5">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="What's the job title?"
                className="
                  w-full px-4 py-2.5
                  bg-gray-50 border border-gray-200
                  rounded-lg text-gray-900 placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
                  transition-all duration-200
                  text-sm
                "
              />
            </div>
          </div>
        </motion.div>
      </div>

      <OnboardingFooter className="flex items-center justify-between">
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
        >
          Skip for now
        </button>

        <motion.button
          onClick={handleGenerate}
          disabled={!hasInput || isLoading}
          whileHover={hasInput && !isLoading ? { scale: 1.02 } : {}}
          whileTap={hasInput && !isLoading ? { scale: 0.98 } : {}}
          className={`
            px-6 py-2.5
            font-medium rounded-lg
            transition-all duration-200
            flex items-center gap-2
            ${hasInput && !isLoading
              ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/25'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Creating your tailored CV...</span>
            </>
          ) : (
            <>
              <span>Generate tailored CV</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </motion.button>
      </OnboardingFooter>
    </OnboardingCard>
  );
}
