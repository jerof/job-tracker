# Feature Specification: CV Tailor per Application

**Created:** 2026-01-02
**Status:** Ready for Implementation

---

## Overview

### Problem Statement
Job seekers need to tailor their CV for each application, highlighting relevant experience that matches the job description. Currently, this is a manual, time-consuming process done outside the app. Users want an integrated solution that:
- Automatically analyzes the job posting
- Generates a tailored 1-page CV
- Allows iterative refinement based on feedback
- Stores the PDF with the application for easy access

### Solution
Add a "Tailored CV" section to the application Details tab that:
1. Auto-fetches JD from the application's job URL
2. Uses AI to match relevant experience from the user's master CV
3. Generates a tailored PDF stored with the application
4. Allows chat-style feedback for regeneration ("emphasize leadership more")

---

## User Stories

**Primary:**
As a job seeker,
I want to generate a tailored CV for each application,
So that I can highlight relevant experience without manual editing.

**Secondary:**
As a job seeker,
I want to refine the generated CV with feedback,
So that I can iterate until it perfectly matches the role.

As a job seeker,
I want to download the tailored PDF,
So that I can submit it with my application.

---

## User Experience

### User Flow

**Happy Path - First Generation:**
1. User opens application card → Details tab
2. Scrolls to "Tailored CV" section
3. Sees "Generate Tailored CV" button (if job URL exists)
4. Clicks button → loading state shows "Analyzing job posting..."
5. ~10-15 seconds later → PDF preview thumbnail + download button appear
6. User clicks download → PDF downloads

**Regeneration Flow:**
1. User sees existing CV with "Regenerate" link
2. Clicks "Regenerate" → chat input appears
3. Types feedback: "Emphasize my leadership experience more"
4. Clicks send → loading state
5. New PDF replaces old one

**Edge Cases:**
- No job URL: Show "Add a job URL to generate tailored CV"
- No master CV: Show "Add your master CV first" with link to /cv page
- Job URL fetch fails: Show error with "Enter JD manually" option

### UI/UX Details

**Location:** Details tab, after the Notes field, before the footer

**Components needed:**
```
┌─────────────────────────────────────────────────────────┐
│  TAILORED CV                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Before generation - no CV]                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📄 Generate a tailored CV for this role        │   │
│  │                                                  │   │
│  │  We'll analyze the job posting and highlight    │   │
│  │  your most relevant experience.                 │   │
│  │                                                  │   │
│  │  [Generate Tailored CV]                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [After generation - has CV]                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ┌──────┐                                       │   │
│  │  │ PDF  │  CV_Nikhil_Stripe.pdf                │   │
│  │  │ icon │  Generated Jan 2, 2026               │   │
│  │  └──────┘                                       │   │
│  │                                                  │   │
│  │  [Download]  [Regenerate]                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Regeneration mode]                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  What would you like to change?                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ Emphasize leadership experience...      │ ➤ │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │  [Cancel]                                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**States:**
- **Empty (no master CV):** "Add your CV to get started" + link to /cv
- **Empty (no job URL):** "Add a job URL to generate tailored CV"
- **Ready:** "Generate Tailored CV" button
- **Loading:** Spinner + "Analyzing job posting..." / "Generating PDF..."
- **Success:** PDF thumbnail + download + regenerate options
- **Error:** Error message + retry button

---

## Technical Specification

### Frontend

**Components to create/modify:**

1. `app/components/TailoredCVSection.tsx` - Main section component
   - States: empty, ready, loading, success, error, regenerating
   - PDF thumbnail preview
   - Download button
   - Regenerate with feedback input

2. `app/components/CardDetailModal.tsx` - Add TailoredCVSection to Details tab

**State management:**
- `tailoredCV`: Current CV data (url, filename, generatedAt) | null
- `isGenerating`: boolean
- `isRegenerating`: boolean
- `feedback`: string (for regeneration input)
- `error`: string | null

**API calls:**
```typescript
// Generate new CV
POST /api/applications/{id}/tailored-cv
Body: { feedback?: string }  // Optional for regeneration
Response: {
  pdfUrl: string,
  filename: string,
  generatedAt: string
}

