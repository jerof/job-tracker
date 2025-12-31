import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { fetchJobEmails } from '@/lib/gmail';
import { parseJobEmail, emailTypeToStatus } from '@/lib/parser';

// Helper function to extract name from email format "Name <email@example.com>"
function extractNameFromEmail(fromHeader: string): string | null {
  const match = fromHeader.match(/^([^<]+)</);
  return match ? match[1].trim() : null;
}

// POST /api/sync - Sync emails from Gmail
export async function POST() {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Get stored Gmail tokens
    console.log('Fetching Gmail tokens from DB...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('*')
      .single();

    if (tokenError) {
      console.error('Token fetch error:', tokenError);
      return NextResponse.json(
        { error: 'Gmail not connected', needsAuth: true, details: tokenError.message },
        { status: 401 }
      );
    }

    if (!tokenData) {
      console.log('No tokens found in DB');
      return NextResponse.json(
        { error: 'Gmail not connected', needsAuth: true },
        { status: 401 }
      );
    }

    console.log('Tokens found, fetching emails...');
    console.log('Access token length:', tokenData.access_token?.length);
    console.log('Refresh token length:', tokenData.refresh_token?.length);

    // Fetch job emails from Gmail
    const emails = await fetchJobEmails(
      tokenData.access_token,
      tokenData.refresh_token
    );

    console.log(`Fetched ${emails.length} emails from Gmail`);

    // Get already processed email IDs
    const { data: processedEmails } = await supabase
      .from('email_sync_log')
      .select('email_id');

    const processedIds = new Set((processedEmails || []).map((e) => e.email_id));
    console.log(`Already processed: ${processedIds.size} emails`);

    // Process new emails
    let newCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let alreadyProcessedCount = 0;

    for (const email of emails) {
      // Skip if already processed
      if (processedIds.has(email.id)) {
        console.log(`Skipping already processed: ${email.subject}`);
        alreadyProcessedCount++;
        continue;
      }

      // Skip calendar invites (they're not actual emails)
      if (email.subject.startsWith('Invitation from') ||
          email.subject.includes('has been added to your calendar') ||
          email.subject.includes('Accepted:') ||
          email.subject.includes('Declined:')) {
        console.log(`Skipping calendar invite: ${email.subject}`);
        await supabase.from('email_sync_log').insert({
          email_id: email.id,
          result: 'skipped',
        });
        skippedCount++;
        continue;
      }

      console.log(`Processing email: ${email.subject}`);

      // Parse email with OpenAI
      const parsed = await parseJobEmail(email.subject, email.from, email.body);
      console.log(`Parsed result:`, parsed);

      // Skip low confidence or unknown emails
      if (parsed.confidence < 0.6 || parsed.type === 'unknown' || !parsed.company) {
        console.log(`Skipping low confidence email: ${email.subject}`);
        await supabase.from('email_sync_log').insert({
          email_id: email.id,
          result: 'skipped',
        });
        skippedCount++;
        continue;
      }

      // Check if application already exists for this company + role
      let existing: { id: string; status: string; role: string | null } | null = null;

      // First try exact match (company + role)
      if (parsed.role) {
        const { data: exactMatch } = await supabase
          .from('applications')
          .select('id, status, role')
          .ilike('company', parsed.company)
          .eq('role', parsed.role)
          .maybeSingle();
        existing = exactMatch;
      }

      // If no exact match and we have a role, check for company with null role (update it)
      if (!existing && parsed.role) {
        const { data: nullRoleMatch } = await supabase
          .from('applications')
          .select('id, status, role')
          .ilike('company', parsed.company)
          .is('role', null)
          .maybeSingle();

        if (nullRoleMatch) {
          // Update the null-role entry with the parsed role
          await supabase
            .from('applications')
            .update({ role: parsed.role })
            .eq('id', nullRoleMatch.id);
          console.log(`Updated ${parsed.company} role to: ${parsed.role}`);
          existing = { ...nullRoleMatch, role: parsed.role };
        }
      }

      // If still no match and no role, check for company with null role
      if (!existing && !parsed.role) {
        const { data: nullRoleMatch } = await supabase
          .from('applications')
          .select('id, status, role')
          .ilike('company', parsed.company)
          .is('role', null)
          .maybeSingle();
        existing = nullRoleMatch;
      }

      // FINAL FALLBACK: If still no match, check for ANY application with same company
      // This prevents duplicates when role changes between emails (e.g., rejection with no role)
      if (!existing) {
        const { data: companyMatch } = await supabase
          .from('applications')
          .select('id, status, role')
          .ilike('company', parsed.company)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (companyMatch) {
          console.log(`Found company fallback match for ${parsed.company} (existing role: ${companyMatch.role})`);
          existing = companyMatch;
        }
      }

      const newStatus = emailTypeToStatus(parsed.type);
      const emailDate = new Date(email.date).toISOString();

      let applicationId: string | null = null;

      if (existing) {
        applicationId = existing.id;
        const statusOrder = ['applied', 'interviewing', 'offer', 'closed'];
        const currentIndex = statusOrder.indexOf(existing.status);
        const newIndex = statusOrder.indexOf(newStatus);

        if (newIndex > currentIndex || (newStatus === 'closed' && parsed.type === 'rejection')) {
          await supabase
            .from('applications')
            .update({
              status: newStatus,
              close_reason: parsed.type === 'rejection' ? 'rejected' : null,
            })
            .eq('id', existing.id);
          updatedCount++;
          console.log(`Updated ${parsed.company} to ${newStatus}`);
        }
      } else {
        const { data: insertedApp, error: insertError } = await supabase
          .from('applications')
          .insert({
            company: parsed.company,
            role: parsed.role,
            location: parsed.location,
            status: newStatus,
            close_reason: parsed.type === 'rejection' ? 'rejected' : null,
            applied_date: emailDate,
            source_email_id: email.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to insert application for ${parsed.company}:`, insertError);
          continue;
        }
        applicationId = insertedApp?.id;
        newCount++;
        console.log(`Created new application: ${parsed.company} - ${parsed.role || 'No role'} (id: ${insertedApp?.id})`);
      }

      // Link email metadata to application
      if (applicationId) {
        try {
          const { error: emailLinkError } = await supabase
            .from('application_emails')
            .upsert({
              application_id: applicationId,
              gmail_message_id: email.id,
              from_address: email.from,
              from_name: extractNameFromEmail(email.from),
              subject: email.subject,
              snippet: email.snippet,
              email_date: emailDate,
              email_type: parsed.type,
            }, { onConflict: 'application_id,gmail_message_id' });

          if (emailLinkError) {
            console.error(`Failed to link email for ${parsed.company}:`, emailLinkError);
            // Don't fail the sync, just log the error
          } else {
            console.log(`Linked email to application ${applicationId}`);
          }
        } catch (emailError) {
          console.error(`Error linking email for ${parsed.company}:`, emailError);
          // Don't fail the sync, just log the error
        }
      }

      await supabase.from('email_sync_log').insert({
        email_id: email.id,
        result: 'processed',
      });
    }

    console.log(`Sync complete: ${newCount} new, ${updatedCount} updated, ${skippedCount} skipped, ${alreadyProcessedCount} already processed`);

    return NextResponse.json({
      success: true,
      emailsScanned: emails.length,
      newApplications: newCount,
      updatedApplications: updatedCount,
      alreadyProcessed: alreadyProcessedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/sync - Check Gmail connection status
export async function GET() {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ connected: false, error: 'Database not configured' });
    }

    const { data, error } = await supabase
      .from('gmail_tokens')
      .select('id, updated_at')
      .single();

    console.log('Gmail status check:', { hasData: !!data, error: error?.message });

    return NextResponse.json({
      connected: !!data,
      lastSync: data?.updated_at || null,
    });
  } catch (err) {
    console.error('Gmail status error:', err);
    return NextResponse.json({ connected: false });
  }
}
