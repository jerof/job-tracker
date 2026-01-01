# PRD-002: CV/Resume Module

## Overview

Users can upload or paste their master CV/resume so the app stores their skills, experience, and qualifications. This data enables future job-matching features by providing a single source of truth for the user's professional profile.

## User Stories

- As a user, I want to upload my CV as a PDF so I don't have to manually type everything
- As a user, I want to paste my CV text directly if I don't have a PDF handy
- As a user, I want to view and edit my stored CV content to keep it current

## UI Spec

### CV Page (`/cv`)

**Upload Section**
- Drag-and-drop zone or file picker for PDF upload (max 5MB)
- "Or paste text" toggle to switch to textarea input
- Submit button to save

**View/Edit Section**
- Display extracted/pasted text in editable textarea
- Character count indicator
- "Save Changes" button (disabled when no changes)
- "Delete CV" button with confirmation modal
- Last updated timestamp

**States**
- Empty: Show upload prompt
- Loading: Skeleton while extracting text
- Populated: Show editable text view
- Error: Toast notification for failures

## Data Model

### Supabase Table: `cvs`

```sql
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  pdf_storage_path TEXT,
  file_name TEXT,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policy
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own CV" ON cvs
  FOR ALL USING (auth.uid() = user_id);
```

## Technical Approach

### File Storage
- Use Supabase Storage bucket `cv-files` for PDF storage
- Store with path: `{user_id}/cv.pdf`
- Generate signed URL for download when needed

### Text Extraction
- Use `pdf-parse` library (server-side) to extract text from uploaded PDFs
- Fallback: If extraction fails, prompt user to paste text manually
- Store extracted text in `raw_text` column (max 50,000 chars)

### API Routes
- `POST /api/cv/upload` - Handle PDF upload, extract text, save
- `POST /api/cv/text` - Save pasted text directly
- `GET /api/cv` - Retrieve user's CV
- `PUT /api/cv` - Update CV text
- `DELETE /api/cv` - Remove CV and file

## Acceptance Criteria

- [ ] User can upload a PDF (max 5MB) and text is extracted and stored
- [ ] User can paste plain text directly as an alternative to PDF upload
- [ ] User can view their stored CV text on the CV page
- [ ] User can edit and save changes to their CV text
- [ ] User can delete their CV (removes both text and stored file)

## Out of Scope

- CV parsing into structured fields (skills, experience, education)
- Multiple CV versions or templates
- CV tailoring/optimization for specific jobs
- Resume builder/formatting tools
- AI-powered suggestions or improvements
