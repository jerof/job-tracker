'use client';

import { useState, useEffect, useCallback } from 'react';

interface CreditBalanceData {
  credits: number;
  totalPurchased: number;
  lastFreeReset: string;
}

interface CreditBalanceProps {
  variant?: 'sidebar' | 'header' | 'compact';
  showBuyButton?: boolean;
  onBuyClick?: () => void;
}

// Coin icon matching the Linear-style icons in SideNav
const CoinIcon = ({ className }: { className?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="9" cy="9" r="6.75" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M9 5.25V12.75M6.75 7.5H10.5C11.3284 7.5 12 8.00736 12 8.625C12 9.24264 11.3284 9.75 10.5 9.75H6.75M6.75 9.75H10.875C11.4963 9.75 12 10.2537 12 10.875C12 11.4963 11.4963 12 10.875 12H6.75"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

// Skeleton loader for loading state
function CreditSkeleton({ variant }: { variant: 'sidebar' | 'header' | 'compact' }) {
  if (variant === 'compact') {
    return <div className="h-4 w-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />;
  }

  if (variant === 'header') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    );
  }

  // sidebar variant
  return (
    <div className="flex items-center justify-between px-2.5 py-2 w-full">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function CreditBalance({
  variant = 'sidebar',
  showBuyButton = true,
  onBuyClick
}: CreditBalanceProps) {
  const [balance, setBalance] = useState<CreditBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch('/api/credits');

      if (!response.ok) {
        if (response.status === 401) {
          setError('Not logged in');
          return;
        }
        throw new Error('Failed to fetch credits');
      }

      const data = await response.json();
      setBalance(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Could not load credits');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Re-fetch when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchCredits();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCredits]);

  // Determine color based on credit count
  const getColorClasses = (credits: number) => {
    if (credits === 0) {
      return {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        icon: 'text-red-500 dark:text-red-400',
      };
    }
    if (credits <= 2) {
      return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        icon: 'text-amber-500 dark:text-amber-400',
      };
    }
    return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'text-emerald-500 dark:text-emerald-400',
    };
  };

  // Show loading skeleton
  if (isLoading) {
    return <CreditSkeleton variant={variant} />;
  }

  // Show error state
  if (error) {
    if (variant === 'compact') {
      return <span className="text-slate-400 dark:text-slate-500 text-xs">--</span>;
    }
    return null; // Hide completely on error for other variants
  }

  const credits = balance?.credits ?? 0;
  const colors = getColorClasses(credits);

  // Compact variant - just the number
  if (variant === 'compact') {
    return (
      <span className={`text-sm font-medium ${colors.text}`}>
        {credits}
      </span>
    );
  }

  // Header variant - compact with icon
  if (variant === 'header') {
    return (
      <button
        onClick={onBuyClick}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-md
          ${colors.bg}
          hover:opacity-80
          transition-opacity
        `}
        title={`${credits} credits remaining`}
      >
        <CoinIcon className={`w-4 h-4 ${colors.icon}`} />
        <span className={`text-sm font-medium ${colors.text}`}>
          {credits}
        </span>
      </button>
    );
  }

  // Sidebar variant - full width with optional buy button
  return (
    <div className="w-full" data-testid="credit-balance">
      <div
        className={`
          flex items-center justify-between
          px-2.5 py-2
          rounded-md
          ${colors.bg}
        `}
        data-testid="credit-balance-wrapper"
      >
        <div className="flex items-center gap-2">
          <CoinIcon className={`w-[18px] h-[18px] flex-shrink-0 ${colors.icon}`} />
          <span className={`text-[13px] font-medium ${colors.text}`}>
            {credits} {credits === 1 ? 'credit' : 'credits'} remaining
          </span>
        </div>
      </div>

      {showBuyButton && (
        <button
          onClick={onBuyClick}
          data-testid="buy-credits-button"
          className={`
            mt-1.5 w-full
            px-2.5 py-1.5
            text-[12px] font-medium
            text-violet-600 dark:text-violet-400
            bg-violet-50 dark:bg-violet-900/20
            hover:bg-violet-100 dark:hover:bg-violet-900/30
            rounded-md
            transition-colors
          `}
        >
          Buy more credits
        </button>
      )}
    </div>
  );
}
