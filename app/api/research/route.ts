import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@/lib/supabase';
import { ResearchRequest, ResearchResponse, DbCompanyResearch } from '@/lib/research.types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache duration: 7 days in milliseconds
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Fetch job posting content from URL
 * Handles JavaScript-rendered pages by extracting from meta tags and JSON-LD
 */
async function fetchJobPosting(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!response.ok) {
      console.warn(`Failed to fetch job posting: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract meaningful content from various sources
    const contentParts: string[] = [];

    // 1. Extract from meta description
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (metaDesc?.[1]) {
      contentParts.push(`Description: ${metaDesc[1]}`);
    }

    // 2. Extract from og:description
    const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogDesc?.[1] && ogDesc[1] !== metaDesc?.[1]) {
      contentParts.push(`About: ${ogDesc[1]}`);
    }

    // 3. Extract title
    const title = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (title?.[1]) {
      contentParts.push(`Title: ${title[1]}`);
    }

    // 4. Try to extract JSON-LD structured data (common in job postings)
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
        try {
          const data = JSON.parse(jsonContent);
          if (data['@type'] === 'JobPosting' || data.description) {
            contentParts.push(`Structured Data: ${JSON.stringify(data)}`);
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    }

    // 5. Extract any visible content from HTML body (excluding scripts/styles)
    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/&#\d+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Only include body text if it has meaningful content
    if (bodyText.length > 200 && !bodyText.includes('enable JavaScript')) {
      contentParts.push(`Page Content: ${bodyText.slice(0, 5000)}`);
    }

    const result = contentParts.join('\n\n');
    console.log(`Extracted job posting: ${result.length} chars from ${contentParts.length} sources`);

    return result.length > 50 ? result : null;
  } catch (error) {
    console.warn('Failed to fetch job posting:', error);
    return null;
  }
}

/**
 * Fetch email content for an application
 */
async function fetchEmailContext(applicationId: string, supabase: ReturnType<typeof createServerClient>): Promise<string | null> {
  if (!supabase) return null;

  try {
    // Get the application to find the source email
    const { data: app } = await supabase
      .from('applications')
      .select('source_email_id')
      .eq('id', applicationId)
      .single();

    if (!app?.source_email_id) return null;

    // Get the email content
    const { data: email } = await supabase
      .from('emails')
      .select('subject, body, snippet')
      .eq('gmail_message_id', app.source_email_id)
      .single();

    if (!email) return null;

    return `Email Subject: ${email.subject}\nEmail Content: ${email.body || email.snippet || ''}`;
  } catch (error) {
    console.warn('Failed to fetch email context:', error);
    return null;
  }
}

/**
 * Extract domain from company name - only used as fallback
 * Returns null to avoid wrong guesses like voize.com instead of voize.de
 */
function guessDomain(company: string): string | null {
  // Don't guess - let the AI determine the domain from context
  return null;
}

/**
 * Get Clearbit logo URL for a domain
 */
function getLogoUrl(domain: string | null): string | null {
  if (!domain) return null;
  return `https://logo.clearbit.com/${domain}`;
}

/**
 * Check if cached research is still valid (less than 7 days old)
 */
function isCacheValid(updatedAt: string): boolean {
  const cacheDate = new Date(updatedAt).getTime();
  const now = Date.now();
  return (now - cacheDate) < CACHE_DURATION_MS;
}

interface ResearchContext {
  jobPostingContent?: string | null;
  emailContent?: string | null;
}

/**
 * Generate research using OpenAI with real context
 */
async function generateResearch(
  company: string,
  role: string,
  jobUrl?: string,
  context?: ResearchContext
): Promise<ResearchResponse> {
  // Build context section with real data
  let contextSection = '';

  if (context?.jobPostingContent) {
    contextSection += `\n\n## ACTUAL JOB POSTING CONTENT (USE THIS AS PRIMARY SOURCE):\n${context.jobPostingContent}\n`;
  }

  if (context?.emailContent) {
    contextSection += `\n\n## EMAIL FROM COMPANY:\n${context.emailContent}\n`;
  }

  if (jobUrl) {
    contextSection += `\n\nJob posting URL: ${jobUrl}`;
  }

  const prompt = `You are an expert career coach and company researcher. Research the following company and role to help someone prepare for a job interview.

Company: ${company}
Role: ${role}
${contextSection}

IMPORTANT: If job posting content is provided above, extract REAL information from it. Do NOT make up information - use what's actually in the job posting. For any fields where you don't have real data, use null or leave arrays empty rather than guessing.

Respond with ONLY valid JSON, no markdown code blocks or other text:

{
  "company": {
    "name": "${company}",
    "domain": "the actual company domain (check the job posting URL or content for hints, e.g., voize.de not voize.com)",
    "description": "2-3 sentence description based on ACTUAL information from the job posting or email",
    "founded": "year founded if mentioned, or null",
    "headquarters": "city, country if mentioned, or null",
    "employeeCount": "if mentioned in posting, or null",
    "funding": {
      "stage": "funding stage if mentioned (e.g., Series A), or null",
      "totalRaised": "amount if mentioned, or null"
    },
    "culture": ["cultural values ACTUALLY mentioned in the posting"],
    "recentNews": [
      {
        "title": "Recent news if mentioned",
        "date": "date if known",
        "summary": "summary"
      }
    ],
    "competitors": ["competitors if you can reasonably identify them based on the company description"]
  },
  "role": {
    "title": "${role}",
    "typicalResponsibilities": ["ACTUAL responsibilities from the job posting"],
    "requiredSkills": ["ACTUAL skills/requirements from the job posting"],
    "interviewQuestions": [
      "Interview questions based on the ACTUAL responsibilities and requirements listed"
    ],
    "questionsToAsk": [
      "Thoughtful questions based on what the posting reveals about the role and company"
    ],
    "salaryRange": "salary if mentioned in posting, otherwise a reasonable estimate based on role/location/company stage"
  }
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that extracts information from job postings and returns structured JSON. Always respond with valid JSON only, no markdown or explanations.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 3000,
    temperature: 0.3,  // Lower temperature for more factual extraction
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('No content in OpenAI response');
  }

  // Parse JSON from response, handling potential markdown code blocks
  let jsonText = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  const parsed = JSON.parse(jsonText);

  // Helper to convert string "null" to actual null
  const toNull = (val: unknown): string | null => {
    if (val === null || val === undefined || val === 'null' || val === '') return null;
    return String(val);
  };

  // Helper for arrays - filter out empty/null values
  const toArray = (val: unknown): string[] => {
    if (!Array.isArray(val)) return [];
    return val.filter(item => item && item !== 'null' && item !== '');
  };

  // Get domain and logo - prefer domain from AI response
  const domain = toNull(parsed.company?.domain) || guessDomain(company);
  const logo = getLogoUrl(domain);

  return {
    company: {
      name: parsed.company?.name || company,
      domain: domain,
      logo: logo,
      description: toNull(parsed.company?.description) || '',
      founded: toNull(parsed.company?.founded),
      headquarters: toNull(parsed.company?.headquarters),
      employeeCount: toNull(parsed.company?.employeeCount),
      funding: parsed.company?.funding && parsed.company.funding.stage !== 'null' ? {
        stage: toNull(parsed.company.funding.stage),
        totalRaised: toNull(parsed.company.funding.totalRaised),
      } : null,
      culture: toArray(parsed.company?.culture),
      recentNews: Array.isArray(parsed.company?.recentNews)
        ? parsed.company.recentNews.filter((n: { title?: string }) => n.title && n.title !== 'null')
        : [],
      competitors: toArray(parsed.company?.competitors),
    },
    role: {
      title: parsed.role?.title || role,
      typicalResponsibilities: toArray(parsed.role?.typicalResponsibilities),
      requiredSkills: toArray(parsed.role?.requiredSkills),
      interviewQuestions: toArray(parsed.role?.interviewQuestions),
      questionsToAsk: toArray(parsed.role?.questionsToAsk),
      salaryRange: toNull(parsed.role?.salaryRange),
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * POST /api/research
 * Generate or retrieve cached company and role research for interview prep
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 503 }
      );
    }

    // Parse request body
    const body: ResearchRequest = await request.json();

    // Validate required fields
    if (!body.company || typeof body.company !== 'string') {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (!body.role || typeof body.role !== 'string') {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    const company = body.company.trim();
    const role = body.role.trim();
    const jobUrl = body.jobUrl?.trim();
    const applicationId = body.applicationId;

    // Check cache in Supabase
    const supabase = createServerClient();

    if (supabase) {
      try {
        const { data: cached, error: cacheError } = await supabase
          .from('company_research')
          .select('*')
          .eq('company', company.toLowerCase())
          .eq('role', role.toLowerCase())
          .single();

        if (!cacheError && cached) {
          const dbRecord = cached as DbCompanyResearch;

          // Check if cache is still valid
          if (isCacheValid(dbRecord.updated_at)) {
            console.log(`Returning cached research for ${company} - ${role}`);
            return NextResponse.json(dbRecord.research_data);
          }

          console.log(`Cache expired for ${company} - ${role}, regenerating...`);
        }
      } catch (cacheCheckError) {
        console.warn('Cache check failed:', cacheCheckError);
      }
    }

    // Fetch real context for grounded research
    console.log(`Fetching context for ${company} - ${role}`);
    const context: ResearchContext = {};

    // Fetch job posting content if URL provided
    if (jobUrl) {
      console.log(`Fetching job posting from: ${jobUrl}`);
      context.jobPostingContent = await fetchJobPosting(jobUrl);
    }

    // Fetch email context if applicationId provided
    if (applicationId && supabase) {
      console.log(`Fetching email context for application: ${applicationId}`);
      context.emailContent = await fetchEmailContext(applicationId, supabase);
    }

    // Generate fresh research with real context
    console.log(`Generating research for ${company} - ${role} (with ${context.jobPostingContent ? 'job posting' : 'no job posting'}, ${context.emailContent ? 'email' : 'no email'})`);
    const research = await generateResearch(company, role, jobUrl, context);

    // Save to cache
    if (supabase) {
      try {
        const { error: upsertError } = await supabase
          .from('company_research')
          .upsert({
            company: company.toLowerCase(),
            role: role.toLowerCase(),
            domain: research.company.domain,
            research_data: research,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'company,role',
          });

        if (upsertError) {
          console.warn('Failed to cache research:', upsertError);
        } else {
          console.log(`Cached research for ${company} - ${role}`);
        }
      } catch (cacheError) {
        console.warn('Cache save failed:', cacheError);
      }
    }

    return NextResponse.json(research);

  } catch (error) {
    console.error('Research API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate research. Please try again.' },
      { status: 500 }
    );
  }
}