// Get existing CV
GET /api/applications/{id}/tailored-cv
Response: {
  pdfUrl: string,
  filename: string,
  generatedAt: string
} | null
```

### Backend

**Endpoints:**

1. `POST /api/applications/[id]/tailored-cv/route.ts`
   - Validates application exists and has job URL
   - Fetches user's master CV from `cvs` table
   - Fetches JD from job URL (reuse existing fetch logic)
   - Calls Claude API to generate tailored CV content
   - Generates PDF using Puppeteer
   - Uploads PDF to Supabase Storage
   - Updates application with CV reference
   - Returns PDF URL and metadata

2. `GET /api/applications/[id]/tailored-cv/route.ts`
   - Returns current tailored CV metadata if exists
   - Returns null if not generated yet

**Business logic:**

```typescript
// CV Tailoring Pipeline
async function generateTailoredCV(applicationId: string, feedback?: string) {
  // 1. Fetch master CV
  const masterCV = await getMasterCV(userId);
  if (!masterCV) throw new Error('No master CV found');

  // 2. Fetch application with job URL
  const application = await getApplication(applicationId);
  if (!application.jobUrl) throw new Error('No job URL');

  // 3. Fetch JD from URL
  const jobDescription = await fetchJobDescription(application.jobUrl);

  // 4. Generate tailored content via Claude
  const tailoredContent = await generateWithClaude({
    masterCV: masterCV.rawText,
    jobDescription,
    company: application.company,
    role: application.role,
    feedback, // Optional regeneration feedback
  });

  // 5. Generate PDF
  const pdfBuffer = await generatePDF(tailoredContent);

  // 6. Upload to Supabase Storage
  const filename = `CV_${userName}_${application.company}.pdf`;
  const pdfUrl = await uploadToStorage(pdfBuffer, filename);

  // 7. Update application record
  await updateApplication(applicationId, {
    tailoredCvUrl: pdfUrl,
    tailoredCvFilename: filename,
    tailoredCvGeneratedAt: new Date().toISOString(),
  });

  return { pdfUrl, filename, generatedAt };
}
```

**Claude Prompt (based on /tailor-cv skill):**
```
You are an expert CV writer. Given a master CV and job description, create a tailored 1-page CV.

RULES:
- ONLY use facts and metrics from the master CV
- NEVER invent experiences or numbers
- Reframe emphasis to match the JD
- Remove irrelevant roles if needed for 1-page fit
- Output clean HTML suitable for PDF conversion

MASTER CV:
{masterCV}

JOB DESCRIPTION:
{jobDescription}

COMPANY: {company}
ROLE: {role}

{feedback ? `USER FEEDBACK: ${feedback}` : ''}

Generate a tailored CV HTML:
```

### Database

**Schema changes:**

```sql
-- Add columns to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tailored_cv_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tailored_cv_filename TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tailored_cv_generated_at TIMESTAMPTZ;
```

**Migration file:** `supabase/migrations/006_tailored_cv.sql`

**Supabase Storage:**
- Bucket: `tailored-cvs`
- Path: `{userId}/{applicationId}/{filename}`
- Public read access for download

### PDF Generation

**Using Puppeteer (server-side):**

```typescript
// lib/pdf-generator.ts
import puppeteer from 'puppeteer';

