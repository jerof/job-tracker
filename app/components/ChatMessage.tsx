'use client';

import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '@/lib/research-chat.types';
import { SuggestedQuestions } from './SuggestedQuestions';

interface ChatMessageProps {
  message: ChatMessageType;
  onFollowupSelect?: (question: string) => void;
  isLatest?: boolean;
}

export function ChatMessage({ message, onFollowupSelect, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[85%]
          ${isUser
            ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2.5'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-bl-md px-4 py-3'
          }
        `}
      >
        {/* Message content */}
        {isUser ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        ) : (
          <div className="text-[13px] leading-relaxed [&>h1]:text-base [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-1.5 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-1 [&>h3]:text-[13px] [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:my-1.5 [&>ul]:my-1.5 [&>ul]:pl-4 [&>ul>li]:my-0.5 [&>ol]:my-1.5 [&>ol]:pl-4 [&_strong]:font-semibold">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Sources (assistant only) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title={source.snippet || source.title}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="truncate max-w-[120px]">{source.title || `Source ${index + 1}`}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Suggested follow-ups (assistant only, only for latest message) */}
        {!isUser && isLatest && message.suggestedFollowups && message.suggestedFollowups.length > 0 && onFollowupSelect && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Explore further</p>
            <SuggestedQuestions
              questions={message.suggestedFollowups}
              onSelect={onFollowupSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
