'use client';

import { useState, useCallback } from 'react';
import { SideNav } from './SideNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [, setIsCollapsed] = useState(false);

  const handleCollapseChange = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* Side Navigation */}
      <SideNav onCollapseChange={handleCollapseChange} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950">
        {children}
      </main>
    </div>
  );
}
