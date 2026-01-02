'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface OnboardingCardProps {
  children: ReactNode;
  className?: string;
}

export function OnboardingCard({ children, className = '' }: OnboardingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`
        bg-neutral-900/80 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        p-8
        shadow-2xl shadow-black/20
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

// Helper components for consistent styling
interface OnboardingTitleProps {
  children: ReactNode;
}

export function OnboardingTitle({ children }: OnboardingTitleProps) {
  return (
    <h1 className="text-2xl font-bold text-white mb-2 text-center">
      {children}
    </h1>
  );
}

interface OnboardingSubtitleProps {
  children: ReactNode;
}

export function OnboardingSubtitle({ children }: OnboardingSubtitleProps) {
  return (
    <p className="text-neutral-400 text-center mb-6">
      {children}
    </p>
  );
}

interface OnboardingFooterProps {
  children: ReactNode;
  className?: string;
}

export function OnboardingFooter({ children, className = '' }: OnboardingFooterProps) {
  return (
    <div className={`mt-8 pt-6 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}

interface OnboardingHelperTextProps {
  children: ReactNode;
}

export function OnboardingHelperText({ children }: OnboardingHelperTextProps) {
  return (
    <p className="text-sm text-neutral-500 mt-3 text-center">
      {children}
    </p>
  );
}

// Time indicator badge
interface TimeIndicatorProps {
  text: string;
}

export function TimeIndicator({ text }: TimeIndicatorProps) {
  return (
    <div className="flex justify-center mb-4">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {text}
      </span>
    </div>
  );
}
