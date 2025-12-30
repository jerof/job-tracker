'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Application, ApplicationStatus, MOCK_APPLICATIONS } from '@/lib/types';
import { KanbanColumn } from './KanbanColumn';
import { CardDetailModal } from './CardDetailModal';
import { SearchFilterBar } from './SearchFilterBar';
import { AddApplicationModal } from './AddApplicationModal';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmailSidePanel } from './EmailSidePanel';

const COLUMNS: { id: ApplicationStatus; title: string }[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'interviewing', title: 'Interviewing' },
  { id: 'offer', title: 'Offer' },
  { id: 'closed', title: 'Closed' },
];

export function KanbanBoard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [syncResult, setSyncResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Search/filter/add state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeColumn, setActiveColumn] = useState<ApplicationStatus>('applied');

  // Email panel state
  const [emailPanelApp, setEmailPanelApp] = useState<{ id: string; company: string } | null>(null);
  const [emailCounts, setEmailCounts] = useState<Record<string, number>>({});

  const SYNC_INTERVAL = 15 * 60 * 1000;

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (syncResult) {
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setSyncResult(null), 300); // Wait for exit animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncResult]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // 'N' to open add modal
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowAddModal(true);
      }

      // '/' to focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const showNotification = useCallback((newCount: number, updatedCount: number) => {
    if (Notification.permission !== 'granted') return;
    const total = newCount + updatedCount;
    new Notification('JT', {
      body: `${total} update${total !== 1 ? 's' : ''}`,
      icon: '/favicon.ico',
      tag: 'job-tracker-sync',
      silent: false,
    });
  }, []);

  // Fetch email counts for all applications
  const fetchEmailCounts = useCallback(async (appIds: string[]) => {
    if (appIds.length === 0) return;

    try {
      // Fetch email counts for each application in parallel
      const countPromises = appIds.map(async (id) => {
        try {
          const response = await fetch(`/api/applications/${id}/emails`);
          if (!response.ok) return { id, count: 0 };
          const data = await response.json();
          return { id, count: data.emails?.length || 0 };
        } catch {
          return { id, count: 0 };
        }
      });

      const results = await Promise.all(countPromises);
      const counts: Record<string, number> = {};
      results.forEach(({ id, count }) => {
        counts[id] = count;
      });
      setEmailCounts(counts);
    } catch (error) {
      console.error('Failed to fetch email counts:', error);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setApplications(data.applications);
      setLastSynced(new Date());
      setUseMockData(false);
      // Fetch email counts after applications load
      const appIds = data.applications.map((app: Application) => app.id);
      fetchEmailCounts(appIds);
    } catch (error) {
      console.log('API not available, using mock data:', error);
      setApplications(MOCK_APPLICATIONS);
      setUseMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchEmailCounts]);

  const checkGmailStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/sync');
      const data = await response.json();
      setGmailConnected(data.connected);
    } catch {
      setGmailConnected(false);
    }
  }, []);

  const backgroundSync = useCallback(async () => {
    if (!gmailConnected || isSyncing) return;
    try {
      const response = await fetch('/api/sync', { method: 'POST' });
      const data = await response.json();
      if (data.newApplications > 0 || data.updatedApplications > 0) {
        setSyncResult({
          message: `Auto-sync: ${data.newApplications} new, ${data.updatedApplications} updated`,
          type: 'success'
        });
        showNotification(data.newApplications, data.updatedApplications);
        await fetchApplications();
      }
      setLastSynced(new Date());
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, [gmailConnected, isSyncing, fetchApplications, showNotification]);

  useEffect(() => {
    fetchApplications();
    checkGmailStatus();
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail') === 'connected') {
      setGmailConnected(true);
      setSyncResult({ message: 'Gmail connected! Click Sync to import applications.', type: 'success' });
      window.history.replaceState({}, '', '/');
    } else if (params.get('error')) {
      setSyncResult({ message: 'Failed to connect Gmail. Please try again.', type: 'error' });
      window.history.replaceState({}, '', '/');
    }
  }, [fetchApplications, checkGmailStatus]);

  useEffect(() => {
    if (!autoSync || !gmailConnected) return;
    const interval = setInterval(() => backgroundSync(), SYNC_INTERVAL);
    return () => clearInterval(interval);
  }, [autoSync, gmailConnected, backgroundSync, SYNC_INTERVAL]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCompany = app.company.toLowerCase().includes(query);
        const matchesRole = app.role?.toLowerCase().includes(query) || false;
        if (!matchesCompany && !matchesRole) return false;
      }
      return true;
    });
  }, [applications, searchQuery, statusFilter]);

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return filteredApplications
      .filter((app) => app.status === status)
      .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
  };

  const getColumnCount = (status: ApplicationStatus) => {
    return filteredApplications.filter((app) => app.status === status).length;
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as ApplicationStatus;
    const closeReason = newStatus === 'closed' ? 'withdrawn' : null;

    setApplications((prev) =>
      prev.map((app) =>
        app.id === draggableId
          ? { ...app, status: newStatus, closeReason, updatedAt: new Date().toISOString() }
          : app
      )
    );

    if (!useMockData) {
      try {
        await fetch(`/api/applications/${draggableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, closeReason }),
        });
      } catch (error) {
        console.error('Failed to update:', error);
        fetchApplications();
      }
    }
  };

  const handleCardClick = (application: Application) => setSelectedApp(application);
  const handleCloseModal = () => setSelectedApp(null);

  // Email panel handlers
  const handleEmailClick = (application: Application) => {
    setEmailPanelApp({ id: application.id, company: application.company });
  };

  const handleCloseEmailPanel = () => {
    setEmailPanelApp(null);
  };

  const handleUpdateApplication = async (updated: Application) => {
    setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
    setSelectedApp(null);
    if (!useMockData) {
      try {
        await fetch(`/api/applications/${updated.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: updated.company,
            role: updated.role,
            location: updated.location,
            status: updated.status,
            closeReason: updated.closeReason,
            notes: updated.notes,
          }),
        });
      } catch (error) {
        console.error('Failed to update:', error);
        fetchApplications();
      }
    }
  };

  const handleDeleteApplication = async (id: string) => {
    // Optimistic delete
    setApplications((prev) => prev.filter((app) => app.id !== id));
    setSelectedApp(null);

    if (!useMockData) {
      try {
        await fetch(`/api/applications/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to delete:', error);
        fetchApplications();
      }
    }
  };

  const handleAddApplication = async (newApp: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;
    const application: Application = { ...newApp, id: tempId, createdAt: now, updatedAt: now };

    setApplications((prev) => [application, ...prev]);
    setShowAddModal(false);

    if (!useMockData) {
      try {
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newApp),
        });
        if (response.ok) {
          const data = await response.json();
          setApplications((prev) => prev.map((app) => (app.id === tempId ? { ...app, id: data.id } : app)));
        }
      } catch (error) {
        console.error('Failed to add:', error);
        setApplications((prev) => prev.filter((app) => app.id !== tempId));
      }
    }
  };

  const handleSync = async () => {
    if (!gmailConnected) {
      window.location.href = '/api/auth/gmail';
      return;
    }
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/sync', { method: 'POST' });
      const data = await response.json();
      if (data.needsAuth) {
        window.location.href = '/api/auth/gmail';
        return;
      }
      if (data.error) {
        setSyncResult({ message: `Sync failed: ${data.error}`, type: 'error' });
      } else {
        // Build detailed message
        const parts = [];
        if (data.newApplications > 0) parts.push(`${data.newApplications} new`);
        if (data.updatedApplications > 0) parts.push(`${data.updatedApplications} updated`);
        if (data.alreadyProcessed > 0) parts.push(`${data.alreadyProcessed} already synced`);
        if (data.skipped > 0) parts.push(`${data.skipped} skipped`);

        const message = parts.length > 0
          ? `Scanned ${data.emailsScanned} emails: ${parts.join(', ')}`
          : `Scanned ${data.emailsScanned} emails, no new applications found`;

        setSyncResult({ message, type: 'success' });
        if (data.newApplications > 0 || data.updatedApplications > 0) {
          await fetchApplications();
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResult({ message: 'Sync failed. Please try again.', type: 'error' });
    } finally {
      setIsSyncing(false);
      setLastSynced(new Date());
    }
  };

  const handleConnectGmail = () => {
    window.location.href = '/api/auth/gmail';
  };

  const dismissToast = () => {
    setToastVisible(false);
    setTimeout(() => setSyncResult(null), 300);
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const responded = applications.filter((a) => a.status !== 'applied').length;
    const interviewing = applications.filter((a) => a.status === 'interviewing').length;
    const offers = applications.filter((a) => a.status === 'offer').length;
    return {
      total,
      responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
      interviewing,
      offers,
    };
  }, [applications]);

  const formatLastSynced = () => {
    if (!lastSynced) return 'Never';
    const diff = Math.floor((Date.now() - lastSynced.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) return <LoadingSkeleton count={4} />;

  const isEmpty = applications.length === 0;

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      {/* Floating Toast Notification */}
      {syncResult && (
        <div
          className={`
            fixed top-4 right-4 z-50
            max-w-sm w-full
            transform transition-all duration-300 ease-out
            ${toastVisible
              ? 'translate-y-0 opacity-100'
              : '-translate-y-2 opacity-0 pointer-events-none'
            }
          `}
        >
          <div
            className={`
              relative overflow-hidden
              px-4 py-3.5 rounded-xl
              backdrop-blur-xl
              shadow-lg shadow-black/5 dark:shadow-black/20
              border
              ${syncResult.type === 'error'
                ? 'bg-red-50/95 dark:bg-red-950/90 border-red-200/60 dark:border-red-800/40'
                : 'bg-white/95 dark:bg-slate-800/95 border-slate-200/60 dark:border-slate-700/40'
              }
            `}
          >
            {/* Progress bar for auto-dismiss */}
            <div
              className={`
                absolute bottom-0 left-0 h-0.5
                ${syncResult.type === 'error'
                  ? 'bg-red-400 dark:bg-red-500'
                  : 'bg-emerald-400 dark:bg-emerald-500'
                }
              `}
              style={{
                animation: toastVisible ? 'shrink 5s linear forwards' : 'none',
                width: '100%',
              }}
            />

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                ${syncResult.type === 'error'
                  ? 'bg-red-100 dark:bg-red-900/50'
                  : 'bg-emerald-100 dark:bg-emerald-900/50'
                }
              `}>
                {syncResult.type === 'error' ? (
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`
                  text-sm font-medium leading-snug
                  ${syncResult.type === 'error'
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-slate-800 dark:text-slate-100'
                  }
                `}>
                  {syncResult.message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={dismissToast}
                className={`
                  flex-shrink-0 p-1 rounded-md
                  transition-colors duration-150
                  ${syncResult.type === 'error'
                    ? 'text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50'
                    : 'text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700/50'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo + Stats */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    Job Tracker
                  </h1>
                  {useMockData && (
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-500 uppercase tracking-wide">
                      Demo Mode
                    </span>
                  )}
                </div>
              </div>

              {/* Stats - Desktop only */}
              <div className="hidden md:flex items-center gap-1">
                <div className="flex items-center gap-4 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {stats.total}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      apps
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {stats.responseRate}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      response
                    </span>
                  </div>
                  {stats.offers > 0 && (
                    <>
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {stats.offers}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {stats.offers === 1 ? 'offer' : 'offers'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
              {/* Gmail status + settings - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                {gmailConnected && (
                  <>
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-medium">Gmail</span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={autoSync}
                        onChange={(e) => setAutoSync(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-500 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-3" />
                      <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        Auto
                      </span>
                    </label>

                    {/* Enhanced Notification Bell Button */}
                    <button
                      onClick={requestNotificationPermission}
                      className={`
                        relative p-2 rounded-lg
                        transition-all duration-200 ease-out
                        group
                        ${notificationsEnabled
                          ? 'bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-900/40 dark:to-blue-800/30 shadow-sm shadow-blue-500/10 dark:shadow-blue-400/5'
                          : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }
                      `}
                      title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
                    >
                      {/* Bell Icon */}
                      <svg
                        className={`
                          w-4 h-4 transition-all duration-200
                          ${notificationsEnabled
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          }
                        `}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>

                      {/* Status indicator dot */}
                      <span
                        className={`
                          absolute top-1.5 right-1.5
                          w-2 h-2 rounded-full
                          transition-all duration-200
                          ${notificationsEnabled
                            ? 'bg-blue-500 dark:bg-blue-400 ring-2 ring-white dark:ring-slate-900'
                            : 'bg-slate-300 dark:bg-slate-600 scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                          }
                        `}
                      />

                      {/* Active ring animation when enabled */}
                      {notificationsEnabled && (
                        <span className="absolute inset-0 rounded-lg ring-1 ring-blue-400/30 dark:ring-blue-500/20" />
                      )}
                    </button>
                  </>
                )}
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {formatLastSynced()}
                </span>
              </div>

              {/* Sync button */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className={`
                  flex items-center gap-2
                  px-3.5 py-2
                  rounded-lg
                  text-sm font-medium
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${gmailConnected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {isSyncing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Syncing...</span>
                  </>
                ) : gmailConnected ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Sync</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="hidden sm:inline">Connect Gmail</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Keyframes for toast progress bar */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {isEmpty ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            onConnectGmail={handleConnectGmail}
            onAddApplication={() => setShowAddModal(true)}
            gmailConnected={gmailConnected}
          />
        </div>
      ) : (
        <>
          {/* Search/Filter Bar */}
          <div className="px-4 md:px-6 pt-4">
            <SearchFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onAddClick={() => setShowAddModal(true)}
            />
          </div>

          {/* Mobile Stats */}
          <div className="md:hidden px-4 pb-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.total}</span> apps
              </span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{stats.responseRate}%</span> response
              </span>
              {stats.offers > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {stats.offers} {stats.offers === 1 ? 'offer' : 'offers'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <div className="flex">
              {COLUMNS.map((column) => {
                const count = getColumnCount(column.id);
                const isActive = activeColumn === column.id;
                return (
                  <button
                    key={column.id}
                    onClick={() => setActiveColumn(column.id)}
                    className={`
                      flex-1 min-w-0 px-2 py-3
                      text-xs font-medium
                      transition-colors duration-200
                      border-b-2
                      ${isActive
                        ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                      }
                    `}
                  >
                    <span className="truncate">{column.title}</span>
                    <span
                      className={`
                        ml-1 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums
                        ${isActive
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }
                      `}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              {/* Desktop view */}
              <div className="hidden md:flex gap-4 h-full">
                {COLUMNS.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    applications={getApplicationsByStatus(column.id)}
                    onCardClick={handleCardClick}
                    emailCounts={emailCounts}
                    onEmailClick={handleEmailClick}
                  />
                ))}
              </div>

              {/* Mobile view */}
              <div className="md:hidden h-full">
                {COLUMNS.map((column) => (
                  <div
                    key={column.id}
                    className={activeColumn === column.id ? 'block h-full' : 'hidden'}
                  >
                    <KanbanColumn
                      id={column.id}
                      title={column.title}
                      applications={getApplicationsByStatus(column.id)}
                      onCardClick={handleCardClick}
                      isMobile
                      emailCounts={emailCounts}
                      onEmailClick={handleEmailClick}
                    />
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        </>
      )}

      {/* Modals */}
      {selectedApp && (
        <CardDetailModal
          application={selectedApp}
          onClose={handleCloseModal}
          onUpdate={handleUpdateApplication}
          onDelete={handleDeleteApplication}
        />
      )}
      {showAddModal && (
        <AddApplicationModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddApplication}
        />
      )}

      {/* Email Side Panel */}
      {emailPanelApp && (
        <EmailSidePanel
          applicationId={emailPanelApp.id}
          companyName={emailPanelApp.company}
          isOpen={!!emailPanelApp}
          onClose={handleCloseEmailPanel}
        />
      )}
    </div>
  );
}
