# Feature Specification: Onboarding Flow with CV Booster

**Created:** 2026-01-02
**Status:** Ready for Implementation

---

## Overview

### Problem Statement
Users signing up for job trackers face two problems:
1. **Cold start problem** - Empty boards provide no value until users manually add data
2. **CV quality problem** - Most users either don't have a master CV, or have outdated/weak CVs that produce poor tailored results

Current competitors show an empty Kanban board after signup - this is table stakes, not differentiation.

### Solution
A 7-step onboarding flow that:
1. Accepts whatever CV material the user has (text paste, PDF upload, or nothing)
2. Uses AI to analyze gaps and ask 3-4 smart questions to enhance the CV
3. Generates an enhanced Master CV from the combined input
4. Immediately generates a tailored CV for a job the user provides
5. Delivers the "aha moment" in under 2 minutes: seeing a professional, tailored CV

**Value Prop:** "Paste your experience. Answer 3 questions. Get tailored CVs for every job."

---

## User Stories

**Primary:**
As a job seeker signing up
I want to quickly create a polished, tailored CV
So that I can immediately apply to a job I'm interested in

**Secondary:**
- As a user with no CV, I want to answer questions to build one from scratch
- As a user with an outdated CV, I want AI to identify and fill gaps
- As a user in a hurry, I want to skip questions and still get value

---

## User Experience

### Complete Flow (7 Steps, <2 minutes)

```
Step 0: Landing Page (pre-signup)
  ↓ Click "Start Free"
Step 1: Google OAuth (5s)
  ↓ Single click
Step 2: CV Input (30s)
  ↓ Paste text or upload PDF
Step 3: AI Questions (30s)
  ↓ Answer 3-4 questions (or skip)
Step 4: Review Master CV (10s)
  ↓ See enhanced CV, optional edit
Step 5: Add Job URL (20s)
  ↓ Paste job posting URL
Step 6: AHA Moment (10s)
  ↓ See tailored CV + download PDF
Step 7: Board View
  → Job tracked with CV badge
```

### Step-by-Step UI Details

#### Step 1: Google OAuth
```
+--------------------------------------------------+
|  [Logo] Job Tracker                              |
|                                                   |
|  Create your account                              |
|                                                   |
|  [Continue with Google]  ← Large, primary button  |
|                                                   |
|  By continuing, you agree to our Terms & Privacy  |
+--------------------------------------------------+
```

#### Step 2: CV Input (Two Options)
```
+--------------------------------------------------+
|  Let's build your master CV                      |
|                                                   |
|  Progress: ●○○○                                  |
|                                                   |
|  +--------------------------------------------+  |
|  | Paste your CV or experience below...       |  |
|  |                                            |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                   |
|  [Upload PDF instead]                            |
|                                                   |
|  [I don't have a CV →]  ← Skips to extended Q's  |
+--------------------------------------------------+
```

**PDF Upload Flow:**
- User clicks "Upload PDF"
- File picker opens (accept: .pdf, .doc, .docx)
- On upload: show spinner "Extracting text..."
- Text extracted and shown in textarea for confirmation
- User can edit extracted text before proceeding

#### Step 3: AI Questions (Wizard Style)
```
+--------------------------------------------------+
|  A few quick questions                           |
|                                                   |
|  Progress: ●●○○                                  |
|                                                   |
|  Question 1 of 3                                 |
|                                                   |
|  We noticed your CV doesn't mention specific     |
|  achievements. What's a win you're most          |
|  proud of at [Company Name]?                     |
|                                                   |
|  +--------------------------------------------+  |
|  | e.g., "Increased sales by 40%" or          |  |
|  | "Led team of 5 to ship product on time"    |  |
|  +--------------------------------------------+  |
|                                                   |
|  [Skip this question]        [Continue →]        |
+--------------------------------------------------+
```

**Question Logic (AI-Determined):**

| CV Gap Detected | Question Asked |
|-----------------|----------------|
| No metrics/achievements | "What's a measurable win you're proud of?" |
| Missing skills section | "What are your top 5 professional skills?" |
| No target role clear | "What type of role are you looking for?" |
| Old experience only | "What have you been doing recently?" |
| No education | "What's your educational background?" |
| Generic descriptions | "Can you describe a specific project you led?" |

