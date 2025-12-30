# Feature Specification: "To Apply" Column

**Version:** 1.0
**Author:** Product Team
**Date:** 2025-12-30
**Status:** Draft

---

## Executive Summary

Add a "To Apply" column as the first stage in the job tracking pipeline. This column captures jobs the user is interested in but has not yet applied to, transforming the tracker from a reactive application tracker into a proactive job search management tool.

**Current State:** Applied -> Interviewing -> Offer -> Closed
**New State:** To Apply -> Applied -> Interviewing -> Offer -> Closed

---

## Problem Statement

Users currently track jobs only after applying. This creates several issues:

1. **Lost Opportunities:** Interesting jobs found during browsing get lost in bookmarks or forgotten
2. **No Central Hub:** Job links scattered across browser tabs, notes apps, Slack messages
3. **No Deadline Tracking:** Users miss application deadlines for jobs they intended to apply to
4. **No Prioritization:** All "interesting" jobs treated equally with no way to rank them
5. **Incomplete Pipeline:** Cannot measure true funnel (How many jobs researched vs applied?)

---

## User Stories

### Core Stories (MVP)

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-1 | As a job seeker, I want to save jobs I find interesting so I can apply later | Can add a job to "To Apply" with company + URL. Job appears in To Apply column. |
| US-2 | As a job seeker, I want to move a saved job to "Applied" when I submit my application | Drag-and-drop from To Apply to Applied prompts for applied date. Status changes to applied. |
| US-3 | As a job seeker, I want to set priority on saved jobs so I can focus on the best opportunities | Can assign High/Medium/Low priority. Can sort by priority within column. |
| US-4 | As a job seeker, I want to track application deadlines so I do not miss opportunities | Can set optional deadline date. Visual indicator when deadline is approaching (<3 days). |
| US-5 | As a job seeker, I want to click through to the original job posting so I can apply | URL field is clickable and opens in new tab. |

### Enhanced Stories (Post-MVP)

| ID | Story | Priority |
|----|-------|----------|
| US-6 | As a job seeker, I want to save jobs directly from LinkedIn/Indeed using a browser extension | P1 |
| US-7 | As a job seeker, I want recruiter outreach emails to automatically create "To Apply" entries | P1 |
| US-8 | As a job seeker, I want to bulk import jobs from a CSV or list of URLs | P2 |
| US-9 | As a job seeker, I want to see salary ranges for saved jobs | P2 |
| US-10 | As a job seeker, I want to see how long a job has been in "To Apply" so I know if postings might be stale | P2 |

---

## Data Model Changes

### Schema Changes

```sql
-- Migration: Extend applications table for "To Apply" status

-- 1. Update status enum to include 'to_apply'
ALTER TABLE applications
  DROP CONSTRAINT applications_status_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('to_apply', 'applied', 'interviewing', 'offer', 'closed'));

-- 2. Add new columns for "To Apply" specific data
ALTER TABLE applications ADD COLUMN IF NOT EXISTS job_url VARCHAR(2048);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS priority VARCHAR(10)
  CHECK (priority IN ('high', 'medium', 'low'));
ALTER TABLE applications ADD COLUMN IF NOT EXISTS source VARCHAR(50)
  CHECK (source IN ('manual', 'linkedin', 'indeed', 'glassdoor', 'referral', 'recruiter', 'extension', 'other'));
ALTER TABLE applications ADD COLUMN IF NOT EXISTS salary_min INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS salary_max INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS salary_currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS referrer_name VARCHAR(255);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS referrer_email VARCHAR(255);

-- 3. Make applied_date nullable (not required for to_apply status)
ALTER TABLE applications ALTER COLUMN applied_date DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN applied_date DROP DEFAULT;

-- 4. Add index for deadline queries
CREATE INDEX idx_applications_deadline ON applications(user_id, deadline)
  WHERE status = 'to_apply' AND deadline IS NOT NULL;

-- 5. Add index for priority sorting
CREATE INDEX idx_applications_priority ON applications(user_id, priority)
  WHERE status = 'to_apply';
```

### TypeScript Type Changes

