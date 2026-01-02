import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cvToDb } from '@/lib/cv.types';
import { triggerCVGeneration } from '@/lib/cv-auto-generate';

export interface CompleteOnboardingRequest {
  masterCV: string;
  jobUrl?: string;
  jobDetails?: {
    company: string;
    role: string;
  };
}

export interface CompleteOnboardingResponse {
  success: boolean;
  cvId?: string;
  applicationId?: string;
  tailoredCVUrl?: string;
  error?: string;
}

// Fixed user ID for single-user mode until auth is implemented
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/onboarding/complete
 * Save master CV and optionally create first application with tailored CV
 */
export async function POST(request: NextRequest): Promise<NextResponse<CompleteOnboardingResponse>> {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database not configured',
        },
        { status: 503 }
      );
    }

    const body: CompleteOnboardingRequest = await request.json();

    // Validate master CV
    if (!body.masterCV || typeof body.masterCV !== 'string' || body.masterCV.trim().length < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Master CV is required and must be at least 50 characters',
        },
        { status: 400 }
      );
    }

    // Save master CV to database
    const cvData = cvToDb({
      userId: DEFAULT_USER_ID,
      rawText: body.masterCV.trim(),
      fileName: 'Master CV (Onboarding)',
      pdfStoragePath: null,
      fileSizeBytes: null,
    });

    const { data: savedCV, error: cvError } = await supabase
      .from('cvs')
      .insert(cvData)
      .select()
      .single();

    if (cvError) {
      console.error('Error saving master CV:', cvError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save master CV',
        },
        { status: 500 }
      );
    }

    const response: CompleteOnboardingResponse = {
      success: true,
      cvId: savedCV.id,
    };

    // If job details provided, create application
    if (body.jobUrl || body.jobDetails) {
      const company = body.jobDetails?.company || extractCompanyFromUrl(body.jobUrl || '');
      const role = body.jobDetails?.role || 'Position';

      if (!company) {
        // Job URL provided but couldn't extract company - still return success for CV
        return NextResponse.json(response);
      }

      const applicationData = {
        user_id: DEFAULT_USER_ID,
        company,
        role,
        status: 'saved',
        job_url: body.jobUrl || null,
        applied_date: null,
        notes: 'Created during onboarding',
      };

      const { data: savedApp, error: appError } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single();

      if (appError) {
        console.error('Error creating application:', appError);
        // Return success for CV even if application fails
        return NextResponse.json(response);
      }

      response.applicationId = savedApp.id;

      // Trigger CV generation in background if job URL provided
      if (body.jobUrl) {
        triggerCVGeneration(savedApp.id);
      }
    }

    // Update user onboarding status (if users table has these columns)
    try {
      await supabase
        .from('users')
        .update({
          onboarding_completed_at: new Date().toISOString(),
          onboarding_step: 7,
        })
        .eq('id', DEFAULT_USER_ID);
    } catch {
      // Ignore errors - users table may not have these columns yet
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error completing onboarding:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Extract company name from a job URL
 */
function extractCompanyFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Common job board patterns
    const patterns: Record<string, RegExp> = {
      lever: /jobs\.lever\.co\/([^/]+)/,
      greenhouse: /boards\.greenhouse\.io\/([^/]+)/,
      ashby: /jobs\.ashbyhq\.com\/([^/]+)/,
      workday: /([^.]+)\.wd\d+\.myworkdayjobs\.com/,
      linkedin: /linkedin\.com\/jobs\/view/,
    };

    // Check for job board patterns
    for (const [, regex] of Object.entries(patterns)) {
      const match = url.match(regex);
      if (match && match[1]) {
        return formatCompanyName(match[1]);
      }
    }

    // LinkedIn doesn't have company in URL reliably
    if (hostname.includes('linkedin.com')) {
      return null;
    }

    // Fallback: use hostname without common prefixes
    const cleanHostname = hostname
      .replace('www.', '')
      .replace('jobs.', '')
      .replace('careers.', '')
      .replace('.com', '')
      .replace('.io', '')
      .replace('.co', '');

    return formatCompanyName(cleanHostname);
  } catch {
    return null;
  }
}

/**
 * Format company name from URL slug
 */
function formatCompanyName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
