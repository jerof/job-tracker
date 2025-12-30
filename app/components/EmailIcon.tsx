'use client';

interface EmailIconProps {
  count: number;
  onClick: () => void;
}

export function EmailIcon({ count, onClick }: EmailIconProps) {
  // Hide completely if no emails
  if (count === 0) {
    return null;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click when clicking email icon
        onClick();
      }}
      className={`
        inline-flex items-center gap-1
        px-1.5 py-0.5 rounded
        text-[11px] font-medium
        bg-slate-100 dark:bg-slate-700
        text-slate-500 dark:text-slate-400
        hover:bg-blue-100 dark:hover:bg-blue-900/40
        hover:text-blue-600 dark:hover:text-blue-400
        transition-colors duration-150
        cursor-pointer
      `}
      title={`${count} linked email${count !== 1 ? 's' : ''}`}
      aria-label={`View ${count} linked email${count !== 1 ? 's' : ''}`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
