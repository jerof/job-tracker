# Job Tracker Roadmap

> Philosophy: **Simple scales, fancy fails.** Build the simplest thing that works, iterate based on real usage.

---

## Current State (Shipped)

- [x] Kanban board (Saved → Applied → Interviewing → Offer → Closed)
- [x] Gmail sync to auto-detect applications
- [x] Email timeline view with content
- [x] URL paste to save jobs with auto-extraction
- [x] "Saved" column for jobs to apply later

---

## Phase 1: Quick Wins (1-2 days)
*Extend existing UI, no new dependencies*

### 1.1 Company Quick Links
- [ ] Auto-generate LinkedIn search link from company name
- [ ] Glassdoor link for reviews/salaries
- [ ] Company logo via Clearbit (`logo.clearbit.com/domain.com`)

### 1.2 Prep Notes Field
- [ ] Add "Interview Prep" textarea to card detail modal
- [ ] Collapsible section for prep notes
- [ ] Persists with application

### 1.3 Resume Link
- [ ] URL field to attach resume/cover letter link per application
- [ ] Tracks which version sent where
- [ ] Simple - just a link, no file upload yet

---

## Phase 2: AI-Powered Interview Prep (3-4 days)
*Leverage existing Claude integration*

### 2.1 Interview Question Generator
- [ ] "Generate Prep" button on Interviewing cards
- [ ] AI generates:
  - 5 likely behavioral questions
  - 3-5 technical topics to review
  - 3 smart questions to ask interviewer
  - Company talking points
- [ ] Uses Claude Haiku (~$0.001 per prep)
- [ ] Saves to prep notes field

### 2.2 Company Summary
- [ ] AI-generated company overview from public info
- [ ] Recent news/funding if available
- [ ] Culture insights from job description analysis

### 2.3 Role-Specific Prep
- [ ] Parse job description for key requirements
- [ ] Highlight skills to emphasize
- [ ] Suggest experience to mention

---

## Phase 3: Chrome Extension (5-7 days)
*Capture jobs before applying*

### 3.1 MVP Extension
- [ ] Manifest V3 (minimal permissions: `activeTab`, `storage`)
- [ ] "Save to Tracker" popup
- [ ] Pre-fills URL + page title
- [ ] User adds company/role, clicks save
- [ ] Syncs via API to main app

### 3.2 Duplicate Detection
- [ ] Badge shows if already applied to company
- [ ] Warning before saving duplicate

### 3.3 Job Board Integration
- [ ] Works on LinkedIn, Indeed, Glassdoor
- [ ] Auto-detect job posting pages
- [ ] Extract structured data where possible

---

## Phase 4: Resume Management (3-4 days)
*Track what you sent where*

### 4.1 File Upload
- [ ] Upload PDF/DOCX to Supabase Storage
- [ ] Attach to specific applications
- [ ] Download link on card detail

### 4.2 Version Tracking
- [ ] Name convention: `Role_Company_Date.pdf`
- [ ] See which resume sent to which company
- [ ] Master resume vs tailored versions

### 4.3 AI Resume Match (Future)
- [ ] Compare resume to job description
- [ ] Gap analysis
- [ ] Keyword suggestions

---

## Phase 5: Advanced Company Research (Future)
*Nice-to-have, not critical*

### Data Sources to Consider
| Source | Data | Cost |
|--------|------|------|
| Clearbit | Logo, domain info | Free |
| Wikipedia API | Company summary | Free |
| Crunchbase | Funding, size | Freemium |
| Glassdoor | Reviews, salaries | Restricted API |

### Features
- [ ] Embedded company cards with funding/size
- [ ] Glassdoor ratings inline
- [ ] Recent news feed
- [ ] Employee count trends

---

## Ideas Parking Lot
*Capture ideas, build later if users ask*

### Interview Prep Enhancement
- **Skills Matcher**: Based on job description, identify which skills from user's CV to highlight in interview. AI analyzes JD requirements vs CV experience and suggests talking points.

### UI/UX Enhancements
- **Left side vertical nav**: Navigation to access different modules of the app (Dashboard, Applications, CV, Research, Settings)
- **CV Module**: Add master CV section where user can store/edit their primary CV
- **Tailor CV feature**: Integrate /tailor-cv skill into the app UI to customize CV for specific job applications

### From Research
- **Auto-apply features**: Tools like Simplify autofill applications. Complex, potential ToS issues.
- **Calendar sync**: Interview scheduling. Users already have calendars.
- **Networking tracker**: Track referrals and contacts. Separate product.
- **Salary negotiation AI**: Help with offer negotiation. Phase 5+.

### User Requests
*(Add user-requested features here)*

---

## Competitive Landscape

### What Others Do Well
| Tool | Strength | Our Angle |
|------|----------|-----------|
| Huntr | Extension, autofill | Gmail-first, passive tracking |
| Teal | 40+ integrations, keyword analysis | Simpler, AI prep |
| Simplify | ATS autofill (Workday, etc) | Not competing on autofill |
| Final Round AI | Real-time interview copilot | Prep before, not during |

### Our Differentiators
1. **Gmail-first**: Passive tracking, no manual entry
2. **AI email parsing**: Auto-detect application status
3. **Interview prep AI**: Unique to our tool
4. **Simple UX**: Kanban board, not spreadsheet

---

## Technical Notes

### Chrome Extension Architecture
```
manifest.json     # V3, minimal permissions
popup.html/js     # Quick-add form
background.js     # Optional, for badge updates
```

Permissions needed:
- `activeTab` - Get current URL/title
- `storage` - Auth token
- `host_permissions` for API only

### AI Prep Prompt Structure
```
Generate interview prep for:
- Company: {company}
- Position: {position}
- Job Description: {description}

Return:
1. Likely behavioral questions (5)
2. Technical topics to review (3-5)
3. Questions to ask them (3)
4. Company talking points (2-3)
```

### Resume Storage
```sql
ALTER TABLE applications ADD COLUMN resume_path TEXT;
-- Supabase Storage: resumes/{userId}/{filename}
```

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| 1 | Prep notes used | 50% of interviewing cards |
| 2 | AI prep generated | 30% of interviews |
| 3 | Extension installs | 100 in first month |
| 4 | Resumes attached | 40% of applications |

---

## Changelog

| Date | Change |
|------|--------|
| 2024-12-31 | Initial roadmap created |
| | Added Phase 1-4 features |
| | Researched competitive landscape |

---

*Last updated: December 31, 2024*
