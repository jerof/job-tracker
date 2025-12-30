'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Application, ApplicationStatus, CloseReason } from '@/lib/types';

interface Email {
  id: string;
  gmailMessageId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  emailType: string;
}

interface EmailDetail extends Email {
  body: string;
  gmailUrl?: string;
}

interface CardDetailModalProps {
  application: Application;
  onClose: () => void;
  onUpdate: (application: Application) => void;
  onDelete?: (id: string) => void;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  applied: {
    label: 'Applied',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    dotColor: 'bg-blue-500'
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    dotColor: 'bg-amber-500'
  },
  offer: {
    label: 'Offer',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    dotColor: 'bg-green-500'
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    dotColor: 'bg-gray-500'
  },
};

const CLOSE_REASONS: Record<CloseReason, { label: string; icon: string }> = {
  rejected: { label: 'Rejected', icon: 'x-circle' },
  withdrawn: { label: 'Withdrawn', icon: 'arrow-left' },
  ghosted: { label: 'No Response', icon: 'clock' },
  accepted: { label: 'Accepted', icon: 'check-circle' },
};

export function CardDetailModal({ application, onClose, onUpdate, onDelete }: CardDetailModalProps) {
  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role || '');
  const [location, setLocation] = useState(application.location || '');
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [closeReason, setCloseReason] = useState<CloseReason | null>(application.closeReason);
  const [notes, setNotes] = useState(application.notes || '');
  const [isVisible, setIsVisible] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Email state
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [emailDetailLoading, setEmailDetailLoading] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Track changes
  useEffect(() => {
    const changed =
      company !== application.company ||
      role !== (application.role || '') ||
      location !== (application.location || '') ||
      status !== application.status ||
      closeReason !== application.closeReason ||
      notes !== (application.notes || '');
    setHasChanges(changed);
  }, [company, role, location, status, closeReason, notes, application]);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Fetch emails for this application
  useEffect(() => {
    const fetchEmails = async () => {
      setEmailsLoading(true);
      try {
        const response = await fetch(`/api/applications/${application.id}/emails`);
        if (response.ok) {
          const data = await response.json();
          setEmails(data.emails || []);
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setEmailsLoading(false);
      }
    };

    fetchEmails();
  }, [application.id]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showStatusDropdown) {
          setShowStatusDropdown(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          handleClose();
        }
      }
      // Cmd/Ctrl + Enter to save
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && hasChanges) {
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStatusDropdown, showDeleteConfirm, hasChanges]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    };
    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStatusDropdown]);

  // Focus trap
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusableElements = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    panel.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => panel.removeEventListener('keydown', handleTab);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleSave = () => {
    onUpdate({
      ...application,
      company,
      role: role || null,
      location: location || null,
      status,
      closeReason: status === 'closed' ? closeReason : null,
      notes: notes || null,
      updatedAt: new Date().toISOString(),
    });
    handleClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(application.id);
    }
    handleClose();
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    setStatus(newStatus);
    if (newStatus === 'closed' && !closeReason) {
      setCloseReason('withdrawn');
    }
    setShowStatusDropdown(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color based on company name
  const getCompanyColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
      'from-indigo-500 to-indigo-600',
      'from-rose-500 to-rose-600',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Handle email expansion
  const handleEmailClick = async (email: Email) => {
    if (expandedEmailId === email.id) {
      setExpandedEmailId(null);
      setEmailDetail(null);
      return;
    }

    setExpandedEmailId(email.id);
    setEmailDetailLoading(true);
    setEmailDetail(null);

    try {
      const response = await fetch(`/api/emails/${email.gmailMessageId}`);
      if (response.ok) {
        const data = await response.json();
        // API returns { email: { body, gmailUrl, ... } }
        setEmailDetail({
          ...email,
          body: data.email?.body || '',
          gmailUrl: data.email?.gmailUrl,
        });
      }
    } catch (error) {
      console.error('Error fetching email detail:', error);
    } finally {
      setEmailDetailLoading(false);
    }
  };

  // Get icon and color for email type
  const getEmailTypeConfig = (emailType: string) => {
    switch (emailType) {
      case 'application_confirmation':
        return {
          icon: (
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          label: 'Application Confirmed'
        };
      case 'interview_invitation':
        return {
          icon: (
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          label: 'Interview Invitation'
        };
      case 'rejection':
        return {
          icon: (
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          label: 'Rejection'
        };
      case 'offer':
        return {
          icon: (
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          ),
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          label: 'Offer'
        };
      default:
        return {
          icon: (
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          label: 'Email'
        };
    }
  };

  // Decode HTML entities in email body
  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const statusConfig = STATUS_CONFIG[status];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel - Slide in from right */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`fixed inset-y-0 right-0 w-full sm:w-[480px] md:w-[540px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            {/* Company Avatar */}
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCompanyColor(company)} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
              {getInitials(company)}
            </div>
            <div>
              <h2 id="modal-title" className="font-semibold text-gray-900 dark:text-white">
                {company}
              </h2>
              {role && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Status Section */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} hover:opacity-80 transition-opacity`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
                  {statusConfig.label}
                  <svg className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Status Dropdown */}
                {showStatusDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key as ApplicationStatus)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          status === key ? 'bg-gray-50 dark:bg-gray-700' : ''
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                        <span className="text-gray-700 dark:text-gray-200">{config.label}</span>
                        {status === key && (
                          <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Close Reason */}
            {status === 'closed' && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Reason</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CLOSE_REASONS).map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() => setCloseReason(key as CloseReason)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        closeReason === key
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Form */}
          <div className="px-6 py-5 space-y-5">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Company name"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Role
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                placeholder="Add interview notes, contact info, or reminders..."
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Timeline</h3>
            <div className="space-y-4">
              {/* Application submitted */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Application submitted</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(application.appliedDate)}</p>
                </div>
              </div>

              {/* Email Loading State */}
              {emailsLoading && (
                <div className="flex items-center gap-3 pl-11">
                  <div className="animate-pulse flex gap-2">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              )}

              {/* Emails in chronological order */}
              {emails.map((email) => {
                const config = getEmailTypeConfig(email.emailType);
                const isExpanded = expandedEmailId === email.id;

                return (
                  <div key={email.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleEmailClick(email)}
                        className="w-full text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {email.subject}
                          </p>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(email.date)} &middot; {email.from.split('<')[0].trim()}
                        </p>
                      </button>

                      {/* Expanded Email Content */}
                      {isExpanded && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          {emailDetailLoading ? (
                            <div className="animate-pulse space-y-2">
                              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              <div className="h-3 w-3/5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                          ) : emailDetail ? (
                            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {decodeHtmlEntities(emailDetail.body || email.snippet)}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                              {decodeHtmlEntities(email.snippet)}
                            </p>
                          )}
                          {/* Open in Gmail link */}
                          {emailDetail?.gmailUrl && (
                          <a
                            href={emailDetail.gmailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                            </svg>
                            Open in Gmail
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Last updated (if different from created) */}
              {application.updatedAt !== application.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Last updated</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeDate(application.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Source info */}
          {application.sourceEmailId && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
                <span>Imported from Gmail</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          {showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Delete this application?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Delete
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    hasChanges
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save Changes
                  {hasChanges && (
                    <span className="ml-2 text-blue-200 text-xs hidden sm:inline">Cmd+Enter</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
