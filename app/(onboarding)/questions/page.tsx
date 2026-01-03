'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  OnboardingCard,
  OnboardingTitle,
  OnboardingSubtitle,
  OnboardingFooter,
  TimeIndicator,
} from '../../components/onboarding/OnboardingCard';

// Hardcoded questions for now - will be AI-generated later
const QUESTIONS_WITH_CV = [
  {
    id: 'achievements',
    text: "Your experience looks solid, but we didn't spot any specific wins. What's an accomplishment you're most proud of?",
    placeholder: 'e.g., "Grew user base from 10K to 50K in 6 months" or "Reduced support tickets by 40%"',
  },
  {
    id: 'skills',
    text: "What are your top professional skills? Think tools, technologies, or expertise areas.",
    placeholder: 'e.g., Python, project management, data analysis, customer research, Figma',
  },
  {
    id: 'target',
    text: "What type of role are you looking for? This helps us tailor your CV to the right opportunities.",
    placeholder: 'e.g., Senior Product Manager, Frontend Developer, Marketing Lead',
  },
];

const QUESTIONS_NO_CV = [
  {
    id: 'current_role',
    text: "What's your current or most recent job title?",
    placeholder: 'e.g., Product Manager, Software Engineer, Marketing Coordinator',
  },
  {
    id: 'company_duration',
    text: "What company was that at, and how long were you there?",
    placeholder: 'e.g., Acme Corp, 2 years 3 months',
  },
  {
    id: 'responsibilities',
    text: "What were your main responsibilities? Just 2-3 bullets is perfect.",
    placeholder: "e.g.,\n- Managed product roadmap for mobile app\n- Led cross-functional team of 8\n- Ran weekly stakeholder meetings",
  },
  {
    id: 'achievement',
    text: "What's an achievement you're proud of from this role?",
    placeholder: 'e.g., Launched feature that increased user retention by 30%',
  },
  {
    id: 'skills',
    text: "What are your strongest professional skills?",
    placeholder: 'e.g., SQL, stakeholder management, A/B testing, Jira, user research',
  },
];

// Helper to get initial state from localStorage (safe for SSR)
function getInitialState() {
  if (typeof window === 'undefined') {
    return { questions: QUESTIONS_WITH_CV, answers: {} };
  }

  const cvSource = localStorage.getItem('onboarding_cv_source');
  const cvText = localStorage.getItem('onboarding_cv_text');
  const savedAnswers = localStorage.getItem('onboarding_answers');

  const questions = cvSource === 'scratch' || !cvText || cvText.trim() === ''
    ? QUESTIONS_NO_CV
    : QUESTIONS_WITH_CV;

  const answers = savedAnswers ? JSON.parse(savedAnswers) : {};

  return { questions, answers };
}

export default function QuestionsPage() {
  const router = useRouter();

  // Initialize all state from localStorage to avoid useEffect setState
  const initialState = useMemo(() => getInitialState(), []);

  const [questions] = useState(initialState.questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialState.answers);
  const [currentAnswer, setCurrentAnswer] = useState(() => {
    const firstQuestion = initialState.questions[0];
    return firstQuestion ? (initialState.answers[firstQuestion.id] || '') : '';
  });
  const [skipMessage, setSkipMessage] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const saveAndProceed = useCallback((includeCurrentAnswer: boolean) => {
    const updatedAnswers = { ...answers };

    if (includeCurrentAnswer && currentAnswer.trim()) {
      updatedAnswers[currentQuestion.id] = currentAnswer;
    }

    setAnswers(updatedAnswers);
    localStorage.setItem('onboarding_answers', JSON.stringify(updatedAnswers));

    if (isLastQuestion) {
      router.push('/review');
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      setCurrentAnswer(updatedAnswers[nextQuestion?.id] || '');
    }
  }, [answers, currentAnswer, currentQuestion, currentIndex, isLastQuestion, questions, router]);

  const handleContinue = () => {
    setSkipMessage(null);
    saveAndProceed(true);
  };

  const handleSkip = () => {
    setSkipMessage("No problem - you can always add this later");
    setTimeout(() => {
      setSkipMessage(null);
      saveAndProceed(false);
    }, 800);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      // Save current answer before going back
      if (currentAnswer.trim()) {
        const updatedAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
        setAnswers(updatedAnswers);
        localStorage.setItem('onboarding_answers', JSON.stringify(updatedAnswers));
      }

      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevQuestion = questions[prevIndex];
      setCurrentAnswer(answers[prevQuestion?.id] || '');
    }
  };

  if (!currentQuestion) return null;

  return (
    <OnboardingCard>
      <TimeIndicator text="Usually 2-3 questions" />
      <OnboardingTitle>A few quick questions</OnboardingTitle>
      <OnboardingSubtitle>
        Almost there - these answers make your CV shine
      </OnboardingSubtitle>

      {/* Question counter */}
      <div className="flex justify-center mb-6">
        <span className="text-sm text-gray-500">
          Question <span className="text-gray-900 font-semibold">{currentIndex + 1}</span> of{' '}
          <span className="text-gray-900 font-semibold">{questions.length}</span>
        </span>
      </div>

      {/* Question content with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Question text */}
          <p className="text-gray-900 text-lg mb-4 leading-relaxed">
            {currentQuestion.text}
          </p>

          {/* Answer input */}
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="
              w-full h-32 px-4 py-3
              bg-gray-50 border border-gray-200
              rounded-xl text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
              resize-none transition-all duration-200
              text-sm leading-relaxed
            "
            autoFocus
          />
        </motion.div>
      </AnimatePresence>

      {/* Skip reassurance message */}
      <AnimatePresence>
        {skipMessage && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-emerald-600 text-center mt-3"
          >
            {skipMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <OnboardingFooter className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentIndex > 0 && (
            <button
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-900 text-sm transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-900 text-sm transition-colors"
          >
            Skip for now
          </button>
        </div>

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
          <span>{isLastQuestion ? 'Review CV' : 'Continue'}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </OnboardingFooter>
    </OnboardingCard>
  );
}
