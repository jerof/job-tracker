import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/extension/check-duplicate - Check if a job already exists
// Query params: url, company, role
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const company = searchParams.get('company');
    const role = searchParams.get('role');

    // Must provide either url or both company and role
    if (!url && (!company || !role)) {
      return NextResponse.json(
        { error: 'Must provide either url or both company and role' },
        { status: 400 }
      );
    }

    // Check by URL first (most reliable)
    if (url) {
      const { data: existingByUrl, error: urlError } = await supabase
        .from('applications')
        .select('id, company, role, job_url, status, created_at')
        .eq('job_url', url)
        .maybeSingle();

      if (urlError) {
        console.error('Database error checking URL:', urlError);
        return NextResponse.json(
          { error: 'Failed to check for duplicates' },
          { status: 500 }
        );
      }

      if (existingByUrl) {
        return NextResponse.json({
          isDuplicate: true,
          matchType: 'url',
          existingApplication: {
            id: existingByUrl.id,
            company: existingByUrl.company,
            role: existingByUrl.role,
            jobUrl: existingByUrl.job_url,
            status: existingByUrl.status,
            createdAt: existingByUrl.created_at,
          },
        });
      }
    }

    // Check by company + role (case insensitive)
    if (company && role) {
      const { data: existingByCompanyRole, error: companyRoleError } = await supabase
        .from('applications')
        .select('id, company, role, job_url, status, created_at')
        .ilike('company', company.trim())
        .ilike('role', role.trim())
        .maybeSingle();

      if (companyRoleError) {
        console.error('Database error checking company+role:', companyRoleError);
        return NextResponse.json(
          { error: 'Failed to check for duplicates' },
          { status: 500 }
        );
      }

      if (existingByCompanyRole) {
        return NextResponse.json({
          isDuplicate: true,
          matchType: 'company_role',
          existingApplication: {
            id: existingByCompanyRole.id,
            company: existingByCompanyRole.company,
            role: existingByCompanyRole.role,
            jobUrl: existingByCompanyRole.job_url,
            status: existingByCompanyRole.status,
            createdAt: existingByCompanyRole.created_at,
          },
        });
      }
    }

    // No duplicate found
    return NextResponse.json({
      isDuplicate: false,
    });
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
