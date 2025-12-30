'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Application, ApplicationStatus } from '@/lib/types';

interface AddApplicationModalProps {
  onClose: () => void;
  onSave: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void;
  defaultStatus?: ApplicationStatus;
}

interface ValidationErrors {
  company?: string;
  role?: string;
  appliedDate?: string;
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; description: string; color: string }[] = [
  { value: 'saved', label: 'Saved', description: 'To apply later', color: 'bg-purple-500' },
  { value: 'applied', label: 'Applied', description: 'Just submitted', color: 'bg-blue-500' },
  { value: 'interviewing', label: 'Interviewing', description: 'In process', color: 'bg-amber-500' },
  { value: 'offer', label: 'Offer', description: 'Received offer', color: 'bg-green-500' },
  { value: 'closed', label: 'Closed', description: 'No longer active', color: 'bg-gray-500' },
];

export function AddApplicationModal({ onClose, onSave, defaultStatus = 'applied' }: AddApplicationModalProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ApplicationStatus>(defaultStatus);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isVisible, setIsVisible] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);

  // Extract metadata from URL
  const extractFromUrl = useCallback(async (url: string) => {
    if (!url || !url.startsWith('http')) return;

    setIsExtracting(true);
    try {
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        // Only fill empty fields
        if (data.company && !company) setCompany(data.company);
        if (data.role && !role) setRole(data.role);
        if (data.location && !location) setLocation(data.location);
        // Auto-switch to "saved" status if adding via URL
        if (status === 'applied') setStatus('saved');
      }
    } catch (error) {
      console.error('Failed to extract URL:', error);
    } finally {
      setIsExtracting(false);
    }
  }, [company, role, location, status]);

  // Handle URL paste
  const handleUrlChange = (newUrl: string) => {
    setJobUrl(newUrl);
    // Auto-extract if it looks like a full URL was pasted
    if (newUrl.startsWith('http') && newUrl.length > 20) {
      extractFromUrl(newUrl);
    }
  };

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    companyInputRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        handleClose();
      }
      // Cmd/Ctrl + Enter to save
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [company, role, location, jobUrl, appliedDate, status, notes]);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
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

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, []);

  const validateField = useCallback((field: string, value: string, currentStatus?: ApplicationStatus): string | undefined => {
    switch (field) {
      case 'company':
        if (!value.trim()) return 'Company name is required';
        if (value.trim().length < 2) return 'Company name is too short';
        return undefined;
      case 'appliedDate':
        // Applied date is optional for saved jobs
        if ((currentStatus || status) === 'saved') return undefined;
        if (!value) return 'Applied date is required';
        const date = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (date > today) return 'Date cannot be in the future';
        return undefined;
      default:
        return undefined;
    }
  }, [status]);

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleSave = async () => {
    // Validate all fields
    const newErrors: ValidationErrors = {
      company: validateField('company', company),
      appliedDate: validateField('appliedDate', appliedDate, status),
    };

    setErrors(newErrors);
    setTouched({ company: true, appliedDate: true });

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      // Focus on first error field
      if (newErrors.company) {
        companyInputRef.current?.focus();
      }
      return;
    }

    setIsSaving(true);

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 150));

    onSave({
      company: company.trim(),
      role: role.trim() || null,
      location: location.trim() || null,
      status,
      closeReason: null,
      appliedDate: status === 'saved' ? null : appliedDate,
      sourceEmailId: null,
      jobUrl: jobUrl.trim() || null,
      notes: notes.trim() || null,
    });
  };

  const isFormValid = company.trim().length >= 2 && !errors.company && (status === 'saved' || !errors.appliedDate);

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

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl flex flex-col transform transition-all duration-200 ${
            isVisible
              ? 'translate-y-0 opacity-100 sm:scale-100'
              : 'translate-y-full sm:translate-y-0 opacity-0 sm:scale-95'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                status === 'saved'
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/25'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {status === 'saved' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
              </div>
              <div>
                <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  {status === 'saved' ? 'Save Job' : 'New Application'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {status === 'saved' ? 'Save a job to apply later' : 'Track a job you applied to'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              {/* Company Field */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Company <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={companyInputRef}
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      if (touched.company) {
                        setErrors(prev => ({ ...prev, company: validateField('company', e.target.value) }));
                      }
                    }}
                    onBlur={() => handleBlur('company', company)}
                    placeholder="e.g., Stripe, Google, Airbnb"
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 transition-all ${
                      touched.company && errors.company
                        ? 'border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500 focus:border-transparent'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    aria-invalid={touched.company && !!errors.company}
                    aria-describedby={errors.company ? 'company-error' : undefined}
                  />
                  {touched.company && !errors.company && company.trim() && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {touched.company && errors.company && (
                  <p id="company-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.company}
                  </p>
                )}
              </div>

              {/* Role Field */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Role / Position
                </label>
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Location Field */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA or Remote"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Job URL Field */}
              <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Job URL {isExtracting && <span className="text-purple-500 font-normal animate-pulse">extracting...</span>}
                </label>
                <div className="relative">
                  <input
                    id="jobUrl"
                    type="url"
                    value={jobUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="Paste job URL to auto-fill details..."
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow ${
                      isExtracting ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {isExtracting && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                  {jobUrl && !isExtracting && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <a
                        href={jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300"
                        title="Open link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">Paste a job posting URL to auto-fill company and role</p>
              </div>

              {/* Date and Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {status !== 'saved' && (
                <div>
                  <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Applied Date
                  </label>
                  <input
                    id="appliedDate"
                    type="date"
                    value={appliedDate}
                    onChange={(e) => {
                      setAppliedDate(e.target.value);
                      if (touched.appliedDate) {
                        setErrors(prev => ({ ...prev, appliedDate: validateField('appliedDate', e.target.value) }));
                      }
                    }}
                    onBlur={() => handleBlur('appliedDate', appliedDate)}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                      touched.appliedDate && errors.appliedDate
                        ? 'border-red-300 dark:border-red-700'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  {touched.appliedDate && errors.appliedDate && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.appliedDate}</p>
                  )}
                </div>
                )}

                <div className={status === 'saved' ? 'col-span-full sm:col-span-1' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${STATUS_OPTIONS.find(o => o.value === status)?.color}`} />
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Field */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any additional details, contacts, or reminders..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0 sm:rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 font-mono">Cmd</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400 font-mono">Enter</kbd>
                <span>to save</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleClose}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isFormValid || isSaving}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isFormValid && !isSaving
                      ? status === 'saved'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {status === 'saved' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        )}
                      </svg>
                      {status === 'saved' ? 'Save Job' : 'Save Application'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
