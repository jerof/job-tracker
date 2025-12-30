'use client';

import { Application, ApplicationStatus } from '@/lib/types';
import { Draggable } from '@hello-pangea/dnd';
import { EmailIcon } from './EmailIcon';

interface ApplicationCardProps {
  application: Application;
  index: number;
  onClick: (application: Application) => void;
  emailCount?: number;
  onEmailClick?: (application: Application) => void;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: 'bg-purple-500',
  applied: 'bg-blue-500',
  interviewing: 'bg-violet-500',
  offer: 'bg-emerald-500',
  closed: 'bg-slate-400',
};

const CLOSE_REASON_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  rejected: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  withdrawn: { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
  ghosted: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  accepted: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
};

export function ApplicationCard({ application, index, onClick, emailCount = 0, onEmailClick }: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const statusColor = STATUS_COLORS[application.status];
  const closeReasonStyle = application.closeReason ? CLOSE_REASON_STYLES[application.closeReason] : null;

  const handleEmailClick = () => {
    if (onEmailClick) {
      onEmailClick(application);
    }
  };

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(application)}
          className={`
            group relative
            bg-white dark:bg-slate-800
            rounded-lg
            border border-slate-200 dark:border-slate-700
            p-3.5 mb-2
            cursor-pointer
            transition-all duration-200 ease-out
            ${snapshot.isDragging
              ? 'shadow-xl ring-2 ring-blue-500/40 scale-[1.02] rotate-1'
              : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
            }
          `}
        >
          {/* Status indicator - left border accent */}
          <div
            className={`
              absolute left-0 top-3 bottom-3 w-0.5 rounded-full
              ${statusColor}
              transition-all duration-200
              group-hover:h-[calc(100%-16px)]
            `}
          />

          <div className="pl-2.5">
            {/* Company name */}
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight truncate">
              {application.company}
            </h3>

            {/* Role */}
            {application.role && (
              <p className="text-slate-500 dark:text-slate-400 text-[13px] mt-0.5 truncate">
                {application.role}
              </p>
            )}

            {/* Bottom row: date + indicators */}
            <div className="flex items-center justify-between mt-2.5 gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                {application.status === 'saved' && !application.appliedDate
                  ? `Saved ${formatDate(application.createdAt)}`
                  : application.appliedDate
                    ? formatDate(application.appliedDate)
                    : formatDate(application.createdAt)}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Job URL link for saved jobs */}
                {application.jobUrl && (
                  <a
                    href={application.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-[11px] font-medium"
                    title="Open job posting"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View
                  </a>
                )}

                {/* Email icon with count */}
                {emailCount > 0 && onEmailClick && (
                  <EmailIcon count={emailCount} onClick={handleEmailClick} />
                )}

                {/* Notes indicator */}
                {application.notes && (
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    title="Has notes"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </span>
                )}

                {/* Close reason badge */}
                {closeReasonStyle && application.closeReason && (
                  <span
                    className={`
                      inline-flex items-center gap-1
                      text-[11px] font-medium
                      px-1.5 py-0.5 rounded
                      ${closeReasonStyle.bg} ${closeReasonStyle.text}
                    `}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${closeReasonStyle.dot}`} />
                    {application.closeReason.charAt(0).toUpperCase() + application.closeReason.slice(1)}
                  </span>
                )}

                {/* Location indicator (only show on hover or if no other badges) */}
                {application.location && !closeReasonStyle && (
                  <span
                    className="hidden group-hover:flex items-center gap-0.5 text-[11px] text-slate-400 dark:text-slate-500"
                    title={application.location}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="truncate max-w-[80px]">{application.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
