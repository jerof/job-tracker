# PRD-003: Skills Matcher

**Status: Shipped** ✓

## Overview

AI-powered feature that analyzes a job description against the user's CV to identify relevant skills, experiences, and talking points for interview preparation. Helps users quickly understand which parts of their background to emphasize for each specific opportunity.

## User Stories

- As a job seeker, I want to see which of my skills match a job description so I can tailor my interview responses
- As a job seeker, I want AI-generated talking points that connect my experience to job requirements so I prepare faster
- As a job seeker, I want to identify skill gaps so I can address them proactively in interviews

## UI Spec

**Location:** Job detail page, new "Interview Prep" tab alongside existing job info

**Layout:**
- Header with job title and company name
- "Analyze Match" button (disabled if no CV uploaded)
- Results panel (appears after analysis):
  - **Matched Skills** - Green tags showing skills from CV that appear in JD
  - **Skill Gaps** - Orange tags showing JD requirements not in CV
  - **Talking Points** - 3-5 bullet points connecting user experience to job needs
  - **Match Score** - Percentage indicator (optional, simple 0-100)

**States:**
- Empty: "Upload your CV to enable skills matching"
- Loading: Spinner with "Analyzing match..."
- Results: Structured output as described above
- Error: "Analysis failed. Try again."

## AI Prompt Structure

**Inputs:**
```
- job_description: string (full JD text, max 4000 chars)
- cv_text: string (parsed CV content, max 4000 chars)
```

**System Prompt:**
```
You are a career coach helping a candidate prepare for an interview.
Analyze the job description and CV to identify:
1. Skills/experiences from the CV that match JD requirements
2. JD requirements not covered by the CV
3. Specific talking points connecting candidate experience to job needs

Be concise. Focus on actionable insights.
```

**Output Schema:**
```json
{
  "matched_skills": ["skill1", "skill2"],
  "skill_gaps": ["gap1", "gap2"],
  "talking_points": [
    "Your experience with X directly applies to their need for Y",
    "Highlight your Z project when discussing..."
  ],
  "match_score": 75
}
```

## Technical Approach

**API Route:** `POST /api/jobs/[id]/analyze-match`

**Flow:**
1. Fetch job description from database (by job ID)
2. Fetch user's CV text from CV module
3. Call Claude Haiku with structured prompt
4. Parse JSON response, validate schema
5. Return results to frontend

**Claude Integration:**
- Model: claude-3-haiku (fast, cheap)
- Max tokens: 1000 (sufficient for structured output)
- Temperature: 0.3 (more deterministic)
- Use JSON mode for reliable parsing

**Caching:**
- Cache results per job_id + cv_hash combination
- Invalidate when CV is updated
- TTL: 7 days (JDs rarely change)

## Acceptance Criteria

- [ ] User can trigger skills analysis from job detail page
- [ ] Analysis completes in under 5 seconds
- [ ] Results display matched skills, gaps, and 3-5 talking points
- [ ] Analysis is blocked if user has no CV uploaded
- [ ] Results are cached to avoid redundant API calls

## Dependencies

- **CV Module (PRD-002):** Requires CV upload and text extraction to be implemented first
- **Job Detail Page:** Must have job description stored in database
- **Anthropic API Key:** Claude Haiku access configured

## Out of Scope (v1)

- Comparing multiple CVs
- Suggesting CV edits
- Interview question generation
- Saving/exporting prep notes
