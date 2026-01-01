# Feature Specification: Company Research Chat

**Created:** January 2, 2026
**Status:** Ready for Implementation

---

## Overview

### Problem Statement
Job seekers need to deeply understand companies before interviews, but current research tools provide static, generic information. Users want to investigate companies like expert consultants - understanding business models, challenges, competitive positioning, and how to position themselves for the role.

### Solution
Replace the static Research tab with an interactive chat interface powered by Claude Sonnet. Users can ask follow-up questions, get AI-suggested deep-dive topics, and build comprehensive company knowledge through conversation. Research is grounded in real data via Perplexity API web search + job posting content.

---

## User Stories

**Primary:**
As a job seeker preparing for an interview,
I want to have an interactive research conversation about the company,
So that I can understand them deeply and position myself effectively.

**Additional:**
- As a user, I want my research conversations to persist so I can review them before my interview
- As a user, I want suggested questions so I don't have to think of what to ask
- As a user, I want to export key insights to my application notes

---

## User Experience

### User Flow

1. **Entry Point**: User opens an application card → clicks "Research" tab
2. **Initial State**:
   - Chat area is empty
   - 4 suggested question chips appear:
     - "What does this company do?"
     - "How do they make money?"
     - "Who are their competitors?"
     - "What challenges might they face?"
   - Text input at bottom: "Ask anything about [Company]..."
3. **First Question**: User clicks a chip or types custom question
4. **AI Response**:
   - Loading indicator shows "Researching..."
   - Claude Sonnet response appears with sources cited
   - 3-4 suggested follow-up questions appear below the response
5. **Continued Conversation**: User can click follow-ups or type new questions
6. **Export**: User clicks "Save to Notes" button to export insights

### UI/UX Details

**UI Pattern: Expandable Modal (Notion-style)**

1. **Research Tab** in CardDetailModal shows a preview/button
2. **Click** opens a centered modal with chat
3. **Expand button** in modal header → full-page `/research/[applicationId]`

**Components:**
- `ResearchChatModal` - Modal wrapper with expand button
- `ResearchChatPage` - Full-page version at `/research/[id]`
- `ResearchChat` - Shared chat component (used by both)
- `ChatMessage` - Individual message bubble (user/assistant)
- `SuggestedQuestions` - Clickable question chips
- `ChatInput` - Text input with send button

**Modal Layout:**
```
┌────────────────────────────────────────────────┐
│ Research: [Company]              [⤢ Expand] [×]│
├────────────────────────────────────────────────┤
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ What does this company do?              │  │
│  └─────────────────────────────────────────┘  │
│                                                │
│  ┌─────────────────────────────────────────┐  │
│  │ AI: [Company] is a...                   │  │
│  │                                         │  │
│  │ Sources: [1] [2] [3]                    │  │
│  │                                         │  │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │ │Follow-up1│ │Follow-up2│ │Follow-up3│ │  │
│  │ └──────────┘ └──────────┘ └──────────┘ │  │
│  └─────────────────────────────────────────┘  │
│                                                │
├────────────────────────────────────────────────┤
│ [Ask anything about Company...]             ▶ │
└────────────────────────────────────────────────┘
```

**Full-Page Layout:** Same as modal but fills viewport

**States:**
- **Empty**: Show initial suggested questions
- **Loading**: "Researching [Company]..." with animated dots
- **Error**: "Couldn't fetch research. Try again." with retry button
- **With History**: Show previous messages, continue conversation

---

## Technical Specification

### Frontend

**Components to create:**
- `app/components/ResearchChat.tsx` - Main chat container with message history
- `app/components/ChatMessage.tsx` - Message bubble component
- `app/components/SuggestedQuestions.tsx` - Clickable question chips

**State management:**
```typescript
interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  suggestedQuestions: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  suggestedFollowups?: string[];
  createdAt: string;
}

interface Source {
  title: string;
  url: string;
  snippet: string;
}
```

**API calls:**
- `POST /api/research/chat` - Send message, get AI response
- `GET /api/research/chat/[applicationId]` - Load chat history
- `POST /api/applications/[id]/notes` - Export insights to notes

### Backend

**Endpoints:**

`POST /api/research/chat`
```typescript
// Request
{
  applicationId: string;
  message: string;
  context: {
    company: string;
    role: string;
    jobUrl?: string;
  };
}

// Response
{
  id: string;
  content: string;
  sources: Source[];
  suggestedFollowups: string[];
}
```

`GET /api/research/chat/[applicationId]`
```typescript
// Response
{
  messages: ChatMessage[];
}
```

**Business logic:**

1. **Receive user question**
2. **Fetch context**:
   - Load previous chat history (for conversation context)
   - If first message, fetch job posting content from job_url
3. **Web search via Perplexity API**:
   - Query: "[Company name] [user question]"
   - Get top 5 relevant sources with snippets
4. **Generate response via Claude Sonnet**:
   - System prompt: Expert company analyst role
   - Include: Chat history, job posting content, Perplexity results
   - Request: Answer + 3-4 suggested follow-up questions
