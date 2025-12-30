'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  shortcut?: string;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: `
    bg-blue-600 text-white
    hover:bg-blue-700 active:bg-blue-800
    dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700
    shadow-sm hover:shadow
    focus-visible:ring-blue-500
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-200
    hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100
    dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700
    dark:hover:bg-gray-750 dark:hover:border-gray-600 dark:active:bg-gray-700
    shadow-sm hover:shadow
    focus-visible:ring-gray-400
  `,
  ghost: `
    bg-transparent text-gray-600
    hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200
    dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700
    focus-visible:ring-gray-400
  `,
  danger: `
    bg-red-600 text-white
    hover:bg-red-700 active:bg-red-800
    dark:bg-red-500 dark:hover:bg-red-600 dark:active:bg-red-700
    shadow-sm hover:shadow
    focus-visible:ring-red-500
  `,
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2.5',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      shortcut,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-medium rounded-lg
          transition-all duration-150 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          dark:focus-visible:ring-offset-gray-900
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          select-none
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <svg
            className={`animate-spin ${iconSizes[size]}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : leftIcon ? (
          <span className={iconSizes[size]}>{leftIcon}</span>
        ) : null}

        {children}

        {rightIcon && !isLoading && (
          <span className={iconSizes[size]}>{rightIcon}</span>
        )}

        {shortcut && !isLoading && (
          <kbd
            className={`
              ml-1.5 px-1.5 py-0.5 text-xs font-mono rounded
              bg-black/10 dark:bg-white/10
              ${variant === 'primary' || variant === 'danger' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}
            `}
          >
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
