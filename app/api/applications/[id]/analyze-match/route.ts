import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServerClient } from '@/lib/supabase';
import { SkillsMatchResult } from '@/lib/skills-matcher.types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * POST /api/applications/[id]/analyze-match
 * Analyze job description against user's CV to find skill matches and gaps
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured', code: 'SERVER_ERROR' },
        { status: 503 }
      );
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured', code: 'SERVER_ERROR' },
        { status: 503 }
      );
    }

    const { id } = await params;

    // Fetch the application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, company, role, job_url, notes, user_id')
      .eq('id', id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found', code: 'SERVER_ERROR' },
        { status: 404 }
      );
    }

    // Fetch user's CV
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select('raw_text')
      .eq('user_id', application.user_id)
      .single();

    if (cvError || !cv?.raw_text) {
      return NextResponse.json(
        { error: 'No CV uploaded. Please upload your CV first to analyze skill matches.', code: 'NO_CV' },
        { status: 400 }
      );
    }

    // Get job description from job_url or notes
    let jobDescription: string | null = null;

    // Try fetching from job URL first
    if (application.job_url) {
      console.log(`Fetching job description from: ${application.job_url}`);
      jobDescription = await fetchJobPosting(application.job_url);
    }

    // Fall back to notes if no job posting content
    if (!jobDescription && application.notes) {
      // Check if notes contain substantial job description content
      if (application.notes.length > 100) {
        jobDescription = application.notes;
      }
    }

    if (!jobDescription) {
      return NextResponse.json(
        {
          error: 'No job description available. Add a job URL or paste the job description in notes.',
          code: 'NO_JOB_DESCRIPTION'
        },
        { status: 400 }
      );
    }

    // Call OpenAI with structured prompt
    console.log(`Analyzing skills match for ${application.company} - ${application.role}`);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a career coach. Analyze the job description against the candidate's CV/resume.
Return ONLY valid JSON with no markdown formatting, following this exact structure:
{
  "matchedSkills": ["skill1", "skill2", ...],
  "skillGaps": ["skill1", "skill2", ...],
  "talkingPoints": ["point1", "point2", "point3"],
  "matchScore": 75
}

Rules:
- matchedSkills: Skills from JD that appear in the CV (explicit or demonstrated through experience)
- skillGaps: Required skills from JD that are missing or weak in the CV
- talkingPoints: 3-5 specific talking points the candidate should prepare, highlighting their strengths for this role
- matchScore: 0-100 score based on overall fit (skills match, experience level, domain knowledge)`
        },
        {
          role: 'user',
          content: `## Job Description
${jobDescription.slice(0, 4000)}

## Candidate CV/Resume
${cv.raw_text.slice(0, 4000)}

Analyze the match between this job and the candidate's background.`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json(
        { error: 'No response from AI. Please try again.', code: 'AI_ERROR' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.', code: 'AI_ERROR' },
        { status: 500 }
      );
    }

    // Validate and construct result
    const result: SkillsMatchResult = {
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
      talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
      matchScore: typeof parsed.matchScore === 'number'
        ? Math.min(100, Math.max(0, parsed.matchScore))
        : 50,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Skills match API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse request. Please try again.', code: 'SERVER_ERROR' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze skills match. Please try again.', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
