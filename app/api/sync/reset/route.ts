import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST /api/sync/reset - Reset sync log for a company to allow re-sync
// Body: { company: "Cleo" }
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

    // Find emails linked to this company's applications
    const { data: apps } = await supabase
      .from('applications')
      .select('id, company, role, status, source_email_id')
      .ilike('company', `%${company}%`);

    if (!apps || apps.length === 0) {
      return NextResponse.json({ error: 'No applications found for company', company }, { status: 404 });
    }

    console.log(`Found ${apps.length} applications for "${company}":`, apps);

    // Get email IDs to reset
    const emailIds = apps
      .filter(app => app.source_email_id)
      .map(app => app.source_email_id);

    // Also get emails from application_emails table
    const { data: linkedEmails } = await supabase
      .from('application_emails')
      .select('gmail_message_id')
      .in('application_id', apps.map(a => a.id));

    const allEmailIds = [
      ...emailIds,
      ...(linkedEmails || []).map(e => e.gmail_message_id)
    ].filter(Boolean);

    console.log(`Found ${allEmailIds.length} email IDs to reset`);

    // Delete from email_sync_log to allow re-processing
    if (allEmailIds.length > 0) {
      const { error: deleteError, count } = await supabase
        .from('email_sync_log')
        .delete()
        .in('email_id', allEmailIds);

      if (deleteError) {
        console.error('Error deleting sync log entries:', deleteError);
      } else {
        console.log(`Deleted ${count} sync log entries`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reset sync for ${apps.length} ${company} applications`,
      applications: apps.map(a => ({ company: a.company, role: a.role, status: a.status })),
      emailsReset: allEmailIds.length,
    });
  } catch (error) {
    console.error('Reset sync error:', error);
    return NextResponse.json(
      { error: 'Reset failed', details: String(error) },
      { status: 500 }
    );
  }
}
