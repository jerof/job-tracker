import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Normalize role for comparison
function normalizeRole(role: string): string {
  return role.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Check if role appears in text
function roleInText(text: string, role: string): boolean {
  const normText = normalizeRole(text);
  const normRole = normalizeRole(role);
  return normText.includes(normRole);
}

// POST /api/sync/fix-emails - Re-link emails to correct applications based on role in subject
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { company } = await request.json();

    if (!company) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    // Get all applications for this company
    const { data: apps } = await supabase
      .from('applications')
      .select('id, company, role, status')
      .ilike('company', `%${company}%`);

    if (!apps || apps.length === 0) {
      return NextResponse.json({ error: 'No applications found', company }, { status: 404 });
    }

    console.log(`Found ${apps.length} applications for "${company}":`, apps);

    // Get all emails linked to these applications
    const { data: emails } = await supabase
      .from('application_emails')
      .select('*')
      .in('application_id', apps.map(a => a.id));

    if (!emails || emails.length === 0) {
      return NextResponse.json({ message: 'No emails to fix', applications: apps });
    }

    console.log(`Found ${emails.length} emails to check`);

    const fixes: Array<{ email: string; from: string; to: string }> = [];

    for (const email of emails) {
      const currentApp = apps.find(a => a.id === email.application_id);

      // Check if email subject mentions a specific role
      for (const app of apps) {
        if (app.role && app.id !== email.application_id) {
          // Check if this email's subject mentions THIS app's role
          if (roleInText(email.subject || '', app.role)) {
            console.log(`Email "${email.subject}" mentions role "${app.role}" but is linked to "${currentApp?.role}"`);

            // Re-link to correct application
            const { error } = await supabase
              .from('application_emails')
              .update({ application_id: app.id })
              .eq('id', email.id);

            if (!error) {
              fixes.push({
                email: email.subject,
                from: currentApp?.role || 'unknown',
                to: app.role,
              });
            }
            break;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixes.length} email links`,
      fixes,
      applications: apps.map(a => ({ id: a.id, role: a.role, status: a.status })),
    });
  } catch (error) {
    console.error('Fix emails error:', error);
    return NextResponse.json(
      { error: 'Fix failed', details: String(error) },
      { status: 500 }
    );
  }
}
