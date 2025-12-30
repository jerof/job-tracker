'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: {
    input: 'px-2.5 py-1.5 text-xs',
    label: 'text-xs mb-1',
    icon: 'w-3.5 h-3.5',
    iconPadding: 'pl-8',
  },
  md: {
    input: 'px-3 py-2 text-sm',
    label: 'text-sm mb-1.5',
    icon: 'w-4 h-4',
    iconPadding: 'pl-9',
  },
  lg: {
    input: 'px-4 py-2.5 text-base',
    label: 'text-base mb-2',
    icon: 'w-5 h-5',
    iconPadding: 'pl-11',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;
    const sizeStyles = sizes[size];

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className={`
              block font-medium text-gray-700 dark:text-gray-300
              ${sizeStyles.label}
            `}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={`
                absolute left-3 top-1/2 -translate-y-1/2
                text-gray-400 dark:text-gray-500
                pointer-events-none
                ${sizeStyles.icon}
              `}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={`
              w-full rounded-lg
              bg-white dark:bg-gray-900
              border transition-all duration-150 ease-out
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800
              ${sizeStyles.input}
              ${leftIcon ? sizeStyles.iconPadding : ''}
              ${rightIcon ? 'pr-9' : ''}
              ${
                error
                  ? 'border-red-300 dark:border-red-500 text-red-900 dark:text-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
              }
            `}
            {...props}
          />

          {rightIcon && (
            <div
              className={`
                absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 dark:text-gray-500
                ${sizeStyles.icon}
              `}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, disabled, className = '', id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).substring(7)}`;

    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`
            w-full px-3 py-2 text-sm rounded-lg
            bg-white dark:bg-gray-900
            border transition-all duration-150 ease-out
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800
            resize-none
            ${
              error
                ? 'border-red-300 dark:border-red-500 text-red-900 dark:text-red-400 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400'
            }
          `}
          {...props}
        />

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
