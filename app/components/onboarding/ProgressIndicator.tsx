'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
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
                backgroundColor: isCompleted || isCurrent ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)',
              }}
              className="relative flex items-center justify-center"
            >
              <div
                className={`
                  w-2.5 h-2.5 rounded-full transition-all duration-300
                  ${isCompleted || isCurrent ? 'bg-primary-500' : 'bg-white/10'}
                  ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}
                `}
              />
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary-500"
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
                  ${isCompleted ? 'bg-primary-500' : 'bg-white/10'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
