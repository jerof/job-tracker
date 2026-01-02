import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The HTML template matching the user's preferred CV format
const CV_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{NAME}} - {{ROLE}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: #1a1a1a;
            background: #fff;
            padding: 24px 32px;
            max-width: 210mm;
            margin: 0 auto;
        }

        header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f97316;
        }

        h1 {
            font-size: 18pt;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 4px;
        }

        .contact {
            font-size: 8.5pt;
            color: #525252;
        }

        .contact a {
            color: #525252;
            text-decoration: none;
        }

        .contact span {
            margin: 0 6px;
            color: #d4d4d4;
        }

        h2 {
            font-size: 9pt;
            font-weight: 600;
            color: #f97316;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
            margin-top: 10px;
        }

        .job {
            margin-bottom: 8px;
        }

        .job-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 1px;
        }

        .job-title {
            font-weight: 600;
            font-size: 9pt;
            color: #1a1a1a;
        }

        .job-date {
            font-size: 8pt;
            color: #737373;
        }

        .job-company {
            font-size: 8.5pt;
            color: #525252;
            font-style: italic;
            margin-bottom: 2px;
        }

        ul {
            padding-left: 14px;
        }

        li {
            margin-bottom: 1px;
            font-size: 8.5pt;
            color: #404040;
        }

        .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 3px 12px;
            font-size: 8.5pt;
        }

        .skill-category {
            display: flex;
            gap: 3px;
        }

        .skill-label {
            font-weight: 600;
            color: #525252;
        }

        .education-item {
            margin-bottom: 4px;
        }

        .edu-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }

        .edu-school {
            font-weight: 600;
            font-size: 8.5pt;
        }

        .edu-date {
            font-size: 8pt;
            color: #737373;
        }

        .edu-degree {
            font-size: 8pt;
            color: #525252;
        }

        .projects-section {
            margin-top: 8px;
        }

        .project-item {
            font-size: 8.5pt;
            color: #404040;
            margin-bottom: 2px;
        }

        .project-name {
            font-weight: 600;
            color: #1a1a1a;
        }

        @media print {
            body {
                padding: 20px 24px;
            }
        }
    </style>
</head>
<body>
{{BODY_CONTENT}}
</body>
</html>`;

const CV_GENERATION_PROMPT = `You are an expert CV writer. Create a tailored 1-page CV for a candidate applying to {company} for the {role} position.

CRITICAL RULES:
1. ONLY use facts, experiences, metrics, and details from the MASTER CV below
2. NEVER invent, fabricate, or embellish anything - every claim must be from the master CV
3. Reframe emphasis to highlight skills matching the job description
4. Remove or minimize irrelevant roles to fit on a single page
5. Keep bullet points concise with metrics where available

MASTER CV:
{masterCV}

JOB DESCRIPTION:
{jobDescription}

{feedback}

OUTPUT FORMAT - Use this EXACT HTML structure:

<header>
    <h1>[Candidate Name from master CV]</h1>
    <div class="contact">
        <a href="mailto:[email]">[email]</a>
        <span>|</span>
        [phone]
        <span>|</span>
        <a href="[linkedin]">[linkedin display]</a>
        <span>|</span>
        <a href="[website]">[website display]</a>
    </div>
</header>

<h2>Experience</h2>

<div class="job">
    <div class="job-header">
        <span class="job-title">[Job Title]</span>
        <span class="job-date">[Year - Year]</span>
    </div>
    <div class="job-company">[Company Name] | [Location] - [Brief company description if helpful]</div>
    <ul>
        <li>[Achievement with metrics if available]</li>
        <li>[Another achievement]</li>
    </ul>
</div>

[Repeat for each relevant job - prioritize most relevant to the target role]

<h2>Projects</h2>
<div class="projects-section">
    <div class="project-item"><span class="project-name">[Project Name]:</span> [Brief description]</div>
</div>

<h2>Education</h2>
<div class="education-item">
    <div class="edu-header">
        <span class="edu-school">[School Name]</span>
        <span class="edu-date">[Year]</span>
    </div>
    <div class="edu-degree">[Degree]</div>
