# Feature Specification: CV Library

**Created:** 2026-01-02
**Status:** Ready for Implementation

---

## Overview

### Problem Statement
Users currently have no way to view, manage, or organize their CVs. The master CV is stored as plain text, and tailored CVs are only accessible through individual application cards. Users need a centralized library to see all their CVs, download them, and manage the master CV.

### Solution
A card-based CV library on the `/cv` page showing all CVs (master and tailored) with filtering, preview/download capabilities, and master CV management.

---

## User Stories

**Primary:**
As a job seeker
I want to see all my CVs in one place
So that I can easily find, download, and manage them

**Secondary:**
- As a user, I want to filter CVs by type so I can quickly find what I need
- As a user, I want to see which application each tailored CV is linked to
- As a user, I want to delete old CVs I no longer need

---

## User Experience

### User Flow
1. User navigates to `/cv` page
2. User sees grid of CV cards (master CV first if exists, then tailored CVs sorted by date)
3. User can filter: All / Master / Tailored
4. User clicks a card → Modal opens with PDF preview
5. From modal: Download PDF or close
6. User can delete tailored CVs via delete icon on card (with confirmation)
7. Master CV section shows current text-based CV with edit capability

### UI/UX Details

**Page Layout:**
```
┌─────────────────────────────────────────────────────┐
│  CVs                                    [Add CV]    │
├─────────────────────────────────────────────────────┤
│  [All] [Master] [Tailored]              Sort: Date ▼│
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ MASTER  │  │ Tailored│  │ Tailored│             │
│  │         │  │         │  │         │             │
│  │ Current │  │ Google  │  │ Stripe  │             │
│  │ CV      │  │ PM Role │  │ Engineer│             │
│  │         │  │         │  │         │             │
│  │ Updated │  │ Jan 1   │  │ Dec 28  │             │
│  │ Dec 15  │  │    [x]  │  │    [x]  │             │
│  └─────────┘  └─────────┘  └─────────┘             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Card Design (Tailored CV):**
```
┌───────────────────────────┐
│  PDF                  [x] │  ← Delete icon (hover)
│                           │
│  CV_Google_1704067200.pdf │  ← Filename
│  ─────────────────────    │
│  🏢 Google                │  ← Company
│  💼 Product Manager       │  ← Role
│                           │
│  Generated Jan 1, 2026    │  ← Date
└───────────────────────────┘
```

**Card Design (Master CV):**
```
┌───────────────────────────┐
│  ⭐ MASTER               │  ← Badge, no delete
│                           │
│  Master CV                │
│  ─────────────────────    │
│  Your base CV for         │
│  tailoring                │
│                           │
│  Last updated Dec 15      │
│  [Edit]                   │  ← Opens text editor
└───────────────────────────┘
```

**States:**
- **Loading:** Skeleton cards with shimmer animation
- **Empty (no CVs):** "No CVs yet. Add your master CV to get started." with [Add CV] button
- **Empty (filtered):** "No tailored CVs yet. Generate one from an application."
- **Error:** Toast notification with retry option

**Preview Modal:**
```
┌─────────────────────────────────────────┐
│  CV_Google_1704067200.pdf          [X]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      PDF Preview (iframe)       │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Download PDF]                         │
└─────────────────────────────────────────┘
```

---

## Technical Specification

### Frontend

**Components to create:**
- `app/cv/page.tsx` - Main CV library page (replace current)
- `app/components/CVCard.tsx` - Individual CV card component
- `app/components/CVGrid.tsx` - Grid container with filtering
- `app/components/CVPreviewModal.tsx` - PDF preview modal
- `app/components/MasterCVCard.tsx` - Special card for master CV

**State management:**
- `filter`: 'all' | 'master' | 'tailored'
- `cvs`: Array of CV objects from API
- `isLoading`: boolean
- `previewCV`: CV object or null (for modal)

**API calls:**
- `GET /api/cvs` - Fetch all CVs (master + tailored)
- `DELETE /api/cvs/[id]` - Delete a tailored CV

### Backend

**Endpoints:**

`GET /api/cvs`
- Returns: `{ cvs: CV[] }`
- CV shape:
  ```typescript
  interface CV {
    id: string;
    type: 'master' | 'tailored';
    filename: string;
    url: string | null; // null for master (text-based)
    company?: string; // only for tailored
    role?: string; // only for tailored
    applicationId?: string; // only for tailored
    createdAt: string;
    updatedAt: string;
  }
  ```

`DELETE /api/cvs/[id]`
- Deletes tailored CV from storage and database
- Cannot delete master CV via this endpoint
- Returns: `{ success: true }`

**Business logic:**
- Master CV comes from existing `cvs` table (text-based)
- Tailored CVs come from `applications` table (those with `tailored_cv_url`)
- Combine both into unified response

### Database

**No schema changes needed.** Leveraging existing tables:
- `cvs` table - Master CV (text-based)
- `applications` table - Tailored CVs via `tailored_cv_url`, `tailored_cv_filename`, `tailored_cv_generated_at`

When deleting a tailored CV:
1. Delete PDF from Supabase storage
2. Set `tailored_cv_url`, `tailored_cv_filename`, `tailored_cv_generated_at` to NULL on application

---

## Acceptance Criteria

### Must Have
- [ ] Grid of CV cards on `/cv` page
- [ ] Master CV card with edit functionality (existing)
- [ ] Tailored CV cards show company, role, date
- [ ] Click card opens preview modal with PDF
- [ ] Download button in preview modal
- [ ] Delete tailored CV with confirmation dialog
- [ ] Filter tabs: All / Master / Tailored
- [ ] Empty state when no CVs
- [ ] Loading skeleton while fetching

### Edge Cases Handled
- [ ] No master CV exists - Show "Add your CV" prompt
- [ ] No tailored CVs - Show appropriate empty state based on filter
- [ ] PDF URL expired/invalid - Show error state in preview
- [ ] Delete fails - Show error toast, don't remove card

---

## Test Scenarios

### Manual Testing
1. **Scenario:** View CV library with master and tailored CVs
   - Expected: Master CV card shows first, tailored CVs sorted by date (newest first)

2. **Scenario:** Filter to only tailored CVs
   - Expected: Master CV hidden, only tailored CVs shown

3. **Scenario:** Click tailored CV card
   - Expected: Modal opens with PDF preview, Download button visible

4. **Scenario:** Delete tailored CV
   - Expected: Confirmation dialog, then card removed from grid

5. **Scenario:** No CVs exist
   - Expected: Empty state with "Add your master CV" prompt

---

## Out of Scope
- CV version history
- Promoting tailored CV to master
- Bulk delete
- Search within CVs
- CV thumbnails (using PDF badge instead)
- Drag and drop reordering

---

## Implementation Notes

**Estimated complexity:** Medium

**Dependencies:**
- Existing master CV functionality in `cvs` table
- Existing tailored CV functionality in `applications` table
- Supabase storage bucket `tailored-cvs`

**Files affected:**
- [ ] `app/cv/page.tsx` - Replace with new library page
- [ ] `app/components/CVCard.tsx` - Create new
- [ ] `app/components/CVGrid.tsx` - Create new
- [ ] `app/components/CVPreviewModal.tsx` - Create new
- [ ] `app/components/MasterCVCard.tsx` - Create new
- [ ] `app/api/cvs/route.ts` - Create new (GET all CVs)
- [ ] `app/api/cvs/[id]/route.ts` - Create new (DELETE)
- [ ] `lib/types.ts` - Add CV type

**Design patterns:**
- Use same card styling as KanbanBoard cards
- Modal styling matches CardDetailModal
- Filter tabs similar to existing UI patterns
- Delete confirmation uses existing dialog pattern