```typescript
// lib/types.ts

// Updated status type
export type ApplicationStatus = 'to_apply' | 'applied' | 'interviewing' | 'offer' | 'closed';

// New types
export type Priority = 'high' | 'medium' | 'low';
export type JobSource = 'manual' | 'linkedin' | 'indeed' | 'glassdoor' | 'referral' | 'recruiter' | 'extension' | 'other';

// Updated Application interface
export interface Application {
  id: string;
  company: string;
  role: string | null;
  location: string | null;
  status: ApplicationStatus;
  closeReason: CloseReason | null;
  appliedDate: string | null;  // Now nullable for to_apply
  sourceEmailId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  // New fields for "To Apply"
  jobUrl: string | null;
  deadline: string | null;
  priority: Priority | null;
  source: JobSource | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  referrerName: string | null;
  referrerEmail: string | null;
}

// Helper type for creating new "To Apply" entries
export interface ToApplyInput {
  company: string;
  role?: string;
  location?: string;
  jobUrl: string;  // Required for To Apply
  deadline?: string;
  priority?: Priority;
  source?: JobSource;
  salaryMin?: number;
  salaryMax?: number;
  notes?: string;
  referrerName?: string;
  referrerEmail?: string;
}
```

---

## UI Specifications

### Column Configuration Update

```typescript
// KanbanBoard.tsx
const COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: 'to_apply', title: 'To Apply', color: 'purple' },
  { id: 'applied', title: 'Applied', color: 'blue' },
  { id: 'interviewing', title: 'Interviewing', color: 'amber' },
  { id: 'offer', title: 'Offer', color: 'green' },
  { id: 'closed', title: 'Closed', color: 'gray' },
];
```

### Card Visual Differences

"To Apply" cards should be visually distinct:

1. **Different accent color:** Purple left border (vs blue for Applied)
2. **URL indicator:** Small link icon if jobUrl exists
3. **Priority badge:** Colored dot (red=high, yellow=medium, gray=low)
4. **Deadline warning:** Orange/red badge if deadline within 3 days or past
5. **Source icon:** Small icon showing where job was found (LinkedIn logo, etc.)

```
+----------------------------------+
| [purple border]                  |
| Stripe                     [*]   |  <- Priority star
| Senior Software Engineer         |
| San Francisco, CA                |
|                                  |
| [linkedin icon] [link icon]      |  <- Source + URL indicators
| Due: Dec 31 [!]                  |  <- Deadline with warning
+----------------------------------+
```

### Add Modal for "To Apply"

Create a variant of AddApplicationModal for "To Apply" entries:

**Required fields:**
- Company name
- Job URL (required for To Apply, validates URL format)

**Optional fields:**
- Role/Position
- Location
- Deadline
- Priority (default: Medium)
- Source (default: Manual)
- Salary Range (min/max)
- Notes
- Referrer info (if source = referral)

**Differences from regular Add modal:**
- No "Applied Date" field (will be set when moved to Applied)
- No "Status" dropdown (always To Apply)
- Job URL is prominent and required
- Priority selector is visible
- Deadline picker is visible

### Move to Applied Flow

When user drags card from "To Apply" to "Applied":

1. **Intercept the drop** - Show confirmation modal
2. **Modal content:**
   ```
   +----------------------------------+
   | Moving to Applied                |
   |                                  |
   | Stripe - Senior Software Eng.   |
   |                                  |
   | When did you apply?              |
   | [Today] [Yesterday] [Pick date]  |
   |                                  |
   | [ ] Open job posting to apply    |
   |     (will open in new tab)       |
   |                                  |
   | [Cancel]              [Confirm]  |
   +----------------------------------+
   ```
3. **On confirm:**
   - Set `status = 'applied'`
   - Set `appliedDate` to selected date
   - Clear deadline (no longer relevant)
   - Optionally open job URL if checkbox selected

### Sorting Within "To Apply" Column

Default sort order:
1. Priority (High -> Medium -> Low)
2. Deadline (soonest first, null at end)
3. Date added (newest first)

Add sort dropdown to column header:
- Priority (default)
- Deadline
- Recently Added
- Company Name (A-Z)

### Filtering Options

