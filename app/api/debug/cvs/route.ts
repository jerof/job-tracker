import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/debug/cvs?company=Stripe - Check CV data for an application
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'No DB' }, { status: 503 });
  }

  const company = request.nextUrl.searchParams.get('company') || 'Stripe';

  const { data, error } = await supabase
    .from('applications')
    .select('id, company, role, tailored_cv_url, tailored_cv_filename, tailored_cv_generated_at')
    .ilike('company', `%${company}%`);

  return NextResponse.json({ applications: data, error });
}
