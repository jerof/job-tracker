'use client';

import { useState, useEffect } from 'react';

interface EmptyStateProps {
  onConnectGmail: () => void;
  onAddApplication: () => void;
  gmailConnected?: boolean;
}

export function EmptyState({ onConnectGmail, onAddApplication, gmailConnected }: EmptyStateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<'gmail' | 'add' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 max-w-lg mx-auto transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Animated Illustration */}
      <div className="relative mb-8">
        {/* Background circles with subtle animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 animate-pulse" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 animate-pulse" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        </div>

        {/* Main icon container */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Floating cards illustration */}
          <div className="relative">
            {/* Card 1 - Back */}
            <div
              className="absolute -left-3 -top-2 w-16 h-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transform -rotate-12 transition-transform duration-300"
              style={{ transform: hoveredButton ? 'rotate(-12deg) translateY(-4px)' : 'rotate(-12deg)' }}
            >
              <div className="p-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-500 mb-2" />
                <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="w-6 h-1 bg-gray-100 dark:bg-gray-700 rounded mt-1" />
              </div>
            </div>

            {/* Card 2 - Middle */}
            <div
              className="absolute left-2 top-1 w-16 h-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transform rotate-3 transition-transform duration-300"
              style={{ transform: hoveredButton ? 'rotate(3deg) translateY(-6px)' : 'rotate(3deg)' }}
            >
              <div className="p-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 mb-2" />
                <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="w-6 h-1 bg-gray-100 dark:bg-gray-700 rounded mt-1" />
              </div>
            </div>

            {/* Card 3 - Front */}
            <div
              className="relative w-16 h-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transform rotate-12 transition-transform duration-300"
              style={{ transform: hoveredButton ? 'rotate(12deg) translateY(-8px) scale(1.05)' : 'rotate(12deg)' }}
            >
              <div className="p-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 mb-2" />
                <div className="w-10 h-1.5 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="w-6 h-1 bg-gray-100 dark:bg-gray-700 rounded mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Your job search starts here
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
          {gmailConnected
            ? 'Click sync to import applications from your inbox, or add your first application manually.'
            : 'Connect your Gmail to automatically track applications, or start by adding one manually.'
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {!gmailConnected && (
          <button
            onClick={onConnectGmail}
            onMouseEnter={() => setHoveredButton('gmail')}
            onMouseLeave={() => setHoveredButton(null)}
            className="group relative flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            {/* Hover background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="relative flex items-center gap-3">
              {/* Gmail Icon */}
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-1.364V8.273l-9 5.727-9-5.727V21H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 8.545l8.073-5.052C21.69 2.28 24 3.434 24 5.457z"/>
                  <path fill="#4285F4" d="M24 5.457v.273l-9 5.818V21h6.364V11.454L24 9.455V5.457z"/>
                  <path fill="#34A853" d="M0 5.457v.273l9 5.818V21H2.636V11.454L0 9.455V5.457z"/>
                  <path fill="#FBBC05" d="M3 8.273l9 5.727 9-5.727V5.457c0-2.023-2.31-3.177-3.927-1.965L12 8.545 3.927 3.492C2.309 2.28 0 3.434 0 5.457v2.816z"/>
                </svg>
              </div>
              <div className="text-left">
                <span className="block font-semibold text-gray-900 dark:text-white">Connect Gmail</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">Auto-import applications</span>
              </div>
            </div>

            <svg className="relative w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <button
          onClick={onAddApplication}
          onMouseEnter={() => setHoveredButton('add')}
          onMouseLeave={() => setHoveredButton(null)}
          className={`group relative flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium transition-all duration-200 overflow-hidden ${
            gmailConnected
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {/* Animated plus icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90 ${
            gmailConnected ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <svg className={`w-5 h-5 ${gmailConnected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-left">
            <span className="block font-semibold">Add Manually</span>
            <span className={`block text-xs ${gmailConnected ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
              Track any application
            </span>
          </div>
        </button>
      </div>

      {/* Tips Section */}
      <div className="mt-12 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick tips</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Drag cards between columns to update status</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Click any card to add notes or edit details</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Use search and filters to find applications fast</span>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 font-mono">N</kbd>
        <span>to add new application</span>
      </div>
    </div>
  );
}
