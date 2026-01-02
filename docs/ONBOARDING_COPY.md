# Onboarding Flow Microcopy

**Product:** Job Tracker - "Your Job Search OS"
**Goal:** Get users to their AHA moment (seeing a tailored CV) in under 2 minutes
**Tone:** Friendly, encouraging, fast-paced, no friction

---

## Step 1: Google OAuth

### Page Headline
**Get started in seconds**

### Subtext
Sign in with Google to keep your job search organized and secure. We'll never post anything or access your email without permission.

### Button Text
**Continue with Google**

### Privacy Reassurance
By continuing, you agree to our [Terms of Service](#) and [Privacy Policy](#). Your data stays yours.

---

## Step 2: CV Input

### Page Headline
**Let's build your master CV**

### Placeholder Text (Textarea)
```
Paste your CV or experience here...

Example:
Software Engineer at TechCorp (2021-2024)
- Built payment processing system handling $2M daily
- Led migration to cloud infrastructure
- Managed team of 3 junior developers
```

### Upload PDF Button Text
**Or upload a PDF**

### No CV Link Text
**I don't have a CV yet**

### Helper Text Below Input
Don't worry about formatting. Just paste whatever you have - we'll organize it for you.

---

## Step 3: AI Questions (Wizard)

### Page Headline
**A few quick questions**

### Progress Indicator Pattern
Question **X** of **Y**

---

### Question Type 1: Missing Achievements

**Question Text:**
Your experience looks solid, but we didn't spot any specific wins. What's an accomplishment you're most proud of?

**Placeholder/Example:**
e.g., "Grew user base from 10K to 50K in 6 months" or "Reduced support tickets by 40%"

**Skip Button:**
Skip for now

**Continue Button:**
Continue

---

### Question Type 2: Missing Skills

**Question Text:**
What are your top professional skills? Think tools, technologies, or expertise areas.

**Placeholder/Example:**
e.g., Python, project management, data analysis, customer research, Figma

**Skip Button:**
Skip for now

**Continue Button:**
Continue

---

### Question Type 3: Missing Target Role

**Question Text:**
What type of role are you looking for? This helps us tailor your CV to the right opportunities.

**Placeholder/Example:**
e.g., Senior Product Manager, Frontend Developer, Marketing Lead

**Skip Button:**
Skip for now

**Continue Button:**
Continue

---

### Question Type 4: Missing Recent Experience

**Question Text:**
What have you been up to recently? Any projects, freelance work, or learning you'd like to include?

**Placeholder/Example:**
e.g., Freelance consulting for 3 startups, completed AWS certification, built a side project

**Skip Button:**
Skip for now

**Continue Button:**
Continue

---

### Question Type 5: Missing Education

**Question Text:**
What's your educational background? Include degrees, certifications, or relevant courses.

**Placeholder/Example:**
e.g., BS Computer Science, Stanford | Google Analytics Certified | Completed Y Combinator Startup School

**Skip Button:**
Skip for now

**Continue Button:**
Continue

---

### Question Type 6: Generic Descriptions

**Question Text:**
Can you tell us about a specific project you led or contributed to? Details make your CV stand out.

**Placeholder/Example:**
e.g., "Led the redesign of our checkout flow, which increased conversions by 25% and reduced cart abandonment"

**Skip Button:**
Skip for now

**Continue Button:**
Continue

---

### Questions for No-CV Users (Extended Flow)

#### Question 1: Current Role
**Question Text:**
What's your current or most recent job title?

**Placeholder:**
e.g., Product Manager, Software Engineer, Marketing Coordinator

---

#### Question 2: Company and Duration
**Question Text:**
What company was that at, and how long were you there?

**Placeholder:**
e.g., Acme Corp, 2 years 3 months

---

#### Question 3: Main Responsibilities
**Question Text:**
What were your main responsibilities? Just 2-3 bullets is perfect.

**Placeholder:**
e.g.,
- Managed product roadmap for mobile app
- Led cross-functional team of 8
- Ran weekly stakeholder meetings

---

#### Question 4: Key Achievement
**Question Text:**
What's an achievement you're proud of from this role?

**Placeholder:**
e.g., Launched feature that increased user retention by 30%

---

#### Question 5: Top Skills
**Question Text:**
What are your strongest professional skills?

**Placeholder:**
e.g., SQL, stakeholder management, A/B testing, Jira, user research

---

#### Question 6: Education
**Question Text:**
What's your educational background?

**Placeholder:**
e.g., MBA from Wharton, BA Economics from UCLA

---

#### Question 7: Target Role
**Question Text:**
What type of role are you looking for next?

**Placeholder:**
e.g., Senior Product Manager at a growth-stage startup

---

## Step 4: Review Master CV

### Page Headline
**Your enhanced CV**

### Subtext
This is your master CV. We've organized everything and filled in the gaps. You can edit anytime, and we'll tailor it for each job you apply to.

### Edit Button Text
**Edit CV**

### Continue Button Text
**Looks good!**

### Encouragement Message
Nice work! Your CV is looking strong. Let's put it to use.

---

## Step 5: Add Job URL

### Page Headline
**Let's tailor your first CV**

### Subtext
Paste a job posting link and watch the magic happen. We'll customize your CV to match exactly what they're looking for.

### URL Input Placeholder
```
https://jobs.lever.co/company/role-abc123
```

### Manual Entry Labels
- **Company:** Where are you applying?
- **Role:** What's the job title?

### Skip Button Text
**Skip for now**

### Generate Button Text
**Generate tailored CV**

### Helper Text
Works with LinkedIn, Lever, Greenhouse, Workday, and most job boards.

---

## Step 6: Success / AHA Moment

### Celebration Headline
**Your tailored CV is ready!**

### Subtext
We've customized your CV for **[Role] at [Company]**. Keywords matched, experience reordered, ready to impress.

### Download Button Text
**Download PDF**

### Continue to Dashboard Button Text
**Go to dashboard**

### Share Prompt (Optional)
Love it? Share Job Tracker with a friend who's job hunting.

---

## Step 7: Dashboard Welcome

### Welcome Message (First Time)
**Welcome to your job search command center!**
Your first application is tracked below. Add more jobs, and we'll help you stay organized and prepared.

### Tooltip for CV Badge
**Tailored CV attached** - Click to view or download the CV customized for this role.

### Empty Column Messages

**Saved Column (Empty):**
Jobs you're interested in will appear here. Paste a URL to add your first one.

**Applied Column (Empty):**
Drag jobs here once you've submitted your application.

**Interview Column (Empty):**
Move jobs here when you land an interview. You've got this!

**Offer Column (Empty):**
The finish line. Offers you receive will be celebrated here.

**Rejected Column (Empty):**
It happens to everyone. Track rejections to spot patterns and improve.

---

## Loading State Messages

### Variation 1
**Analyzing your experience...**

### Variation 2
**Crafting your enhanced CV...**

### Variation 3
**Matching your skills to the job...**

### Variation 4
**Almost there...**

### PDF Upload Loading
**Extracting text from your CV...**

### Job URL Loading
**Fetching job details...**

### Tailored CV Generation
**Creating your tailored CV...**

---

## Error Messages

### PDF Extraction Failed
**Couldn't read that PDF**
The file might be scanned or have an unusual format. Try pasting your CV text instead.
[Paste text instead]

### Invalid Job URL
**Couldn't fetch job details**
We couldn't reach that URL. You can enter the details manually.
[Enter manually] [Try again]

### AI Generation Failed
**Something went wrong**
Our CV generator hit a snag. Let's give it another shot.
[Retry] [Skip for now]

### Network Error
**Lost connection**
Check your internet and try again. Your progress is saved.
[Retry]

### File Too Large
**File is too large**
Please upload a PDF under 5MB.
[Choose another file]

### Session Expired
**Session expired**
Sign in again to continue where you left off.
[Sign in]

---

## Warning Messages

### Thin CV Warning
**Your CV is a bit light**
Consider answering a few more questions to strengthen it. Tailored CVs work best with more details.
[Answer more questions] [Continue anyway]

### Unreachable URL Warning
**Couldn't fetch job posting**
We'll use the company and role you entered. The tailored CV might be less specific.
[Continue] [Try different URL]

### Skipped All Questions Warning
**No extra details added**
Your master CV will use only what you provided. You can always enhance it later.
[Continue]

### No CV and Skipped Questions
**Not enough to build a CV**
We need at least your job title and a couple of responsibilities. Mind answering just 2-3 questions?
[Answer questions]

---

## Microcopy Patterns

### Progress Encouragement
- Step 2: "Just 4 quick steps to your tailored CV"
- Step 3: "Almost there - these answers make your CV shine"
- Step 4: "Looking great! One more step"
- Step 5: "Final step - let's see the magic"

### Skip Reassurance
When users skip questions, show briefly:
"No problem - you can always add this later"

### Time Indicators
- On CV Input: "Takes about 30 seconds"
- On Questions: "Usually 2-3 questions"
- On Review: "Quick review, then the fun part"

---

## Accessibility Notes

- All buttons have clear, action-oriented labels
- Error messages explain what went wrong and how to fix it
- Progress indicators use both visual (dots) and text ("Step 2 of 4")
- Skip options are clearly visible but not primary
- Loading states indicate progress, not just spinning

---

## Voice and Tone Guidelines

| Situation | Tone | Example |
|-----------|------|---------|
| Instructions | Clear, direct | "Paste your CV or experience here" |
| Encouragement | Warm, supportive | "Nice work! Your CV is looking strong" |
| Errors | Calm, helpful | "Couldn't read that PDF. Try pasting text instead" |
| Celebrations | Enthusiastic | "Your tailored CV is ready!" |
| Warnings | Honest, constructive | "Your CV is a bit light. Consider answering more" |

**Words to use:** tailored, customize, enhance, strong, ready, smart
**Words to avoid:** perfect, guaranteed, best, complicated, difficult

---

*Last updated: 2026-01-02*
