// Research Chat Types

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  suggestedFollowups?: string[];
  createdAt: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  suggestedQuestions: string[];
}

export interface ResearchChatRequest {
  applicationId: string;
  message: string;
  context: {
    company: string;
    role: string;
    jobUrl?: string;
  };
}

export interface ResearchChatResponse {
  id: string;
  content: string;
  sources: Source[];
  suggestedFollowups: string[];
}

// Initial suggested questions for new research sessions
export const INITIAL_QUESTIONS = [
  "What does this company do?",
  "How do they make money?",
  "Who are their competitors?",
  "What challenges might they face?"
];
