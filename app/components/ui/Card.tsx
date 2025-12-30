'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'ghost' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  selected?: boolean;
  children: ReactNode;
}

const variants = {
  default: `
    bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-800
  `,
  ghost: `
    bg-transparent
    border border-transparent
  `,
  elevated: `
    bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-800
    shadow-sm dark:shadow-none
  `,
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      selected = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl
          transition-all duration-150 ease-out
          ${variants[variant]}
          ${paddings[padding]}
          ${
            interactive
              ? `
                cursor-pointer
                hover:border-gray-300 dark:hover:border-gray-700
                hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20
                active:scale-[0.99]
              `
              : ''
          }
          ${
            selected
              ? 'ring-2 ring-blue-500 dark:ring-blue-400 border-transparent'
              : ''
          }
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents for structure
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div
      className={`
        flex items-center justify-between
        pb-4 mb-4
        border-b border-gray-100 dark:border-gray-800
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({ as: Component = 'h3', className = '', children, ...props }: CardTitleProps) {
  return (
    <Component
      className={`
        text-base font-semibold text-gray-900 dark:text-gray-100
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ className = '', children, ...props }: CardDescriptionProps) {
  return (
    <p
      className={`
        text-sm text-gray-500 dark:text-gray-400
        ${className}
      `}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div
      className={`
        flex items-center gap-3
        pt-4 mt-4
        border-t border-gray-100 dark:border-gray-800
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Application-specific card variant
interface ApplicationCardWrapperProps extends CardProps {
  isDragging?: boolean;
}

export const ApplicationCardWrapper = forwardRef<HTMLDivElement, ApplicationCardWrapperProps>(
  ({ isDragging = false, className = '', children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="default"
        padding="sm"
        interactive
        className={`
          ${isDragging ? 'shadow-lg ring-2 ring-blue-500/50 dark:ring-blue-400/50' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

ApplicationCardWrapper.displayName = 'ApplicationCardWrapper';
