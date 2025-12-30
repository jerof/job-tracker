# Job Tracker - Bug Tracking

## Open Bugs

_No bugs yet_

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