5. **Save to database**
6. **Return response**

**Claude System Prompt:**
```
You are an expert company analyst helping a job candidate prepare for an interview at [Company].

You have access to:
- The job posting for the [Role] position
- Web search results about the company
- Previous conversation context

Your goal is to help them understand the company like a consultant would - deeply and practically.

Guidelines:
- Be specific and cite sources when possible
- Focus on actionable insights they can use in interviews
- Highlight things that might come up in interview questions
- After your response, suggest 3-4 follow-up questions they should explore

Format your response in clear, scannable sections. Be conversational but substantive.
```

### Database

**New table: `research_chats`**
```sql
CREATE TABLE research_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id)
);

CREATE INDEX idx_research_chats_application ON research_chats(application_id);
```

**Messages JSONB structure:**
```json
[
  {
    "id": "uuid",
    "role": "user",
    "content": "What does this company do?",
    "createdAt": "2026-01-02T10:00:00Z"
  },
  {
    "id": "uuid",
    "role": "assistant",
    "content": "Company X is...",
    "sources": [...],
    "suggestedFollowups": ["How do they make money?", "..."],
    "createdAt": "2026-01-02T10:00:05Z"
  }
]
```

### External APIs

**Perplexity API:**
- Endpoint: `https://api.perplexity.ai/chat/completions`
- Model: `llama-3.1-sonar-small-128k-online` (includes web search)
- Cost: ~$0.005 per request
- Returns: Answer with inline citations

**Claude API (existing):**
- Model: `claude-sonnet-4-20250514`
- Cost: ~$0.01 per conversation turn
- Purpose: Generate contextual, conversational responses

---

## Acceptance Criteria

### Must Have
- [ ] Research tab shows chat interface instead of static view
- [ ] Initial state shows 4 business-focused suggested questions
- [ ] User can click suggested question or type custom question
- [ ] AI response includes relevant company information with sources
- [ ] 3-4 suggested follow-up questions appear after each response
- [ ] Chat history persists and loads when reopening
- [ ] "Save to Notes" exports conversation summary to application notes
- [ ] Loading state shows during AI processing
- [ ] Error state with retry option

### Edge Cases Handled
- [ ] No job URL available - research proceeds with company name only
- [ ] Perplexity API fails - fall back to Claude-only response
- [ ] Very long conversations - older messages summarized for context window
- [ ] Company not found online - graceful message suggesting manual research

---

## Test Scenarios

### Manual Testing

1. **First research session**
   - Open an application with job URL
   - Click "Research" tab
   - Verify 4 suggested questions appear
   - Click "What does this company do?"
   - Verify response includes relevant info and sources
   - Verify follow-up suggestions appear

2. **Continued conversation**
   - Ask 3-4 follow-up questions
   - Verify context is maintained
   - Close modal and reopen
   - Verify chat history is preserved

3. **Export to notes**
   - Have a research conversation
   - Click "Save to Notes"
   - Switch to Details tab
   - Verify notes field contains research summary

### Automated Testing
- Unit tests: Chat state management, message formatting
- Integration tests: API routes, database persistence
- E2E tests: Full chat flow, history persistence

---

## Out of Scope

- Real-time collaborative research (single user only)
- PDF/document upload for additional context
- Audio/voice interaction
- Research templates or saved prompts
- Sharing research with other users
- Research comparison across companies

---

## Implementation Notes

**Estimated complexity:** Medium-High (new AI integration, chat UI, persistence)

**Dependencies:**
- Perplexity API key (new)
- Claude API key (existing)
- Remove current static research implementation

**Files affected:**
- [ ] `app/components/CardDetailModal.tsx` - Replace Research tab content
- [ ] `app/components/ResearchChat.tsx` - Create new
- [ ] `app/components/ChatMessage.tsx` - Create new
- [ ] `app/components/SuggestedQuestions.tsx` - Create new
- [ ] `app/api/research/chat/route.ts` - Create new
- [ ] `app/api/research/chat/[applicationId]/route.ts` - Create new
- [ ] `lib/perplexity.ts` - Create Perplexity client
- [ ] `lib/research-chat.types.ts` - Create types
- [ ] `supabase/migrations/005_research_chats.sql` - Create new table
- [ ] Delete: `app/api/research/route.ts` (old static research)

**Risks/Considerations:**
- API costs: ~$0.015 per question (Perplexity + Claude). Budget consideration for heavy users.
- Rate limiting: Should implement per-user daily limits if needed
- Context window: Long conversations may need summarization strategy
- Perplexity API reliability: Need fallback if service is down

---

## Questions/Decisions Log

| Question | Decision |
|----------|----------|
| Where should chat live? | Replace current Research tab |
| Data sources? | Job posting + Perplexity web search |
| Persist history? | Yes, full chat history saved |
| Initial state? | Show 4 business-focused suggested questions |
| Follow-up suggestions? | Show 3-4 after each AI response |
| AI model? | Claude Sonnet for quality |
| Web search service? | Perplexity API |
| Export feature? | Save to application notes field |