**For users with NO CV (5-7 questions):**
1. "What's your current or most recent job title?"
2. "What company and how long?"
3. "Describe your main responsibilities in 2-3 bullets"
4. "What's an achievement you're proud of?"
5. "What are your top skills?"
6. "What's your educational background?"
7. "What role are you targeting?"

#### Step 4: Review Master CV
```
+--------------------------------------------------+
|  Your enhanced CV                                |
|                                                   |
|  Progress: ●●●○                                  |
|                                                   |
|  +--------------------------------------------+  |
|  | JOHN DOE                                   |  |
|  | Software Engineer | john@email.com         |  |
|  |                                            |  |
|  | EXPERIENCE                                 |  |
|  | Senior Developer at TechCorp (2020-2024)   |  |
|  | • Led team of 5 engineers...               |  |
|  | • Increased deployment speed by 40%...     |  |
|  |                                            |  |
|  | [Editable - click to modify]               |  |
|  +--------------------------------------------+  |
|                                                   |
|  This is your master CV. We'll tailor it for     |
|  each job you apply to.                          |
|                                                   |
|  [Edit CV]                   [Looks good! →]     |
+--------------------------------------------------+
```

#### Step 5: Add Job URL
```
+--------------------------------------------------+
|  Let's tailor your first CV                      |
|                                                   |
|  Progress: ●●●●                                  |
|                                                   |
|  Paste a job posting URL:                        |
|                                                   |
|  +--------------------------------------------+  |
|  | https://jobs.lever.co/stripe/abc123        |  |
|  +--------------------------------------------+  |
|                                                   |
|  Or enter manually:                              |
|  Company: [_________]  Role: [_________]         |
|                                                   |
|  [Skip for now →]            [Generate CV →]     |
+--------------------------------------------------+
```

#### Step 6: AHA Moment - Tailored CV
```
+--------------------------------------------------+
|  ✨ Your tailored CV is ready!                   |
|                                                   |
|  Tailored for: Software Engineer at Stripe       |
|                                                   |
|  +--------------------------------------------+  |
|  |  [PDF Preview of Tailored CV]              |  |
|  |                                            |  |
|  |  Highlighted: Skills matched to JD         |  |
|  |  Reordered: Most relevant experience first |  |
|  +--------------------------------------------+  |
|                                                   |
|  [Download PDF]              [Go to Dashboard →] |
+--------------------------------------------------+
```

**Key Elements:**
- Celebration moment (confetti animation optional)
- Side-by-side or highlighted diff showing tailoring
- Immediate download option
- Clear path to dashboard

#### Step 7: Dashboard with Job Tracked
```
+--------------------------------------------------+
|  Your Job Search Command Center                  |
|                                                   |
|  +--------+  +---------+  +------------+         |
|  | Saved  |  | Applied |  | Interview  |         |
|  |--------|  |---------|  |------------|         |
|  |[Stripe]|  |         |  |            |         |
|  | [CV]   |  |         |  |            |         |
|  +--------+  +---------+  +------------+         |
|                                                   |
|  [+ Add another job]                             |
+--------------------------------------------------+
```

### States

**Loading States:**
- PDF upload: "Extracting text from your CV..."
- AI analysis: "Analyzing your experience..."
- CV generation: "Creating your tailored CV..."
- Each shows progress indicator (spinner or progress bar)

**Empty States:**
- No CV text: Show helpful placeholder text
- Skipped all questions: Generate with warning banner

**Error States:**
- PDF extraction failed: "Couldn't read PDF. Try pasting text instead."
- Invalid job URL: "Couldn't fetch job details. Enter manually?"
- AI generation failed: "Something went wrong. [Retry] or [Skip]"

**Warning States:**
- Minimal input: "Your CV may be thin. Consider answering more questions."
- Job URL unreachable: "Couldn't fetch job. We'll use what you entered."

---

## Technical Specification

### Frontend

**New Pages:**
```
app/(onboarding)/
├── layout.tsx              # Onboarding layout (no side nav)
├── cv-input/page.tsx       # Step 2: CV input
├── questions/page.tsx      # Step 3: AI questions
├── review/page.tsx         # Step 4: Review master CV
├── add-job/page.tsx        # Step 5: Add job URL
└── success/page.tsx        # Step 6: AHA moment
```