</div>

<h2>Skills & Languages</h2>
<div class="skills-grid">
    <div class="skill-category"><span class="skill-label">[Category]:</span> [Skills relevant to role]</div>
</div>

IMPORTANT:
- Include 4-6 most relevant jobs (prioritize based on role match)
- Each job should have 1-3 bullet points max
- Include Projects section if candidate has relevant projects
- Tailor skills section to match job requirements
- Output ONLY the HTML body content (from <header> to closing </div>), no other text

Generate the HTML body content now:`;

export interface TailoredCVInput {
  masterCV: string;
  jobDescription: string;
  company: string;
  role: string;
  feedback?: string;
}

export interface TailoredCVResult {
  html: string;
  tokensUsed: number;
}

/**
 * Generate a tailored CV using Claude API
 * Returns HTML content suitable for PDF conversion
 */
export async function generateTailoredCV(input: TailoredCVInput): Promise<TailoredCVResult> {
  const { masterCV, jobDescription, company, role, feedback } = input;

  if (!masterCV || masterCV.trim().length < 50) {
    throw new Error('Master CV is too short or empty');
  }

  if (!jobDescription || jobDescription.trim().length < 50) {
    throw new Error('Job description is too short or empty');
  }

  // Build the prompt with all context
  const feedbackSection = feedback
    ? `USER FEEDBACK FOR REVISION:\n${feedback}\n\nPlease incorporate this feedback while generating the CV.`
    : '';

  const prompt = CV_GENERATION_PROMPT
    .replace('{masterCV}', masterCV.trim())
    .replace('{jobDescription}', jobDescription.trim().slice(0, 8000))
    .replace('{company}', company || 'Unknown Company')
    .replace('{role}', role || 'Unknown Role')
    .replace('{feedback}', feedbackSection);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let bodyContent = content.text.trim();

    // Clean up the response - extract just the HTML if wrapped in markdown
    const htmlMatch = bodyContent.match(/```html\s*([\s\S]*?)```/);
    if (htmlMatch) {
      bodyContent = htmlMatch[1].trim();
    }

    // Remove any leading/trailing text that's not HTML
    const headerStart = bodyContent.indexOf('<header');
    if (headerStart > 0) {
      bodyContent = bodyContent.slice(headerStart);
    }

    // Extract candidate name from the generated content for the title
    const nameMatch = bodyContent.match(/<h1>([^<]+)<\/h1>/);
    const candidateName = nameMatch ? nameMatch[1].trim() : 'Candidate';

    // Assemble the full HTML document
    const html = CV_HTML_TEMPLATE
      .replace('{{NAME}}', candidateName)
      .replace('{{ROLE}}', role || 'Position')
      .replace('{{BODY_CONTENT}}', bodyContent);

    return {
      html,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error:', error.message);
      throw new Error(`Failed to generate CV: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch job description from a URL
 */
export async function fetchJobDescription(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error(`Failed to fetch job URL: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const contentParts: string[] = [];

    // Extract meta description
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
      || html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    if (metaDesc?.[1]) {
      contentParts.push(`Description: ${metaDesc[1]}`);
    }

    // Extract JSON-LD job posting data
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        try {
          const data = JSON.parse(jsonContent);
          if (data['@type'] === 'JobPosting') {
            if (data.title) contentParts.push(`Job Title: ${data.title}`);
            if (data.description) contentParts.push(`Job Description: ${data.description}`);
            if (data.responsibilities) contentParts.push(`Responsibilities: ${data.responsibilities}`);
            if (data.qualifications) contentParts.push(`Qualifications: ${data.qualifications}`);
            if (data.skills) contentParts.push(`Skills: ${data.skills}`);
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    }

    // Extract visible body text (fallback)
    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (bodyText.length > 200) {
      contentParts.push(`Page Content: ${bodyText.slice(0, 6000)}`);
    }

    if (contentParts.length === 0) {
      return null;
    }

    return contentParts.join('\n\n');
  } catch (error) {
    console.error('Error fetching job description:', error);
    return null;
  }
}
