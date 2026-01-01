'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Application, ApplicationStatus, CloseReason } from '@/lib/types';
import { SkillsMatchResult } from '@/lib/skills-matcher.types';

// Tab types
type TabId = 'details' | 'research' | 'prep' | 'timeline';

interface Tab {
  id: TabId;
  label: string;
  shortcut: string;
}

const TABS: Tab[] = [
  { id: 'details', label: 'Details', shortcut: '1' },
  { id: 'research', label: 'Research', shortcut: '2' },
  { id: 'prep', label: 'Prep', shortcut: '3' },
  { id: 'timeline', label: 'Timeline', shortcut: '4' },
];

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

interface ResearchData {
  company: {
    name: string;
    domain: string | null;
    logo: string | null;
    description: string;
    founded: string | null;
    headquarters: string | null;
    employeeCount: string | null;
    funding: { stage: string | null; totalRaised: string | null } | null;
    culture: string[];
    recentNews: { title: string; date: string; summary: string }[];
    competitors: string[];
  };
  role: {
    title: string;
    typicalResponsibilities: string[];
    requiredSkills: string[];
    interviewQuestions: string[];
    questionsToAsk: string[];
    salaryRange: string | null;
  };
  generatedAt: string;
}

interface StatusChange {
  id: string;
  status: ApplicationStatus;
  changedAt: string;
  emailSnippet?: string;
}

