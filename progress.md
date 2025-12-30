# Job Tracker - Progress Log

## Session 1 - 2025-12-28

### Completed
- Created detailed feature specification (FEATURE_JOB_TRACKER.md)
- Defined tech stack: Next.js + Supabase + Claude Haiku
- Set up project folder structure
- Initialized Next.js project with TypeScript + Tailwind
- Built Kanban board UI with drag-and-drop
- Created Supabase schema and client
- Built API routes (GET, POST, PATCH, DELETE)
- Connected UI to API with mock data fallback

### Current State
- App running at localhost:3002
- Kanban board fully functional with mock data
- API routes ready, waiting for Supabase credentials
- "Demo Mode" indicator shows when database not configured

### Files Created
- `app/components/KanbanBoard.tsx` - Main board with drag-drop
- `app/components/KanbanColumn.tsx` - Column component
- `app/components/ApplicationCard.tsx` - Draggable card
- `app/components/CardDetailModal.tsx` - Edit modal
- `app/api/applications/route.ts` - List/create API
- `app/api/applications/[id]/route.ts` - Get/update/delete API
- `lib/types.ts` - TypeScript types + mock data
- `lib/supabase.ts` - Supabase client
- `lib/database.types.ts` - DB type conversions
- `supabase/schema.sql` - Database schema
- `.env.local.example` - Environment template

### Next Steps
1. Create Supabase project at supabase.com
2. Run schema.sql in Supabase SQL Editor
3. Add credentials to .env.local
4. Set up Google OAuth for Gmail access
5. Implement Gmail API integration
6. Add Claude email parsing

### Decisions Made
- Graceful fallback to mock data when Supabase not configured
- Optimistic updates with rollback on error
- Server-side client uses service role key (bypasses RLS for now)

---

## Session 2 - 2025-12-30

### Completed
- Fixed Gmail sync date filter bug (was using Unix timestamp, now uses YYYY/MM/DD format)
- Redesigned notifications UI to match design system:
  - Floating toast with glassmorphism effect, auto-dismiss, progress bar
  - Enhanced notification bell with gradient, status indicator dot, ring effect
  - Smooth enter/exit animations
  - Proper dark mode support

### Bug Fixed
- `lib/gmail.ts:69-79` - Gmail `after:` operator now uses correct date format

### Files Modified
- `lib/gmail.ts` - Fixed date filter format
- `app/components/KanbanBoard.tsx` - Redesigned notifications UI

---

## Session 3 - 2025-12-30 (Email Viewer Feature)

### Completed
- Implemented Email Viewer feature (full sprint delivery)
- Database: Created `application_emails` table for email metadata
- Backend: Two new API endpoints for email list and full content
- Frontend: EmailIcon, EmailSidePanel components
- Integration: Email counts on cards, side panel from Kanban board
- Testing: Playwright setup with comprehensive e2e tests

### Files Created
- `supabase/migrations/001_add_application_emails.sql` - New table
- `app/api/applications/[id]/emails/route.ts` - Email list endpoint
- `app/api/emails/[messageId]/route.ts` - Full email content endpoint
- `app/components/EmailIcon.tsx` - Badge component
- `app/components/EmailSidePanel.tsx` - Slide-out panel
- `playwright.config.ts` - Test configuration
- `tests/email-viewer.spec.ts` - E2E tests

### Files Modified
- `app/api/sync/route.ts` - Store email metadata during sync
- `app/components/ApplicationCard.tsx` - Added email icon
- `app/components/KanbanColumn.tsx` - Pass email props
- `app/components/KanbanBoard.tsx` - Email panel state management
- `package.json` - Added test scripts

### Migration Required
Run in Supabase SQL Editor:
```sql
-- From supabase/migrations/001_add_application_emails.sql
```

---

## Session 4 - 2025-12-30 (Email Timeline Integration)

### Completed
- Moved emails from separate side panel to Timeline section in CardDetailModal
- Emails now display chronologically within the application timeline
- Click to expand email and view full body content
- Different icons/colors for email types (confirmation, interview, rejection, offer)
- Loading states and smooth animations
- Fixed HTML entity decoding (&#39; → ')
- Added "Open in Gmail" link with proper account targeting

### Bug Fixes
- Email body was showing snippet instead of full content (API response parsing)
- HTML entities not decoded in email body
- Gmail link opening wrong account (now uses `?authuser=email` + RFC822 Message-ID search)

### UX Improvement
User requested emails be shown inline with the Timeline ("Application submitted", etc.) rather than in a separate side panel. Now when viewing an application detail:
1. Timeline shows "Application submitted" first
2. All synced emails appear in chronological order
3. Click any email to expand and see full body
4. "Open in Gmail" link opens correct account
5. "Last updated" appears at the end

### Files Modified
- `app/components/CardDetailModal.tsx` - Email fetching, timeline integration, HTML decoding
- `app/api/emails/[messageId]/route.ts` - RFC822 Message-ID extraction, user email for authuser param

---