**New Components:**
```
app/components/onboarding/
├── OnboardingLayout.tsx    # Progress bar, step container
├── ProgressIndicator.tsx   # 4-step progress dots
├── CVInputForm.tsx         # Text area + PDF upload
├── PDFUploader.tsx         # PDF upload with extraction
├── QuestionWizard.tsx      # Single question display
├── CVPreview.tsx           # Master CV preview/edit
├── JobURLInput.tsx         # URL input with validation
├── TailoredCVResult.tsx    # Success screen with PDF
└── ConfettiCelebration.tsx # Optional celebration animation
```

**State Management:**
```typescript
// Onboarding state (stored in context + localStorage)
interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  cvInput: string;           // Raw CV text
  cvSource: 'paste' | 'pdf' | 'scratch';
  questions: Question[];     // AI-generated questions
  answers: Record<string, string>;  // Question ID -> answer
  masterCV: string;          // Enhanced master CV
  jobUrl?: string;
  jobDetails?: { company: string; role: string; };
  tailoredCVUrl?: string;    // Generated PDF URL
  applicationId?: string;    // Created application
}
```

### Backend

**New API Routes:**

1. `POST /api/onboarding/analyze-cv`
   - Input: `{ cvText: string }`
   - Process: Analyze CV for gaps using Claude Haiku
   - Output: `{ questions: Question[], cvQuality: 'good' | 'thin' | 'none' }`

```typescript
interface Question {
  id: string;
  text: string;
  placeholder: string;
  gapType: 'achievements' | 'skills' | 'target' | 'recent' | 'education' | 'project';
  required: boolean;
}
```

2. `POST /api/onboarding/enhance-cv`
   - Input: `{ cvText: string, answers: Record<string, string> }`
   - Process: Merge CV + answers into enhanced master CV
   - Output: `{ masterCV: string }`

3. `POST /api/onboarding/complete`
   - Input: `{ masterCV: string, jobUrl?: string, jobDetails?: object }`
   - Process: Save master CV, create application, generate tailored CV
   - Output: `{ applicationId: string, tailoredCVUrl: string }`

4. `POST /api/cv/parse-pdf`
   - Input: FormData with PDF file
   - Process: Extract text from PDF using pdf-parse
   - Output: `{ text: string, success: boolean }`

**AI Prompts:**

*CV Analysis Prompt:*
```
Analyze this CV and identify 3-4 gaps that would improve job applications.

CV:
{cvText}

Return JSON with questions to fill gaps:
{
  "questions": [
    {
      "id": "achievements",
      "text": "What's a measurable achievement from your most recent role?",
      "placeholder": "e.g., Increased revenue by 30%",
      "gapType": "achievements",
      "required": false
    }
  ],
  "cvQuality": "thin" // or "good" or "none"
}

Rules:
- Only ask about genuine gaps (don't ask about skills if they're listed)
- Max 4 questions for existing CVs, 7 for no CV
- Make questions specific to their industry/experience
- Always include target role question if unclear
```

*CV Enhancement Prompt:*
```
Enhance this CV by incorporating the additional information provided.

Original CV:
{cvText}

Additional Information:
{formatted answers}

Create an enhanced master CV that:
1. Integrates all new information naturally
2. Maintains professional formatting
3. Quantifies achievements where possible
4. Keeps total length reasonable (1-2 pages worth)
5. Never invents information not provided

Output the enhanced CV as plain text.
```

### Database

**Schema Changes:**

```sql
-- Add onboarding tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  onboarding_completed_at TIMESTAMPTZ;

ALTER TABLE users ADD COLUMN IF NOT EXISTS
  onboarding_step INTEGER DEFAULT 1;

-- Store CV analysis results (optional, for analytics)
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_source TEXT, -- 'paste', 'pdf', 'scratch'
  cv_quality TEXT, -- 'good', 'thin', 'none'
  questions_asked INTEGER,
  questions_answered INTEGER,
  completed_at TIMESTAMPTZ,
  time_to_complete_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_onboarding_sessions_user ON onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_sessions_completed ON onboarding_sessions(completed_at);
```

**Existing Tables Used:**
- `cvs` - Store enhanced master CV
- `applications` - Create first application
- Supabase Storage - Store tailored CV PDF

---

## Acceptance Criteria

### Must Have
- [ ] User can paste CV text or upload PDF
- [ ] PDF text extraction works for standard CV formats
- [ ] AI generates 3-4 relevant questions based on CV gaps
- [ ] Questions display one at a time (wizard style)
- [ ] All questions are skippable
- [ ] Enhanced master CV is generated and saveable
- [ ] User can input job URL or manual details
- [ ] Tailored CV PDF is generated and downloadable
- [ ] Application is created and visible on board
- [ ] Total flow completable in under 2 minutes
- [ ] Progress is saved (can resume if user leaves)
- [ ] Works on mobile (responsive design)