Add filter options for "To Apply" column:
- Priority: High / Medium / Low / All
- Deadline: Upcoming (< 7 days) / Overdue / No Deadline / All
- Source: LinkedIn / Indeed / Referral / All

---

## API Changes

### Endpoints

**POST /api/applications** (existing, extended)
```typescript
// Request body now accepts to_apply status and new fields
interface CreateApplicationRequest {
  company: string;
  role?: string;
  location?: string;
  status: ApplicationStatus;  // Can be 'to_apply'
  appliedDate?: string;       // Required only if status != 'to_apply'
  jobUrl?: string;            // Required only if status == 'to_apply'
  deadline?: string;
  priority?: Priority;
  source?: JobSource;
  salaryMin?: number;
  salaryMax?: number;
  notes?: string;
  referrerName?: string;
  referrerEmail?: string;
}
```

**PATCH /api/applications/[id]** (existing, extended)
```typescript
// Can now transition from to_apply to applied
interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  appliedDate?: string;  // Required when transitioning to_apply -> applied
  // ... existing fields
  // ... new fields (jobUrl, deadline, priority, etc.)
}
```

**GET /api/applications** (existing, no changes needed)
- Already returns all applications
- Frontend filters by status

### Validation Rules

1. When `status = 'to_apply'`:
   - `jobUrl` is required
   - `appliedDate` must be null

2. When transitioning `to_apply -> applied`:
   - `appliedDate` becomes required
   - Request must include appliedDate

3. URL validation:
   - Must be valid URL format
   - Must start with http:// or https://

---

## Email Parsing Integration

### Recruiter Outreach Detection

When parsing emails, detect recruiter outreach patterns:

**Triggers:**
- Subject contains: "opportunity", "position", "role at", "interested in"
- From domain is recruiting/staffing company
- Body contains: "reach out", "great fit", "considering candidates"

**Behavior:**
- Create application with `status = 'to_apply'`
- Set `source = 'recruiter'`
- Extract company name from email
- Set `jobUrl` to any job link found in email
- Set `notes` with recruiter contact info

**User control:**
- Setting to enable/disable auto-creation from recruiter emails
- Option to require manual approval before creating

---

## Edge Cases

### Edge Case 1: URL Already Exists
**Scenario:** User tries to add a job with URL that already exists in their tracker.
**Handling:**
- Show warning: "You already saved this job on [date]"
- Option to view existing entry or add anyway (different role at same company)

### Edge Case 2: Job Posting Expired
**Scenario:** User clicks job URL but posting no longer exists.
**Handling:**
- Add "Mark as Expired" action
- Moves to Closed with `close_reason = 'expired'` (new reason)
- Alternative: Keep in To Apply but add visual "Link may be broken" indicator

### Edge Case 3: Deadline Passed
**Scenario:** Job has deadline in the past but user has not acted.
**Handling:**
- Show "Deadline passed" badge in red
- Suggest moving to Closed or clearing deadline
- Include in filter: "Overdue"

### Edge Case 4: Drag to Wrong Column
**Scenario:** User accidentally drags To Apply directly to Interviewing/Offer.
**Handling:**
- Block direct transitions from to_apply to interviewing/offer
- Show toast: "Jobs must be Applied before moving to Interviewing"
- Only allow: to_apply -> applied, to_apply -> closed

### Edge Case 5: Bulk Import Duplicates
**Scenario:** User imports CSV with some duplicates of existing entries.
**Handling:**
- Show preview with duplicate detection
- Allow user to select which to import
- "Skip duplicates" checkbox option

---

## MVP vs Future Scope

### MVP (Week 1-2)

| Feature | Effort | Priority |
|---------|--------|----------|
| Database schema migration | 2h | P0 |
| Update TypeScript types | 1h | P0 |
| Add "To Apply" column to UI | 2h | P0 |
| Create "Add to To Apply" modal | 4h | P0 |
| Move-to-Applied confirmation flow | 3h | P0 |
| Priority field + sorting | 3h | P0 |
| Deadline field + visual warnings | 2h | P0 |
| URL field + clickable link | 1h | P0 |
| Update stats to include To Apply | 1h | P1 |

