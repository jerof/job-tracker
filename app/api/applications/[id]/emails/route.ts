import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

interface ApplicationEmail {
  id: string;
  gmailMessageId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  emailType: string;
}

// GET /api/applications/[id]/emails - Get all emails linked to an application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { id: applicationId } = await params;

    // First verify the application exists
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .single();

    if (appError) {
      if (appError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
      }
      console.error('Application fetch error:', appError);
      return NextResponse.json(
        { error: 'Failed to fetch application' },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Fetch emails linked to this application, sorted by date ASC (chronological)
    const { data: emails, error: emailsError } = await supabase
      .from('application_emails')
      .select('*')
      .eq('application_id', applicationId)
      .order('email_date', { ascending: true });

    if (emailsError) {
      console.error('Emails fetch error:', emailsError);
      return NextResponse.json(
        { error: 'Failed to fetch emails' },
        { status: 500 }
      );
    }

    // Transform database records to API response format
    // Filter out calendar invites (they clutter the email list)
    const transformedEmails: ApplicationEmail[] = (emails || [])
      .filter((email) => {
        const subject = email.subject || '';
        // Exclude calendar invites
        if (subject.startsWith('Invitation from') || subject.includes('has been added to your calendar')) {
          return false;
        }
        return true;
      })
      .map((email) => ({
        id: email.id,
        gmailMessageId: email.gmail_message_id,
        from: email.from_name
          ? `${email.from_name} <${email.from_address}>`
          : email.from_address,
        subject: email.subject || '(No subject)',
        date: email.email_date,
        snippet: email.snippet || '',
        emailType: email.email_type || 'other',
      }));

    return NextResponse.json({ emails: transformedEmails });
  } catch (error) {
    console.error('Error fetching application emails:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
