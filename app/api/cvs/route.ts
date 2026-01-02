import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CV } from '@/lib/types';

/**
 * GET /api/cvs
 * Fetch all CVs (master + tailored) for the CV Library
 */
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const cvs: CV[] = [];

    // Fetch master CV from cvs table
    const { data: masterCV, error: masterError } = await supabase
      .from('cvs')
      .select('id, raw_text, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (masterError && masterError.code !== 'PGRST116') {
      console.error('Error fetching master CV:', masterError);
    }

    if (masterCV) {
      cvs.push({
        id: masterCV.id,
        type: 'master',
        filename: 'Master CV',
        url: null,
        createdAt: masterCV.created_at,
        updatedAt: masterCV.updated_at || masterCV.created_at,
      });
    }

    // Fetch tailored CVs from applications table
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id, company, role, tailored_cv_url, tailored_cv_filename, tailored_cv_generated_at')
      .not('tailored_cv_url', 'is', null)
      .order('tailored_cv_generated_at', { ascending: false });

    if (appError) {
      console.error('Error fetching tailored CVs:', appError);
    }

    if (applications) {
      for (const app of applications) {
        if (app.tailored_cv_url) {
          cvs.push({
            id: `tailored-${app.id}`,
            type: 'tailored',
            filename: app.tailored_cv_filename || `CV_${app.company}.pdf`,
            url: app.tailored_cv_url,
            company: app.company,
            role: app.role || undefined,
            applicationId: app.id,
            createdAt: app.tailored_cv_generated_at || new Date().toISOString(),
            updatedAt: app.tailored_cv_generated_at || new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ cvs });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
