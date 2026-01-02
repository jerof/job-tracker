import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/debug/emails?company=Cleo - Debug email linking
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const company = request.nextUrl.searchParams.get('company');

    if (!company) {
      return NextResponse.json({ error: 'Company required' }, { status: 400 });
    }

    // Get applications
    const { data: apps } = await supabase
      .from('applications')
      .select('id, company, role, status')
      .ilike('company', `%${company}%`);

    if (!apps) {
      return NextResponse.json({ error: 'No applications' }, { status: 404 });
    }

    // Get emails for each application
    const result = [];
    for (const app of apps) {
      const { data: emails } = await supabase
        .from('application_emails')
        .select('id, subject, email_date, email_type')
        .eq('application_id', app.id)
        .order('email_date', { ascending: false });

      result.push({
        application: {
          id: app.id,
          company: app.company,
          role: app.role,
          status: app.status,
        },
        emails: emails || [],
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