**MVP Total:** ~19 hours

### Phase 2 (Week 3-4)

| Feature | Effort | Priority |
|---------|--------|----------|
| Chrome extension for quick-save | 16h | P1 |
| Recruiter email auto-detection | 8h | P1 |
| Source field + icons | 2h | P2 |
| Salary range fields | 2h | P2 |
| Column sorting options | 3h | P2 |
| Column filtering options | 4h | P2 |
| Referrer tracking fields | 2h | P2 |

### Phase 3 (Future)

| Feature | Effort | Priority |
|---------|--------|----------|
| Bulk import (CSV/paste URLs) | 8h | P2 |
| Link health checking | 4h | P3 |
| Job board API integrations | 20h+ | P3 |
| Match score calculation | 12h | P3 |
| Reminders/notifications for deadlines | 6h | P2 |

---

## Success Metrics

### Primary Metrics

1. **Adoption Rate:** % of users who add at least one "To Apply" job
   - Target: 40% of active users within 30 days

2. **Conversion Rate:** % of "To Apply" jobs that convert to "Applied"
   - Target: 30% within 14 days of adding

3. **Time to Apply:** Average days between adding to "To Apply" and applying
   - Target: < 7 days

### Secondary Metrics

4. **To Apply volume:** Average number of jobs in "To Apply" per user
5. **Deadline usage:** % of To Apply entries with deadline set
6. **Priority distribution:** High/Medium/Low breakdown
7. **Source distribution:** Where are users finding jobs?

---

## Technical Implementation Notes

### Migration Strategy

1. **Non-breaking:** All new fields are nullable
2. **Backwards compatible:** Existing data unchanged
3. **No downtime:** Can deploy incrementally

### Performance Considerations

1. **Index on deadline:** For upcoming deadline queries
2. **Index on priority:** For sorting
3. **Lazy load URLs:** Do not pre-fetch to check link health in MVP

### Security Considerations

1. **URL sanitization:** Prevent XSS in stored URLs
2. **URL validation:** Reject non-http(s) URLs
3. **RLS unchanged:** User can only see own data

---

## Open Questions

1. **Should "To Apply" count toward total applications in stats?**
   - Recommendation: Show separately (e.g., "12 applied + 5 saved")

2. **Should we support multiple URLs per job?** (e.g., LinkedIn + company site)
   - Recommendation: Single URL for MVP, consider multi later

3. **Should deadline create calendar events?**
   - Recommendation: Future feature, not MVP

4. **How long before prompting user about stale "To Apply" entries?**
   - Recommendation: 30 days, gentle nudge to apply or archive

---

## Appendix: Mock Data

```typescript
export const MOCK_TO_APPLY: Application[] = [
  {
    id: 'ta-1',
    company: 'OpenAI',
    role: 'Research Engineer',
    location: 'San Francisco, CA',
    status: 'to_apply',
    closeReason: null,
    appliedDate: null,
    sourceEmailId: null,
    notes: 'Found via Twitter, looks amazing',
    createdAt: '2025-12-28T10:00:00Z',
    updatedAt: '2025-12-28T10:00:00Z',
    jobUrl: 'https://openai.com/careers/research-engineer',
    deadline: '2025-01-15',
    priority: 'high',
    source: 'manual',
    salaryMin: 200000,
    salaryMax: 350000,
    salaryCurrency: 'USD',
    referrerName: null,
    referrerEmail: null,
  },
  {
    id: 'ta-2',
    company: 'Figma',
    role: 'Product Designer',
    location: 'Remote',
    status: 'to_apply',
    closeReason: null,
    appliedDate: null,
    sourceEmailId: null,
    notes: 'Sarah referred me, need to mention her name',
    createdAt: '2025-12-27T10:00:00Z',
    updatedAt: '2025-12-27T10:00:00Z',
    jobUrl: 'https://figma.com/careers/product-designer',
    deadline: null,
    priority: 'medium',
    source: 'referral',
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: 'USD',
    referrerName: 'Sarah Chen',
    referrerEmail: 'sarah@example.com',
  },
];
```

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-30 | Product | Initial specification |
