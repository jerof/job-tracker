'use client';

import { motion } from 'framer-motion';

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        className={`text-sm font-medium transition-colors ${
          !isAnnual ? 'text-white' : 'text-neutral-500'
        }`}
      >
        Monthly
      </span>

      {/* Toggle Switch */}
      <button
        onClick={() => onToggle(!isAnnual)}
        className={`
          relative w-14 h-7 rounded-full transition-colors duration-300
          ${isAnnual ? 'bg-primary-500' : 'bg-neutral-700'}
        `}
        aria-label={isAnnual ? 'Switch to monthly billing' : 'Switch to annual billing'}
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md"
          animate={{ left: isAnnual ? '1.75rem' : '0.125rem' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>

      <span
        className={`text-sm font-medium transition-colors ${
          isAnnual ? 'text-white' : 'text-neutral-500'
        }`}
      >
        Annual
      </span>

      {/* Savings Badge */}
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isAnnual ? 1 : 0.5, scale: isAnnual ? 1 : 0.9 }}
        className={`
          ml-2 px-2.5 py-1 text-xs font-semibold rounded-full
          ${isAnnual
            ? 'bg-success-500/20 text-success-400 border border-success-500/30'
            : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
          }
        `}
      >
        Save up to 36%
      </motion.span>
    </div>
  );
}
