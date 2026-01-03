'use client';

import '../styles/landing.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ProgressIndicator } from '../components/onboarding/ProgressIndicator';

// Map routes to step numbers
const stepMap: Record<string, number> = {
  '/cv-input': 1,
  '/questions': 2,
  '/review': 3,
  '/add-job': 4,
  '/success': 5,
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentStep = stepMap[pathname] || 1;

  // Don't show progress on success page
  const showProgress = pathname !== '/success';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
      {/* Subtle decorative elements */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-gray-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-gray-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />

      {/* Logo */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-1.5 font-semibold text-lg">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M3 18C3 10 7 4 12 4C17 4 21 10 21 18" stroke="url(#logo-gradient-onboarding)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M6 17C6 11 8.5 6.5 12 6.5C15.5 6.5 18 11 18 17" stroke="url(#logo-gradient-onboarding)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 16C9 12 10.5 9 12 9C13.5 9 15 12 15 16" stroke="url(#logo-gradient-onboarding)" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="logo-gradient-onboarding" x1="3" y1="4" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#059669"/>
                <stop offset="1" stopColor="#0F766E"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="text-gray-900">Canopy</span>
        </Link>
      </div>

      {/* Progress indicator */}
      {showProgress && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <ProgressIndicator currentStep={currentStep} totalSteps={4} />
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-lg"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
