# Job Tracker - Bug Tracking

## Open Bugs

### [BUG-006] Drag and drop cards not working
- **Status:** Open
- **Severity:** High
- **Found:** 2025-12-31

**Description:**
When dragging a card to move it between columns, the card disappears and cannot be dropped. User is unable to change application status via drag and drop.

**Steps to Reproduce:**
1. View the Kanban board with applications
2. Click and hold on a card to drag it
3. Card disappears when dragging starts
4. Cannot drop the card in another column

**Attempted Fixes:**
- Added portal-based rendering to escape overflow containers - did not resolve
- Adjusted overflow CSS on board container - did not resolve

**Notes:**
- Uses `@hello-pangea/dnd` library (fork of react-beautiful-dnd)
- May be related to overflow:auto on parent containers clipping the dragged element
- Portal approach was implemented but still not working

---

## Bug Template

### [BUG-XXX] Title
- **Status:** Open / In Progress / Fixed
- **Severity:** Critical / High / Medium / Low
- **Found:** Date
- **Fixed:** Date (if applicable)

**Description:**
What's happening vs what should happen.

**Steps to Reproduce:**
1. Step one
2. Step two

**Root Cause:** (once investigated)

**Fix:** (once resolved)

---

## Fixed Bugs

### [BUG-007] Gmail sync not updating "Saved" jobs to "Applied" status
- **Status:** Fixed
- **Severity:** High
- **Found:** 2026-01-02
- **Fixed:** 2026-01-02

**Description:**
Application confirmation emails were not updating jobs from "Saved" status to "Applied" status. Example: User saved "Cleo - Lead Product Manager" job, then received a confirmation email from "Cleo AI", but the job remained in "Saved" status.

**Root Cause:**
Two issues:
1. **Company name matching was too strict**: The sync logic used exact `.ilike()` matching. When saved job had company "Cleo" but email came from "Cleo AI", no match was found.
2. **Status order didn't include 'saved'**: The `statusOrder` array was `['applied', 'interviewing', 'offer', 'closed']` and didn't include 'saved'. While the math coincidentally worked (saved = -1, applied = 0, so 0 > -1 = true), the intent was unclear.

**Fix:**
1. Added fuzzy company name matching with `normalizeCompanyName()` and `companiesMatch()` functions:
   - Removes common suffixes (Inc, LLC, AI, IO, etc.)
   - Normalizes to lowercase alphanumeric only
   - Matches if one normalized name contains the other ("cleo" matches "cleoai")
2. Added 'saved' to the beginning of `statusOrder` array: `['saved', 'applied', 'interviewing', 'offer', 'closed']`
3. Added `applied_date` update when transitioning from 'saved' to 'applied'
4. Added better logging for debugging matching issues

**File Changed:** `app/api/sync/route.ts`

---

### [BUG-001] Gmail sync not finding today's emails
- **Status:** Fixed
- **Severity:** High
- **Found:** 2025-12-30
- **Fixed:** 2025-12-30

**Description:**
Gmail sync showing "Found 0 new, updated 0" for emails sent today.

**Root Cause:**
Gmail's `after:` search operator expects `YYYY/MM/DD` format but code was passing Unix timestamps.

**Fix:**
Updated `lib/gmail.ts` to format dates correctly using `formatGmailDate()` helper.

---

### [BUG-002] Synced applications not appearing in list
- **Status:** Fixed
- **Severity:** Critical
- **Found:** 2025-12-30
- **Fixed:** 2025-12-30

**Description:**
Sync reports "X new" applications but they don't appear in the Kanban board.

**Root Cause:**
1. `location` column missing from database schema - insert was failing silently
2. No error handling on database insert

**Fix:**
1. Added `location VARCHAR(255)` column to schema
2. Added error handling to sync route insert
3. User must run migration: `ALTER TABLE applications ADD COLUMN IF NOT EXISTS location VARCHAR(255);`

---

### [BUG-003] Email body showing truncated/snippet instead of full content
- **Status:** Fixed
- **Severity:** Medium
- **Found:** 2025-12-30
- **Fixed:** 2025-12-30

**Description:**
When expanding an email in the timeline, only a short snippet was shown instead of the full email body.

**Root Cause:**
API response parsing error - reading `data.body` instead of `data.email.body`.

**Fix:**
Updated `CardDetailModal.tsx` to correctly parse API response structure.

---

### [BUG-004] HTML entities not decoded in email content
- **Status:** Fixed
- **Severity:** Low
- **Found:** 2025-12-30
- **Fixed:** 2025-12-30

**Description:**
Email body showing `&#39;` instead of apostrophes and other HTML entities.

**Root Cause:**
Email content contains HTML entities that weren't being decoded.

**Fix:**
Added `decodeHtmlEntities()` helper using textarea trick to decode entities.

---

### [BUG-005] "Open in Gmail" link opens wrong account
- **Status:** Fixed
- **Severity:** Medium
- **Found:** 2025-12-30
- **Fixed:** 2025-12-30

**Description:**
Clicking "Open in Gmail" would open the first signed-in Gmail account instead of the account that received the email.

**Root Cause:**
Gmail URL was using `/u/0/` which defaults to first account, and internal message IDs don't work reliably in URLs.

**Fix:**
1. Extract RFC822 Message-ID header from email
2. Fetch user's email address via Gmail API `users.getProfile`
3. Build URL with `?authuser=email@gmail.com` and `#search/rfc822msgid:...`
