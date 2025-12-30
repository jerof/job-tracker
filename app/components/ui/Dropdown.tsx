'use client';

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  KeyboardEvent,
  MouseEvent,
} from 'react';

// Context for dropdown state
interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('Dropdown components must be used within a Dropdown');
  }
  return context;
}

// Main dropdown container
interface DropdownProps {
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({ children, onOpenChange }: DropdownProps) {
  const [isOpen, setIsOpenState] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setIsOpen = useCallback(
    (open: boolean) => {
      setIsOpenState(open);
      onOpenChange?.(open);
      if (!open) {
        setActiveIndex(-1);
      }
    },
    [onOpenChange]
  );

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, setIsOpen]);

  return (
    <DropdownContext.Provider
      value={{ isOpen, setIsOpen, activeIndex, setActiveIndex, triggerRef, menuRef }}
    >
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

// Trigger button
interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export function DropdownTrigger({ children, className = '', asChild = false }: DropdownTriggerProps) {
  const { isOpen, setIsOpen, triggerRef, menuRef, setActiveIndex } = useDropdown();

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex(0);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      // Focus last item
      const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
      if (items) {
        setActiveIndex(items.length - 1);
      }
    }
  };

  if (asChild) {
    return <>{children}</>;
  }

  return (
    <button
      ref={triggerRef}
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={handleKeyDown}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      className={`
        inline-flex items-center justify-center gap-2
        px-3 py-2 text-sm font-medium rounded-lg
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        text-gray-700 dark:text-gray-200
        hover:bg-gray-50 dark:hover:bg-gray-800
        hover:border-gray-300 dark:hover:border-gray-600
        transition-colors duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${className}
      `}
    >
      {children}
      <svg
        className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// Menu container
interface DropdownMenuProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  className?: string;
}

export function DropdownMenu({
  children,
  align = 'start',
  side = 'bottom',
  className = '',
}: DropdownMenuProps) {
  const { isOpen, menuRef, activeIndex, setActiveIndex, setIsOpen, triggerRef } = useDropdown();
  const itemsRef = useRef<HTMLElement[]>([]);

  const alignments = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sides = {
    top: 'bottom-full mb-1',
    bottom: 'top-full mt-1',
  };

  // Focus active item
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && itemsRef.current[activeIndex]) {
      itemsRef.current[activeIndex].focus();
    }
  }, [isOpen, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])');
    if (!items) return;

    const itemCount = items.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((activeIndex + 1) % itemCount);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((activeIndex - 1 + itemCount) % itemCount);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(itemCount - 1);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      onKeyDown={handleKeyDown}
      className={`
        absolute z-50
        min-w-[180px] w-max
        py-1
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        rounded-xl shadow-lg dark:shadow-black/30
        animate-in fade-in zoom-in-95 duration-150
        ${alignments[align]}
        ${sides[side]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Menu item
interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
  shortcut?: string;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  disabled = false,
  destructive = false,
  icon,
  shortcut,
  className = '',
}: DropdownItemProps) {
  const { setIsOpen } = useDropdown();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2
        px-3 py-2 text-sm text-left
        transition-colors duration-100
        focus:outline-none
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : destructive
            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800'
        }
        ${className}
      `}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <kbd className="ml-auto text-xs text-gray-400 dark:text-gray-500 font-mono">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

// Separator
export function DropdownSeparator() {
  return <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" role="separator" />;
}

// Label for grouping items
interface DropdownLabelProps {
  children: ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className = '' }: DropdownLabelProps) {
  return (
    <div
      className={`
        px-3 py-1.5 text-xs font-medium
        text-gray-500 dark:text-gray-400
        uppercase tracking-wider
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Checkbox item
interface DropdownCheckboxItemProps {
  children: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function DropdownCheckboxItem({
  children,
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}: DropdownCheckboxItemProps) {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2
        px-3 py-2 text-sm text-left
        transition-colors duration-100
        focus:outline-none
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800'
        }
        ${className}
      `}
    >
      <span
        className={`
          w-4 h-4 flex-shrink-0 rounded border
          flex items-center justify-center
          transition-colors duration-150
          ${
            checked
              ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
              : 'border-gray-300 dark:border-gray-600'
          }
        `}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  );
}
