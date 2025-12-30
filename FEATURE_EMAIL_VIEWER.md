# Feature Specification: Email Viewer

**Created:** 2025-12-30
**Status:** Ready for Implementation

---

## Overview

### Problem Statement
Users have to switch between the Job Tracker app and Gmail to read the actual email content (interview invites, rejection notices, etc.). This context-switching is tedious, especially when reviewing multiple applications.

### Solution
Show related emails directly in the app via a side panel. Each application card displays an email icon with a count badge. Clicking it opens a slide-out panel showing all emails related to that company, sorted newest first. Users can expand emails to read full content and jump to Gmail if needed.

---

## User Stories

**Primary:**
As a job seeker,
I want to see the emails related to each application,
So that I can review recruiter messages without leaving the app.

**Secondary:**
As a job seeker,
I want to quickly see how many emails I've received from each company,
So that I know which applications have activity.

---

## User Experience

### User Flow
1. User sees application cards on Kanban board
2. Cards with emails show an email icon with count badge (e.g., "3")
3. User clicks the email icon on a card
4. Side panel slides in from the right showing email list
5. Emails display: sender, subject, date, and snippet
6. User clicks an email to expand and read full content
7. User can click "Open in Gmail" to view in Gmail
8. User clicks outside or X to close panel

### UI/UX Details

**Components needed:**
- `EmailIcon` - Badge on ApplicationCard showing email count
- `EmailSidePanel` - Slide-out panel containing email list
- `EmailListItem` - Individual email preview (collapsed)
- `EmailContent` - Expanded email view with full body

**Interactions:**
- Click email icon → Open side panel
- Click email list item → Expand/collapse email content
- Click "Open in Gmail" → New tab with Gmail message
- Click outside panel / X button → Close panel
- ESC key → Close panel

**States:**
- **Loading:** Skeleton cards while fetching email list
- **Empty:** "No emails found for this application" with suggestion to sync
- **Error:** "Couldn't load emails. Check Gmail connection." with retry button
- **Success:** Email list with expand/collapse functionality

### Visual Design
```
┌─────────────────────────────────────────────────────────────────┐
│ Kanban Board                                          │ Email Panel │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │ ───────────│
│ │ Stripe  │ │ Voize   │ │ PostHog │                  │ Voize      │
│ │ SWE     │ │ PM      │ │ Engineer│                  │ 3 emails   │
│ │         │ │         │ │         │                  │            │
│ │    📧 2 │ │    📧 3 │ │    📧 1 │  ←── clicked     │ ┌────────┐ │
│ └─────────┘ └─────────┘ └─────────┘                  │ │ From:  │ │
│                                                       │ │ recruiter│
│                                                       │ │ Subject│ │
│                                                       │ │ Dec 30 │ │
│                                                       │ └────────┘ │
│                                                       │ ┌────────┐ │
│                                                       │ │ Email 2│ │
│                                                       │ └────────┘ │
│                                                       │ [Open Gmail]│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Frontend

**Components to create:**
- `app/components/EmailIcon.tsx` - Badge component for cards
- `app/components/EmailSidePanel.tsx` - Slide-out panel container
- `app/components/EmailListItem.tsx` - Collapsible email preview
- `app/components/EmailContent.tsx` - Full email body display

**State management:**
- `selectedApplicationForEmails: string | null` - Which app's emails to show
- `emails: Email[]` - Fetched emails for selected application
- `expandedEmailId: string | null` - Which email is expanded
- `isLoadingEmails: boolean` - Loading state

**API calls:**
```typescript
// Fetch email list for an application
GET /api/applications/:id/emails
Response: { emails: EmailPreview[] }

// Fetch full email content
GET /api/emails/:gmailMessageId
Response: { email: EmailFull }
```

### Backend

**Endpoints:**

1. `GET /api/applications/:id/emails`
   - Purpose: Get all emails linked to an application
   - Response: `{ emails: [{ id, gmailMessageId, from, subject, date, snippet }] }`

2. `GET /api/emails/:gmailMessageId`
   - Purpose: Fetch full email body from Gmail
   - Auth: Requires valid Gmail tokens
   - Response: `{ email: { ...metadata, body: string, htmlBody?: string } }`

**Business logic:**
- When syncing emails, store metadata in `application_emails` table
- Match emails to applications by company name in subject/content
- On full body fetch, call Gmail API with stored message ID
- Generate Gmail URL: `https://mail.google.com/mail/u/0/#inbox/{messageId}`