### Edge Cases Handled
- [ ] Empty CV input → Extended questions (5-7)
- [ ] PDF extraction fails → Fallback to text paste
- [ ] User skips all questions → Generate with thin CV warning
- [ ] Job URL unreachable → Allow manual entry
- [ ] User refreshes mid-flow → Resume from saved step
- [ ] Very long CV → Truncate intelligently for analysis

---

## Test Scenarios

### Manual Testing

1. **Happy Path - Existing CV**
   - Given: User has a decent CV
   - When: Paste CV → Answer 3 questions → Add job URL
   - Then: Tailored CV generated, job tracked
   - Expected time: < 2 minutes

2. **No CV Path**
   - Given: User clicks "I don't have a CV"
   - When: Answer 5-7 questions
   - Then: Master CV created from scratch
   - Expected: Professional-looking CV output

3. **PDF Upload**
   - Given: User uploads PDF CV
   - When: Click upload, select file
   - Then: Text extracted and shown for confirmation

4. **Skip Everything**
   - Given: User in a hurry
   - When: Skip all questions, skip job URL
   - Then: Still reaches dashboard with master CV saved

5. **Resume Flow**
   - Given: User completes step 3, closes browser
   - When: Returns and logs in
   - Then: Resumes at step 4

### Automated Testing
- Unit tests for CV analysis API
- Unit tests for CV enhancement API
- Integration test for complete flow
- E2E test for happy path

---

## Out of Scope

- LinkedIn profile import (API restricted, too complex)
- Multiple CV versions during onboarding
- Team/enterprise onboarding
- Email verification (using Google OAuth)
- Detailed CV editing (just preview in onboarding)
- A/B testing different flows (v1 only)

---

## Implementation Notes

**Estimated Complexity:** Medium-High

**Dependencies:**
- `pdf-parse` - PDF text extraction
- Existing `lib/cv-tailor.ts` - For tailored CV generation
- Existing `lib/pdf-generator.ts` - For PDF creation

**Files Affected:**
- [ ] `app/(onboarding)/*` - Create new route group
- [ ] `app/components/onboarding/*` - Create new components
- [ ] `app/api/onboarding/*` - Create new API routes
- [ ] `app/api/cv/parse-pdf/route.ts` - Create PDF parser
- [ ] `lib/cv-analyzer.ts` - Create CV analysis logic
- [ ] `lib/cv-enhancer.ts` - Create CV enhancement logic
- [ ] `supabase/migrations/007_onboarding.sql` - Schema changes
- [ ] `middleware.ts` - Update to redirect incomplete onboarding

**Implementation Order:**
1. Database migration
2. PDF parser API
3. CV analyzer API
4. CV enhancer API
5. Onboarding layout + progress indicator
6. Step 2: CV input page
7. Step 3: Questions page
8. Step 4: Review page
9. Step 5: Job URL page
10. Step 6: Success page
11. Middleware redirect logic
12. Mobile responsive polish

**Risks/Considerations:**
- PDF parsing quality varies by document format
- AI question relevance depends on prompt engineering
- Flow must be fast - optimize API calls
- Mobile experience critical for job seekers on-the-go

---

## Analytics Events to Track

| Event | Properties |
|-------|------------|
| `onboarding_started` | `source` (landing, direct) |
| `cv_input_method` | `method` (paste, pdf, scratch) |
| `cv_quality_detected` | `quality` (good, thin, none) |
| `question_answered` | `question_id`, `gap_type` |
| `question_skipped` | `question_id`, `gap_type` |
| `master_cv_created` | `word_count`, `sections` |
| `job_url_entered` | `domain`, `valid` |
| `tailored_cv_generated` | `time_seconds` |
| `onboarding_completed` | `total_time_seconds`, `questions_answered` |
| `onboarding_abandoned` | `last_step`, `time_spent` |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Onboarding completion rate | 75%+ |
| Time to complete | < 2 minutes avg |
| Users who download tailored CV | 90%+ |
| Day-1 retention (return to app) | 50%+ |
| Day-7 retention | 40%+ |
| Questions answered (avg) | 2.5+ of 3-4 |
