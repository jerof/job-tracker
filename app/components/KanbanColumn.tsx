'use client';

import { Application, ApplicationStatus } from '@/lib/types';
import { Droppable } from '@hello-pangea/dnd';
import { ApplicationCard } from './ApplicationCard';
import { ReactNode } from 'react';

interface KanbanColumnProps {
  id: ApplicationStatus;
  title: string;
  applications: Application[];
  onCardClick: (application: Application) => void;
  isMobile?: boolean;
}

const COLUMN_CONFIG: Record<ApplicationStatus, {
  icon: ReactNode;
  dotColor: string;
  countBg: string;
  countText: string;
}> = {
  saved: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    dotColor: 'bg-purple-500',
    countBg: 'bg-purple-100 dark:bg-purple-900/30',
    countText: 'text-purple-600 dark:text-purple-400',
  },
  applied: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    dotColor: 'bg-blue-500',
    countBg: 'bg-blue-100 dark:bg-blue-900/30',
    countText: 'text-blue-600 dark:text-blue-400',
  },
  interviewing: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    dotColor: 'bg-violet-500',
    countBg: 'bg-violet-100 dark:bg-violet-900/30',
    countText: 'text-violet-600 dark:text-violet-400',
  },
  offer: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    dotColor: 'bg-emerald-500',
    countBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    countText: 'text-emerald-600 dark:text-emerald-400',
  },
  closed: {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    dotColor: 'bg-slate-400',
    countBg: 'bg-slate-100 dark:bg-slate-700',
    countText: 'text-slate-600 dark:text-slate-400',
  },
};

export function KanbanColumn({
  id,
  title,
  applications,
  onCardClick,
  isMobile = false,
}: KanbanColumnProps) {
  const config = COLUMN_CONFIG[id];

  return (
    <div
      className={`
        flex flex-col
        ${isMobile ? 'w-full h-full' : 'w-72 shrink-0'}
        bg-slate-50/50 dark:bg-slate-900/50
        rounded-xl
        transition-colors duration-200
      `}
    >
      {/* Column Header */}
      {!isMobile && (
        <div className="px-3 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
            <h2 className="font-medium text-slate-700 dark:text-slate-200 text-sm">
              {title}
            </h2>
          </div>
          <span
            className={`
              text-xs font-medium
              px-2 py-0.5 rounded-full
              ${config.countBg} ${config.countText}
              tabular-nums
            `}
          >
            {applications.length}
          </span>
        </div>
      )}

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 px-2 pb-2 min-h-[280px] overflow-y-auto
              transition-colors duration-200
              ${snapshot.isDraggingOver
                ? 'bg-blue-50/50 dark:bg-blue-900/10'
                : ''
              }
              rounded-b-xl
            `}
          >
            {/* Drag over indicator */}
            {snapshot.isDraggingOver && (
              <div className="mb-2 py-2 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 transition-all duration-200">
                <p className="text-center text-xs text-blue-500 dark:text-blue-400 font-medium">
                  Drop here
                </p>
              </div>
            )}

            {applications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                application={app}
                index={index}
                onClick={onCardClick}
              />
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                  {config.icon}
                </div>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No applications
                </p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                  Drag cards here or add new
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
