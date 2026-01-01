'use client';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({ questions, onSelect, disabled = false }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => onSelect(question)}
          disabled={disabled}
          className={`
            px-3 py-2
            text-sm text-left
            rounded-lg
            border border-slate-200 dark:border-slate-700
            bg-white dark:bg-slate-800
            text-slate-700 dark:text-slate-300
            transition-all duration-200
            ${disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm cursor-pointer'
            }
          `}
        >
          {question}
        </button>
      ))}
    </div>
  );
}
