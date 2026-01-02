'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CreditBalance } from './billing/CreditBalance';
import { BuyCreditsModal } from './billing/BuyCreditsModal';

// Icons - clean, 18x18 Linear-style with thinner strokes
const Icons = {
  jobs: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4.5V3C6 2.17157 6.67157 1.5 7.5 1.5H10.5C11.3284 1.5 12 2.17157 12 3V4.5M2.25 6.75C2.25 5.92157 2.92157 5.25 3.75 5.25H14.25C15.0784 5.25 15.75 5.92157 15.75 6.75V14.25C15.75 15.0784 15.0784 15.75 14.25 15.75H3.75C2.92157 15.75 2.25 15.0784 2.25 14.25V6.75Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      <path d="M2.25 9.75H15.75" stroke="currentColor" strokeWidth="1.25"/>
      <circle cx="9" cy="9.75" r="0.75" fill="currentColor"/>
    </svg>
  ),
  cv: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.75 2.625C3.75 2.00368 4.25368 1.5 4.875 1.5H10.7197C11.0178 1.5 11.3036 1.61853 11.5143 1.82918L14.1697 4.48461C14.3804 4.69527 14.5 4.98093 14.5 5.27893V15.375C14.5 15.9963 13.9963 16.5 13.375 16.5H4.875C4.25368 16.5 3.75 15.9963 3.75 15.375V2.625Z" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M10.5 1.5V4.5C10.5 5.05228 10.9477 5.5 11.5 5.5H14.5" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M6.5 9.5H11.5M6.5 12H9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  ),
  research: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M12 12L15.5 15.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M9 1.5V3M9 15V16.5M16.5 9H15M3 9H1.5M14.3 3.7L13.2 4.8M4.8 13.2L3.7 14.3M14.3 14.3L13.2 13.2M4.8 4.8L3.7 3.7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  ),
  collapse: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L2 9L6 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 4V14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  ),
  expand: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L10 9L6 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 4V14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Jobs', icon: Icons.jobs, shortcut: 'G J' },
  { href: '/cv', label: 'CV', icon: Icons.cv, shortcut: 'G C' },
  { href: '/research', label: 'Research', icon: Icons.research, shortcut: 'G R' },
  { href: '/settings', label: 'Settings', icon: Icons.settings, shortcut: 'G S' },
];

const STORAGE_KEY = 'sidenav-collapsed';

interface SideNavProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export function SideNav({ onCollapseChange }: SideNavProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        setIsCollapsed(true);
        onCollapseChange?.(true);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        const collapsed = stored === 'true';
        setIsCollapsed(collapsed);
        onCollapseChange?.(collapsed);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [onCollapseChange]);

  const toggleCollapse = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    onCollapseChange?.(newValue);

    if (!isMobile) {
      localStorage.setItem(STORAGE_KEY, String(newValue));
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <aside className="flex-shrink-0 w-[52px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800" />
    );
  }

  return (
    <aside
      data-testid="sidenav"
      className={`
        flex-shrink-0
        flex flex-col
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800
        transition-all duration-200 ease-out
        ${isCollapsed ? 'w-[52px]' : 'w-[200px]'}
        h-screen
        select-none
      `}
    >
      {/* Logo Area */}
      <div className={`
        flex items-center
        h-14
        ${isCollapsed ? 'px-2.5 justify-center' : 'px-3'}
        border-b border-slate-100 dark:border-slate-800
      `}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4.5V3C6 2.17157 6.67157 1.5 7.5 1.5H10.5C11.3284 1.5 12 2.17157 12 3V4.5M2.25 6.75C2.25 5.92157 2.92157 5.25 3.75 5.25H14.25C15.0784 5.25 15.75 5.92157 15.75 6.75V14.25C15.75 15.0784 15.0784 15.75 14.25 15.75H3.75C2.92157 15.75 2.25 15.0784 2.25 14.25V6.75Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          {!isCollapsed && (
            <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              JobTracker
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-2'} py-3 space-y-0.5`}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          const testIdMap: Record<string, string> = {
            '/dashboard': 'nav-item-jobs',
            '/cv': 'nav-item-cv',
            '/research': 'nav-item-research',
            '/settings': 'nav-item-settings',
          };

          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={testIdMap[item.href]}
              data-active={isActive}
              className={`
                group relative flex items-center
                ${isCollapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2'}
                rounded-md
                transition-all duration-150
                ${isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              {/* Icon */}
              <span className={`flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                {item.icon}
              </span>

              {/* Label */}
              {!isCollapsed && (
                <span className="ml-2.5 text-[13px] font-medium flex-1">
                  {item.label}
                </span>
              )}

              {/* Keyboard shortcut */}
              {!isCollapsed && (
                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.shortcut}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className={`
                  absolute left-full ml-2
                  px-2.5 py-1.5
                  bg-slate-900 dark:bg-slate-800 text-white
                  text-[12px] font-medium
                  rounded-md
                  whitespace-nowrap
                  opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible
                  transition-all duration-150
                  z-50
                  shadow-xl shadow-black/20
                  pointer-events-none
                `}>
                  {item.label}
                  <span className="ml-2 text-slate-400 font-mono text-[10px]">
                    {item.shortcut}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Credits Display */}
      <div className={`${isCollapsed ? 'px-2' : 'px-2'} py-3 border-t border-slate-100 dark:border-slate-800`}>
        <CreditBalance
          variant={isCollapsed ? 'compact' : 'sidebar'}
          onBuyClick={() => setShowBuyModal(true)}
        />
      </div>

      {/* Collapse Toggle */}
      <div className={`${isCollapsed ? 'px-2' : 'px-2'} py-3 border-t border-slate-100 dark:border-slate-800`}>
        <button
          onClick={toggleCollapse}
          data-testid="sidenav-collapse-toggle"
          className={`
            group flex items-center
            ${isCollapsed ? 'justify-center w-full px-0' : 'px-2.5 w-full'}
            py-2
            rounded-md
            text-slate-500 dark:text-slate-500
            hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-300
            transition-all duration-150
          `}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="flex-shrink-0">
            {isCollapsed ? Icons.expand : Icons.collapse}
          </span>
          {!isCollapsed && (
            <span className="ml-2.5 text-[13px] font-medium">
              Collapse
            </span>
          )}
        </button>
      </div>

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
      />
    </aside>
  );
}
