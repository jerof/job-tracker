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
    <div className="min-h-screen bg-neutral-950">
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #1E1B4B 0%, #09090B 70%)',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />

      {/* Logo */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold text-lg">
          <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
            <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#6D28D9" />
              </linearGradient>
            </defs>
          </svg>
          <span>JobTracker</span>
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
