'use client';

import { useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  OnboardingCard,
  OnboardingTitle,
  OnboardingSubtitle,
  OnboardingFooter,
  OnboardingHelperText,
  TimeIndicator,
} from '../../components/onboarding/OnboardingCard';

const PLACEHOLDER_TEXT = `Paste your CV or experience here...

Example:
Software Engineer at TechCorp (2021-2024)
- Built payment processing system handling $2M daily
- Led migration to cloud infrastructure
- Managed team of 3 junior developers`;

// Helper to get initial CV text from localStorage (safe for SSR)
function getInitialCVText(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('onboarding_cv_text') || '';
}

export default function CVInputPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use lazy initialization to avoid effect-based setState
  const [cvText, setCvText] = useState(() => getInitialCVText());
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Save CV text to localStorage
  const saveCVText = (text: string) => {
    setCvText(text);
    localStorage.setItem('onboarding_cv_text', text);
    localStorage.setItem('onboarding_cv_source', 'paste');
  };

  const handleContinue = () => {
    if (cvText.trim()) {
      localStorage.setItem('onboarding_cv_text', cvText);
      localStorage.setItem('onboarding_cv_source', 'paste');
    }
    router.push('/questions');
  };

  const handleNoCVClick = () => {
    localStorage.setItem('onboarding_cv_text', '');
    localStorage.setItem('onboarding_cv_source', 'scratch');
    router.push('/questions');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFileName(file.name);

    // For now, we just read text files. PDF parsing will be done by API later.
    if (file.type === 'text/plain') {
      const text = await file.text();
      saveCVText(text);
    } else {
      // Simulate PDF extraction (will be replaced with actual API call)
      // For now, show a placeholder message
      setTimeout(() => {
        saveCVText(`[Content extracted from ${file.name}]\n\nPDF parsing will be implemented via API.`);
        setIsUploading(false);
      }, 1500);
      return;
    }

    setIsUploading(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <OnboardingCard>
      <TimeIndicator text="Takes about 30 seconds" />
      <OnboardingTitle>Let&apos;s build your master CV</OnboardingTitle>
      <OnboardingSubtitle>
        Don&apos;t worry about formatting. Just paste whatever you have - we&apos;ll organize it for you.
      </OnboardingSubtitle>

      {/* Textarea for CV input */}
      <div className="relative">
        <textarea
          value={cvText}
          onChange={(e) => saveCVText(e.target.value)}
          placeholder={PLACEHOLDER_TEXT}
          className="
            w-full h-64 px-4 py-3
            bg-gray-50 border border-gray-200
            rounded-xl text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
            resize-none transition-all duration-200
            text-sm leading-relaxed
          "
        />

        {/* Character count */}
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          {cvText.length > 0 && `${cvText.length.toLocaleString()} characters`}
        </div>
      </div>

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      <motion.button
        onClick={handleUploadClick}
        disabled={isUploading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="
          w-full mt-4 px-4 py-3
          bg-gray-50 border border-gray-200 border-dashed
          rounded-xl text-gray-500
          hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700
          transition-all duration-200
          flex items-center justify-center gap-2
          disabled:opacity-50 disabled:cursor-wait
        "
      >
        {isUploading ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Extracting text from your CV...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>{fileName ? `Uploaded: ${fileName}` : 'Or upload a PDF'}</span>
          </>
        )}
      </motion.button>

      <OnboardingHelperText>
        Works with PDF, Word docs, and plain text
      </OnboardingHelperText>

      <OnboardingFooter className="flex items-center justify-between">
        <button
          onClick={handleNoCVClick}
          className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
        >
          I don&apos;t have a CV yet
        </button>

        <motion.button
          onClick={handleContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            px-6 py-2.5
            bg-gray-900
            text-white font-medium rounded-lg
            hover:bg-gray-800
            transition-all duration-200
            shadow-lg shadow-gray-900/25
            flex items-center gap-2
          "
        >
          <span>Continue</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </OnboardingFooter>
    </OnboardingCard>
  );
}
