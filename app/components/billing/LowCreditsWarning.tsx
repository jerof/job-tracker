'use client';

import { useState } from 'react';

interface LowCreditsWarningProps {
  credits: number;
  onBuyClick?: () => void;
  variant?: 'banner' | 'inline' | 'toast';
}

function WarningIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function getMessage(credits: number): string {
  if (credits === 0) {
    return "You're out of credits! Buy more to generate CVs.";
  }
  if (credits === 1) {
    return 'Only 1 credit left!';
  }
  return 'Running low on credits';
}

export function LowCreditsWarning({
  credits,
  onBuyClick,
  variant = 'banner',
}: LowCreditsWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show when credits <= 3
  if (credits > 3 || isDismissed) {
    return null;
  }

  const message = getMessage(credits);
  const isUrgent = credits === 0;

  // Banner variant - full-width yellow/amber bar
  if (variant === 'banner') {
    return (
      <div
        className={`
          w-full px-4 py-3
          ${isUrgent
            ? 'bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800'
            : 'bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800'
          }
        `}
        role="alert"
        data-testid="low-credits-warning"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <WarningIcon
              className={`w-5 h-5 shrink-0 ${
                isUrgent
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
            <p
              className={`text-sm font-medium ${
                isUrgent
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-amber-800 dark:text-amber-200'
              }`}
            >
              {message}
            </p>
          </div>
          {onBuyClick && (
            <button
              onClick={onBuyClick}
              className={`
                px-4 py-1.5 text-sm font-semibold rounded-lg
                transition-colors duration-150
                ${isUrgent
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                }
              `}
            >
              Buy Credits
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inline variant - smaller, for embedding in components
  if (variant === 'inline') {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
          ${isUrgent
            ? 'bg-red-50 dark:bg-red-900/20'
            : 'bg-amber-50 dark:bg-amber-900/20'
          }
        `}
        role="alert"
      >
        <WarningIcon
          className={`w-4 h-4 shrink-0 ${
            isUrgent
              ? 'text-red-500 dark:text-red-400'
              : 'text-amber-500 dark:text-amber-400'
          }`}
        />
        <span
          className={`text-sm ${
            isUrgent
              ? 'text-red-700 dark:text-red-300'
              : 'text-amber-700 dark:text-amber-300'
          }`}
        >
          {message}
        </span>
        {onBuyClick && (
          <button
            onClick={onBuyClick}
            className={`
              text-sm font-medium underline underline-offset-2
              transition-colors duration-150
              ${isUrgent
                ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                : 'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300'
              }
            `}
          >
            Buy more
          </button>
        )}
      </div>
    );
  }

  // Toast variant - floating notification style, dismissible
  if (variant === 'toast') {
    return (
      <div
        className={`
          fixed bottom-4 right-4 z-50
          flex items-start gap-3 p-4 max-w-sm
          rounded-xl shadow-lg border
          animate-in slide-in-from-bottom-4 fade-in duration-300
          ${isUrgent
            ? 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-800'
            : 'bg-amber-50 dark:bg-amber-900/90 border-amber-200 dark:border-amber-800'
          }
        `}
        role="alert"
      >
        <WarningIcon
          className={`w-5 h-5 shrink-0 mt-0.5 ${
            isUrgent
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        />
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${
              isUrgent
                ? 'text-red-800 dark:text-red-200'
                : 'text-amber-800 dark:text-amber-200'
            }`}
          >
            {message}
          </p>
          {onBuyClick && (
            <button
              onClick={onBuyClick}
              className={`
                mt-2 text-sm font-semibold
                transition-colors duration-150
                ${isUrgent
                  ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                  : 'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300'
                }
              `}
            >
              Buy Credits →
            </button>
          )}
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className={`
            p-1 rounded-lg shrink-0
            transition-colors duration-150
            ${isUrgent
              ? 'text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/50'
              : 'text-amber-500 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-800/50'
            }
          `}
          aria-label="Dismiss"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}
