import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST /api/sync/fix-duplicates - Remove duplicate email links and assign to correct app
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { company } = await request.json();

    // Get applications
    const { data: apps } = await supabase
      .from('applications')
      .select('id, company, role, status, created_at')
      .ilike('company', `%${company}%`)
      .order('created_at', { ascending: true });

    if (!apps || apps.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 applications to fix duplicates' }, { status: 400 });
    }

    // Get all emails for these apps
    const { data: allEmails } = await supabase
      .from('application_emails')
      .select('*')
      .in('application_id', apps.map(a => a.id));

    if (!allEmails) {
      return NextResponse.json({ error: 'No emails found' }, { status: 404 });
    }

    // Group emails by gmail_message_id to find duplicates
    const emailsByMessageId: Record<string, typeof allEmails> = {};
    for (const email of allEmails) {
      const mid = email.gmail_message_id;
      if (!emailsByMessageId[mid]) {
        emailsByMessageId[mid] = [];
      }
      emailsByMessageId[mid].push(email);
    }

    const fixes: string[] = [];

    for (const [messageId, duplicates] of Object.entries(emailsByMessageId)) {
      if (duplicates.length <= 1) continue;

      const email = duplicates[0];
      const subject = email.subject || '';
      const emailDate = new Date(email.email_date);

      // Determine which app this email belongs to
      let correctAppId: string | null = null;

      // Check if subject mentions a specific role
      for (const app of apps) {
        if (app.role && subject.toLowerCase().includes(app.role.toLowerCase().substring(0, 20))) {
          correctAppId = app.id;
          fixes.push(`"${subject}" → ${app.role} (role mentioned in subject)`);
          break;
        }
      }

      // If no role match, assign based on date proximity to app creation
      if (!correctAppId) {
        let closestApp = apps[0];
        let closestDiff = Math.abs(emailDate.getTime() - new Date(apps[0].created_at).getTime());

        for (const app of apps) {
          const diff = Math.abs(emailDate.getTime() - new Date(app.created_at).getTime());
          if (diff < closestDiff) {
            closestDiff = diff;
            closestApp = app;
          }
        }
        correctAppId = closestApp.id;
        fixes.push(`"${subject}" → ${closestApp.role} (closest by date)`);
      }

      // Delete duplicates, keep only the one for correct app
      for (const dup of duplicates) {
        if (dup.application_id !== correctAppId) {
          await supabase
            .from('application_emails')
            .delete()
            .eq('id', dup.id);
        }
      }

      // Update the remaining one to correct app if needed
      const remaining = duplicates.find(d => d.application_id === correctAppId);
      if (!remaining) {
        // All were for wrong app, update the first one
        await supabase
          .from('application_emails')
          .update({ application_id: correctAppId })
          .eq('id', duplicates[0].id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixes.length} duplicate emails`,
      fixes,
      applications: apps.map(a => ({ role: a.role, status: a.status, created_at: a.created_at })),
    });
  } catch (error) {
    console.error('Fix duplicates error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
