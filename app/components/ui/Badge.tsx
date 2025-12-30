'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'applied' | 'interviewing' | 'offer' | 'closed' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: `
    bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300
  `,
  applied: `
    bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400
  `,
  interviewing: `
    bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
  `,
  offer: `
    bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400
  `,
  closed: `
    bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400
  `,
  success: `
    bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400
  `,
  warning: `
    bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400
  `,
  danger: `
    bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400
  `,
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400 dark:bg-gray-500',
  applied: 'bg-blue-500 dark:bg-blue-400',
  interviewing: 'bg-amber-500 dark:bg-amber-400',
  offer: 'bg-purple-500 dark:bg-purple-400',
  closed: 'bg-gray-400 dark:bg-gray-500',
  success: 'bg-emerald-500 dark:bg-emerald-400',
  warning: 'bg-amber-500 dark:bg-amber-400',
  danger: 'bg-red-500 dark:bg-red-400',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
};

const dotSizes: Record<BadgeSize, string> = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

const iconSizes: Record<BadgeSize, string> = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
};

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full
        transition-colors duration-150
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`rounded-full ${dotColors[variant]} ${dotSizes[size]}`} />
      )}
      {icon && <span className={iconSizes[size]}>{icon}</span>}
      {children}
    </span>
  );
}

// Convenience components for job application statuses
export function StatusBadge({
  status,
  closeReason,
  size = 'md',
}: {
  status: 'applied' | 'interviewing' | 'offer' | 'closed';
  closeReason?: 'rejected' | 'withdrawn' | 'ghosted' | 'accepted' | null;
  size?: BadgeSize;
}) {
  if (status === 'closed' && closeReason) {
    const reasonVariants: Record<string, BadgeVariant> = {
      rejected: 'danger',
      withdrawn: 'default',
      ghosted: 'warning',
      accepted: 'success',
    };

    const reasonLabels: Record<string, string> = {
      rejected: 'Rejected',
      withdrawn: 'Withdrawn',
      ghosted: 'Ghosted',
      accepted: 'Accepted',
    };

    return (
      <Badge variant={reasonVariants[closeReason]} size={size} dot>
        {reasonLabels[closeReason]}
      </Badge>
    );
  }

  const statusLabels: Record<string, string> = {
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    closed: 'Closed',
  };

  return (
    <Badge variant={status as BadgeVariant} size={size} dot>
      {statusLabels[status]}
    </Badge>
  );
}

// Count badge for column headers
export function CountBadge({ count, className = '' }: { count: number; className?: string }) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[1.25rem] h-5 px-1.5
        text-xs font-medium
        bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400
        rounded-full
        ${className}
      `}
    >
      {count}
    </span>
  );
}