export async function generatePDF(htmlContent: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'] // For serverless environments
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(pdf);
}
```

**CV HTML Template:**
- Clean, professional design
- Single page constraint
- Consistent with /tailor-cv output style

---

## Acceptance Criteria

### Must Have
- [ ] User can generate tailored CV from application with job URL
- [ ] PDF is generated and stored in Supabase Storage
- [ ] User can download the generated PDF
- [ ] User can regenerate with text feedback
- [ ] Shows appropriate message when no master CV exists
- [ ] Shows appropriate message when no job URL exists
- [ ] Loading states during generation (10-15 seconds)
- [ ] Error handling with retry option

### Edge Cases Handled
- [ ] No master CV → "Add your CV first" with link to /cv
- [ ] No job URL → "Add a job URL to enable CV tailoring"
- [ ] Job URL fetch fails → Error with manual JD paste fallback
- [ ] PDF generation fails → Error with retry
- [ ] Storage upload fails → Error with retry
- [ ] Very long JD → Truncate to reasonable limit

---

## Test Scenarios

### Manual Testing

1. **Scenario: First-time CV generation**
   - Given: User has master CV, application has job URL
   - When: User clicks "Generate Tailored CV"
   - Then: Loading for 10-15s → PDF appears with download button
   - Edge: Verify PDF content matches expectations

2. **Scenario: Regeneration with feedback**
   - Given: User has existing tailored CV
   - When: User clicks "Regenerate", types "more leadership focus", submits
   - Then: New PDF replaces old one, download available
   - Edge: Verify feedback was applied to content

3. **Scenario: No master CV**
   - Given: User has no CV in system
   - When: User opens application details
   - Then: See "Add your CV first" message with link
   - Edge: Link navigates to /cv page

4. **Scenario: No job URL**
   - Given: Application has no job URL
   - When: User views Tailored CV section
   - Then: See "Add a job URL" message
   - Edge: After adding URL, generate button appears

### Automated Testing

**Unit tests:**
- `lib/cv-tailor.test.ts` - Claude prompt generation
- `lib/pdf-generator.test.ts` - PDF generation (mock puppeteer)

**Integration tests:**
- API endpoint tests with mocked Claude responses
- Storage upload/download flow

**E2E tests:**
- Full flow: open card → generate CV → download
- Regeneration flow

---

## Out of Scope

- Multiple CV versions/history (just latest)
- Direct CV text editing in the app
- Cover letter generation (separate feature)
- Sharing/exporting to job boards
- CV templates/themes selection

---

## Implementation Notes

**Estimated complexity:** Medium-High (2-3 sessions)

**Dependencies:**
- Puppeteer package for PDF generation
- Supabase Storage bucket setup
- Master CV must exist in `cvs` table

**Third-party libraries needed:**
- `puppeteer` - PDF generation
- Existing: `@anthropic-ai/sdk` - Claude API

**Files affected:**
- [ ] `app/components/TailoredCVSection.tsx` - Create new
- [ ] `app/components/CardDetailModal.tsx` - Modify (add section)
- [ ] `app/api/applications/[id]/tailored-cv/route.ts` - Create new
- [ ] `lib/cv-tailor.ts` - Create new (business logic)
- [ ] `lib/pdf-generator.ts` - Create new
- [ ] `lib/types.ts` - Add tailored CV fields to Application
- [ ] `supabase/migrations/006_tailored_cv.sql` - Create new

**Risks/Considerations:**
- **Puppeteer in serverless:** May need to use `@sparticuz/chromium` for Vercel
- **Cold start times:** First PDF generation may be slow (~20s)
- **Storage costs:** PDFs are ~100KB each, monitor usage
- **Rate limits:** Claude API calls, consider caching JD analysis

---

## Questions/Decisions Log

| Question | Decision | Rationale |
|----------|----------|-----------|
| UI location? | Section in Details tab | Simpler than new tab, contextual to application |
| Version history? | Latest only | Simpler, less storage, users can regenerate |
| JD source? | Auto-fetch from job URL | Already have URL, reduces friction |
| PDF generation? | Server-side Puppeteer | More reliable formatting |
| Regeneration UX? | Chat-style feedback | Natural, flexible, matches Research Chat pattern |
