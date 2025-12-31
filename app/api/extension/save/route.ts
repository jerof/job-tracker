import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { dbToApplication } from '@/lib/database.types';

interface ExtensionSaveRequest {
  company: string;
  role: string;
  jobUrl: string;
  location?: string;
  source: 'extension';
}

// POST /api/extension/save - Save a job from Chrome extension
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body: ExtensionSaveRequest = await request.json();

    // Validate required fields
    if (!body.company || typeof body.company !== 'string' || !body.company.trim()) {
      return NextResponse.json(
        { error: 'Company is required' },
        { status: 400 }
      );
    }

    if (!body.role || typeof body.role !== 'string' || !body.role.trim()) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    if (!body.jobUrl || typeof body.jobUrl !== 'string' || !body.jobUrl.trim()) {
      return NextResponse.json(
        { error: 'Job URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.jobUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid job URL format' },
        { status: 400 }
      );
    }

    const company = body.company.trim();
    const role = body.role.trim();
    const jobUrl = body.jobUrl.trim();
    const location = body.location?.trim() || null;

    // Check for duplicates: same job_url OR same company + role
    const { data: existingByUrl } = await supabase
      .from('applications')
      .select('id, company, role, job_url, status')
      .eq('job_url', jobUrl)
      .maybeSingle();

    if (existingByUrl) {
      return NextResponse.json(
        {
          error: 'Duplicate application found',
          message: 'A job with this URL already exists',
          existingApplication: {
            id: existingByUrl.id,
            company: existingByUrl.company,
            role: existingByUrl.role,
            jobUrl: existingByUrl.job_url,
            status: existingByUrl.status,
          },
        },
        { status: 409 }
      );
    }

    const { data: existingByCompanyRole } = await supabase
      .from('applications')
      .select('id, company, role, job_url, status')
      .ilike('company', company)
      .ilike('role', role)
      .maybeSingle();

    if (existingByCompanyRole) {
      return NextResponse.json(
        {
          error: 'Duplicate application found',
          message: `A job at ${existingByCompanyRole.company} for ${existingByCompanyRole.role} already exists`,
          existingApplication: {
            id: existingByCompanyRole.id,
            company: existingByCompanyRole.company,
            role: existingByCompanyRole.role,
            jobUrl: existingByCompanyRole.job_url,
            status: existingByCompanyRole.status,
          },
        },
        { status: 409 }
      );
    }

    // Create new application in 'saved' status
    const { data, error } = await supabase
      .from('applications')
      .insert({
        company,
        role,
        job_url: jobUrl,
        location,
        status: 'saved',
        notes: 'Saved via Chrome extension',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      // Handle unique constraint violation (race condition fallback)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Application already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to save application' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        application: dbToApplication(data),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving application from extension:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
