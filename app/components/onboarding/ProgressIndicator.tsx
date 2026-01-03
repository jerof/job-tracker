'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1 : 0.85,
              }}
              className="relative flex items-center justify-center"
            >
              <div
                className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-gray-900' : 'bg-gray-300'}
                  ${isCurrent ? 'ring-4 ring-gray-900/10' : ''}
                `}
              />
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gray-900"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}
            </motion.div>
            {step < totalSteps && (
              <div
                className={`
                  w-8 h-0.5 mx-1 rounded-full transition-colors duration-300
                  ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