interface CardDetailModalProps {
  application: Application;
  onClose: () => void;
  onUpdate: (application: Application) => void;
  onDelete?: (id: string) => void;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string; dotColor: string }> = {
  saved: {
    label: 'Saved',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    dotColor: 'bg-purple-500'
  },
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
  // Active tab state
  const [activeTab, setActiveTab] = useState<TabId>('details');

  // Details tab state
  const [company, setCompany] = useState(application.company);
  const [role, setRole] = useState(application.role || '');
  const [location, setLocation] = useState(application.location || '');
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [closeReason, setCloseReason] = useState<CloseReason | null>(application.closeReason);
  const [appliedDate, setAppliedDate] = useState(application.appliedDate || '');
  const [jobUrl, setJobUrl] = useState(application.jobUrl || '');
  const [notes, setNotes] = useState(application.notes || '');

  // Research tab state
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);

  // Prep tab state
  const [prepNotes, setPrepNotes] = useState('');
  const [prepSaving, setPrepSaving] = useState(false);

  // Skills Matcher state
  const [skillsMatchResult, setSkillsMatchResult] = useState<SkillsMatchResult | null>(null);
  const [skillsMatchLoading, setSkillsMatchLoading] = useState(false);
  const [skillsMatchError, setSkillsMatchError] = useState<string | null>(null);
  const [skillsMatchErrorCode, setSkillsMatchErrorCode] = useState<string | null>(null);

  // Timeline tab state
  const [statusHistory, setStatusHistory] = useState<StatusChange[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [emailDetail, setEmailDetail] = useState<EmailDetail | null>(null);
  const [emailDetailLoading, setEmailDetailLoading] = useState(false);

  // UI state
  const [isVisible, setIsVisible] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Track changes in details tab
  useEffect(() => {
    const changed =
      company !== application.company ||
      role !== (application.role || '') ||
      location !== (application.location || '') ||
      status !== application.status ||
      closeReason !== application.closeReason ||
      appliedDate !== (application.appliedDate || '') ||
      jobUrl !== (application.jobUrl || '') ||
      notes !== (application.notes || '');
    setHasChanges(changed);
  }, [company, role, location, status, closeReason, appliedDate, jobUrl, notes, application]);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Fetch emails for timeline
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

  // Fetch research data when research tab becomes active
  useEffect(() => {
    if (activeTab === 'research' && !researchData && !researchLoading) {
      fetchResearch();
    }
  }, [activeTab]);

  const fetchResearch = async () => {
    setResearchLoading(true);
    setResearchError(null);
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          role,
          jobUrl: jobUrl || undefined,
          applicationId: application.id,  // Pass application ID for email context
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setResearchData(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setResearchError(errorData.error || 'Failed to load research data');
      }
    } catch (error) {
      console.error('Error fetching research:', error);
      setResearchError('Failed to load research data');
    } finally {
      setResearchLoading(false);
    }
  };

  // Skills Matcher API call
  const analyzeSkillsMatch = async () => {
    setSkillsMatchLoading(true);
    setSkillsMatchError(null);
    setSkillsMatchErrorCode(null);
    try {
      const response = await fetch(`/api/applications/${application.id}/analyze-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSkillsMatchResult(data);
      } else {
        setSkillsMatchError(data.error || 'Failed to analyze skills match');
        setSkillsMatchErrorCode(data.code || null);
      }
    } catch (error) {
      console.error('Error analyzing skills match:', error);
      setSkillsMatchError('Failed to analyze skills match');
    } finally {
      setSkillsMatchLoading(false);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Tab shortcuts (1-4) - only when not typing
      if (!isTyping && !e.metaKey && !e.ctrlKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('details');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          setActiveTab('research');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          setActiveTab('prep');
          return;
        }
        if (e.key === '4') {
          e.preventDefault();
          setActiveTab('timeline');
          return;
        }
      }

      // Escape to close
      if (e.key === 'Escape') {
        if (showStatusDropdown) {
          setShowStatusDropdown(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          handleClose();
        }
      }

      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStatusDropdown, showDeleteConfirm, hasChanges, activeTab]);

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
      appliedDate: appliedDate || null,
      jobUrl: jobUrl || null,
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

  // Auto-save prep notes on blur
  const handlePrepNotesBlur = async () => {
    if (prepNotes !== application.notes) {
      setPrepSaving(true);
      // In a real implementation, this would save to the API
      setTimeout(() => setPrepSaving(false), 500);
    }
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

  // Handle email expansion in timeline
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

  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const statusConfig = STATUS_CONFIG[status];

  // Tab content components
  const renderDetailsTab = () => (
    <div className="animate-fadeIn" data-testid="details-tab-content">
      {/* Status Section */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              data-testid="status-dropdown"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} hover:opacity-80 transition-opacity`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotColor}`} />
              {statusConfig.label}
              <svg className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

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
                      <svg className="w-4 h-4 ml-auto text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

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

      {/* Form Fields */}
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
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
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
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
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
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            placeholder="e.g., San Francisco, CA or Remote"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Applied Date
            </label>
            <input
              id="appliedDate"
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Job URL
            </label>
            <input
              id="jobUrl"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
              placeholder="https://..."
            />
          </div>
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
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow resize-none"
            placeholder="Add interview notes, contact info, or reminders..."
          />
        </div>
      </div>
    </div>
  );

  const renderResearchTab = () => (
    <div className="animate-fadeIn px-6 py-5" data-testid="research-tab-content">
      {researchLoading ? (
        // Loading skeleton
        <div className="space-y-6" data-testid="research-loading">
          <div>
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-3/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div>
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ) : researchError ? (
        // Error state
        <div className="text-center py-8" data-testid="research-error">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{researchError}</p>
          <button
            onClick={fetchResearch}
            className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : researchData ? (
        // Research content
        <div className="space-y-6">
          {/* Company Header with Logo */}
          <div data-testid="research-company-section">
            <div className="flex items-start gap-3 mb-4">
              {researchData.company.logo && (
                <img
                  src={researchData.company.logo}
                  alt={`${researchData.company.name} logo`}
                  className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200 dark:border-gray-700"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {researchData.company.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  {researchData.company.headquarters && (
                    <span>{researchData.company.headquarters}</span>
                  )}
                  {researchData.company.founded && (
                    <>
                      <span>·</span>
                      <span>Founded {researchData.company.founded}</span>
                    </>
                  )}
                  {researchData.company.employeeCount && (
                    <>
                      <span>·</span>
                      <span>{researchData.company.employeeCount} employees</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">About</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{researchData.company.description}</p>
              </div>

              {researchData.company.funding && (researchData.company.funding.stage || researchData.company.funding.totalRaised) && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Funding</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {researchData.company.funding.stage}
                    {researchData.company.funding.totalRaised && ` · ${researchData.company.funding.totalRaised} raised`}
                  </p>
                </div>
              )}

              {researchData.company.culture.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Culture</h4>
                  <div className="flex flex-wrap gap-2">
                    {researchData.company.culture.map((trait, i) => (
                      <span key={i} className="px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {researchData.company.competitors.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Competitors</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {researchData.company.competitors.join(', ')}
                  </p>
                </div>
              )}

              {researchData.company.recentNews.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Recent News</h4>
                  <ul className="space-y-2">
                    {researchData.company.recentNews.map((news, i) => (
                      <li key={i} className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">{news.title}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{news.date}</div>
                        <div className="text-gray-600 dark:text-gray-300 mt-0.5">{news.summary}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Role Section */}
          <div data-testid="research-role-section">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {researchData.role.title}
            </h3>

            {researchData.role.salaryRange && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Estimated Salary</span>
                <p className="text-sm font-semibold text-green-700 dark:text-green-300 mt-0.5">{researchData.role.salaryRange}</p>
              </div>
            )}

            <div className="space-y-4">
              {researchData.role.typicalResponsibilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Responsibilities</h4>
                  <ul className="space-y-1">
                    {researchData.role.typicalResponsibilities.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-violet-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {researchData.role.requiredSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {researchData.role.requiredSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-1 text-xs font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {researchData.role.interviewQuestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Likely Interview Questions</h4>
                  <ul className="space-y-1">
                    {researchData.role.interviewQuestions.map((question, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">{i + 1}.</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {researchData.role.questionsToAsk.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Questions to Ask</h4>
                  <ul className="space-y-1">
                    {researchData.role.questionsToAsk.map((question, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-green-500 mt-1">-&gt;</span>
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Generated timestamp and refresh */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Generated {new Date(researchData.generatedAt).toLocaleDateString()}
            </span>
            <button
              onClick={() => {
                setResearchData(null);
                fetchResearch();
              }}
              data-testid="refresh-research-button"
              className="px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      ) : (
        // Empty state - show when no research loaded yet
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Research data not loaded</p>
          <button
            onClick={fetchResearch}
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          >
            Load Research
          </button>
        </div>
      )}
    </div>
  );

  const renderSkillsMatchSection = () => {
    // No CV state
    if (skillsMatchErrorCode === 'NO_CV') {
      return (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Upload your CV to enable skills matching
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Your CV helps us identify matching skills and gaps for each job.
              </p>
              <a
                href="/cv"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload CV
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Loading state
    if (skillsMatchLoading) {
      return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing match...</span>
          </div>
        </div>
      );
    }

    // Error state (non-CV related)
    if (skillsMatchError && skillsMatchErrorCode !== 'NO_CV') {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {skillsMatchError}
              </p>
              <button
                onClick={analyzeSkillsMatch}
                className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Results state
    if (skillsMatchResult) {
      return (
        <div className="space-y-4">
          {/* Match Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Match Score</span>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              skillsMatchResult.matchScore >= 80
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : skillsMatchResult.matchScore >= 60
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {skillsMatchResult.matchScore}%
            </div>
          </div>

          {/* Matched Skills */}
          {skillsMatchResult.matchedSkills.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Matched Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {skillsMatchResult.matchedSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {skillsMatchResult.skillGaps.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Skill Gaps
              </h4>
              <div className="flex flex-wrap gap-2">
                {skillsMatchResult.skillGaps.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Talking Points */}
          {skillsMatchResult.talkingPoints.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Talking Points
              </h4>
              <ul className="space-y-2">
                {skillsMatchResult.talkingPoints.map((point, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-violet-500 font-medium mt-0.5">{i + 1}.</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Refresh button */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Analyzed {new Date(skillsMatchResult.generatedAt).toLocaleDateString()}
            </span>
            <button
              onClick={() => {
                setSkillsMatchResult(null);
                analyzeSkillsMatch();
              }}
              className="px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-analyze
            </button>
          </div>
        </div>
      );
    }

    // Default: Show analyze button
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Compare your CV against this job to see matching skills and gaps.
        </p>
        <button
          onClick={analyzeSkillsMatch}
          data-testid="analyze-match-button"
          className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Analyze Match
        </button>
      </div>
    );
  };

  const renderPrepTab = () => (
    <div className="animate-fadeIn px-6 py-5" data-testid="prep-tab-content">
      {/* Skills Matcher Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Skills Matcher</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          {renderSkillsMatchSection()}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-6" />

      {/* Prep Notes Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="prepNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Interview Preparation Notes
          </label>
          {prepSaving && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1" data-testid="prep-saving-indicator">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          )}
        </div>
        <textarea
          id="prepNotes"
          data-testid="prep-notes-textarea"
          value={prepNotes}
          onChange={(e) => setPrepNotes(e.target.value)}
          onBlur={handlePrepNotesBlur}
          rows={12}
          className="w-full px-3 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow resize-none font-mono text-sm"
          placeholder={`## Questions to Expect
- Tell me about yourself
- Why are you interested in ${company}?
- Describe a challenging project

## Topics to Review
- System design fundamentals
- Company products and recent news
- Role-specific technologies

## Questions to Ask
- What does success look like in this role?
- How is the team structured?
- What are the biggest challenges?`}
        />
      </div>

      {/* Suggested sections */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Suggested Sections</h4>
        <div className="flex flex-wrap gap-2">
          {['Questions to Expect', 'Topics to Review', 'Questions to Ask', 'STAR Stories', 'Salary Research'].map((section) => (
            <button
              key={section}
              onClick={() => {
                const header = `\n\n## ${section}\n- `;
                setPrepNotes(prev => prev + header);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              + {section}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="animate-fadeIn px-6 py-5" data-testid="timeline-tab-content">
      <div className="space-y-4">
        {/* Application submitted or job saved */}
        <div className="flex items-start gap-3" data-testid="timeline-created-date">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            application.status === 'saved' && !application.appliedDate
              ? 'bg-purple-100 dark:bg-purple-900/30'
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <svg className={`w-4 h-4 ${
              application.status === 'saved' && !application.appliedDate
                ? 'text-purple-600 dark:text-purple-400'
                : 'text-blue-600 dark:text-blue-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {application.status === 'saved' && !application.appliedDate ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              )}
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {application.status === 'saved' && !application.appliedDate ? 'Job saved' : 'Application submitted'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(application.appliedDate || application.createdAt)}
            </p>
          </div>
        </div>

        {/* Email Loading State */}
        {emailsLoading && (
          <div className="flex items-center gap-3 pl-11">
            <div className="animate-pulse flex gap-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
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
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
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
                        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-3 w-3/5 bg-gray-200 dark:bg-gray-700 rounded" />
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
                    {emailDetail?.gmailUrl && (
                      <a
                        href={emailDetail.gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:underline"
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

        {/* Last updated */}
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

        {/* Empty state for timeline */}
        {!emailsLoading && emails.length === 0 && application.updatedAt === application.createdAt && (
          <div className="text-center py-8 border-t border-gray-100 dark:border-gray-800 mt-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Status changes and emails will appear here</p>
          </div>
        )}

        {/* Source info */}
        {application.sourceEmailId && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
              </svg>
              <span>Imported from Gmail</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="modal-backdrop"
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
        data-testid="card-detail-modal"
        className={`fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-200 ease-out ${
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

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <nav className="flex px-6" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">{tab.shortcut}</span>
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'research' && renderResearchTab()}
          {activeTab === 'prep' && renderPrepTab()}
          {activeTab === 'timeline' && renderTimelineTab()}
        </div>

        {/* Footer - Only show for details tab */}
        {activeTab === 'details' && (
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
                    data-testid="save-button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      hasChanges
                        ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Save Changes
                    {hasChanges && (
                      <span className="ml-2 text-violet-200 text-xs hidden sm:inline">Cmd+S</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </>
  );
}