### Database

**New table:**
```sql
CREATE TABLE application_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  gmail_message_id VARCHAR(255) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  subject VARCHAR(500),
  snippet TEXT,
  email_date TIMESTAMP WITH TIME ZONE,
  email_type VARCHAR(50), -- 'application', 'interview', 'rejection', 'offer', 'other'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(application_id, gmail_message_id)
);

CREATE INDEX idx_app_emails_app_id ON application_emails(application_id);
CREATE INDEX idx_app_emails_date ON application_emails(email_date DESC);
```

**Migration for existing data:**
- Update sync process to populate `application_emails` table
- Re-sync to backfill email metadata for existing applications

---

## Acceptance Criteria

### Must Have
- [ ] Email icon with count badge visible on cards with linked emails
- [ ] Clicking icon opens side panel with email list
- [ ] Emails sorted by date (newest first)
- [ ] Click email to expand and see full content
- [ ] "Open in Gmail" button works (opens correct email in new tab)
- [ ] Panel closes on X click, outside click, or ESC key
- [ ] Loading state while fetching emails
- [ ] Empty state when no emails found
- [ ] Works on mobile (full-screen panel on small screens)

### Edge Cases Handled
- [ ] Application with 0 emails - no icon shown (or greyed out)
- [ ] Gmail token expired - show "Reconnect Gmail" prompt
- [ ] Email deleted from Gmail - show "Email no longer available"
- [ ] Very long email bodies - scrollable with max-height
- [ ] HTML emails - render safely or show plain text fallback

---

## Test Scenarios

### Manual Testing
1. **Scenario:** View emails for application
   - Given: Application with 3 synced emails
   - When: Click email icon on card
   - Then: Side panel opens showing 3 emails, newest first

2. **Scenario:** Expand email content
   - Given: Email panel open with collapsed emails
   - When: Click an email list item
   - Then: Email expands showing full body content

3. **Scenario:** Open in Gmail
   - Given: Expanded email in panel
   - When: Click "Open in Gmail" button
   - Then: New tab opens with correct Gmail message

4. **Scenario:** No emails
   - Given: Application with no linked emails
   - When: View card
   - Then: No email icon shown (or show "0" badge)

---

## Out of Scope
- Replying to emails from within the app
- Composing new emails
- Deleting/archiving emails
- Real-time email notifications (push)
- Attachment viewing/downloading
- Email search within the panel

---

## Implementation Notes

**Estimated complexity:** Medium

**Dependencies:**
- Gmail OAuth already working
- Application sync already storing `source_email_id`

**Files to create:**
- [ ] `app/components/EmailIcon.tsx`
- [ ] `app/components/EmailSidePanel.tsx`
- [ ] `app/components/EmailListItem.tsx`
- [ ] `app/components/EmailContent.tsx`
- [ ] `app/api/applications/[id]/emails/route.ts`
- [ ] `app/api/emails/[messageId]/route.ts`

**Files to modify:**
- [ ] `app/components/ApplicationCard.tsx` - Add EmailIcon
- [ ] `app/components/KanbanBoard.tsx` - Add panel state management
- [ ] `app/api/sync/route.ts` - Store email metadata during sync
- [ ] `supabase/schema.sql` - Add application_emails table

**Risks/Considerations:**
- Gmail API rate limits when fetching multiple full emails
- Email body can be large - consider lazy loading
- HTML email rendering security (XSS prevention)

---

## Questions/Decisions Log

| Question | Decision |
|----------|----------|
| Match emails by thread or company? | By company name (ATS emails come from different domains) |
| Store full body or fetch on demand? | Hybrid: store metadata, fetch body on demand |
| Where to show emails? | Side panel (not modal) |
| Sort order? | Newest first |
| Card indicator? | Email icon with count badge |
