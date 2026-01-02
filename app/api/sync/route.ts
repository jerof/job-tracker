import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { fetchJobEmails } from '@/lib/gmail';
import { parseJobEmail, emailTypeToStatus } from '@/lib/parser';

// Helper function to extract name from email format "Name <email@example.com>"
function extractNameFromEmail(fromHeader: string): string | null {
  const match = fromHeader.match(/^([^<]+)</);
  return match ? match[1].trim() : null;
}

// Normalize company name for comparison (remove common suffixes, lowercase, trim)
function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+(inc|llc|ltd|co|corp|corporation|ai|io|hq)\.?$/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Check if two company names are likely the same company
function companiesMatch(name1: string, name2: string): boolean {
  const norm1 = normalizeCompanyName(name1);
  const norm2 = normalizeCompanyName(name2);

  // Exact match after normalization
  if (norm1 === norm2) return true;

  // One contains the other (handles "Cleo" vs "Cleo AI")
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

  return false;
}

// Normalize role for fuzzy comparison
function normalizeRole(role: string): string {
  return role
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check if two roles are likely the same position
function rolesMatch(role1: string | null, role2: string | null): boolean {
  if (!role1 || !role2) return false;

  const norm1 = normalizeRole(role1);
  const norm2 = normalizeRole(role2);

  // Exact match after normalization
  if (norm1 === norm2) return true;

  // One contains the other (handles slight variations)
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

  // Check if key words match (at least 2 significant words)
  const words1 = norm1.split(' ').filter(w => w.length > 2);
  const words2 = norm2.split(' ').filter(w => w.length > 2);
  const commonWords = words1.filter(w => words2.includes(w));
  if (commonWords.length >= 2) return true;

  return false;
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
      let existing: { id: string; status: string; role: string | null; company: string } | null = null;

      // At this point, parsed.company is guaranteed to exist (checked above)
      const parsedCompany = parsed.company as string;
      const parsedRole = parsed.role || null;

      // Get all applications to do fuzzy company matching
      const { data: allApplications } = await supabase
        .from('applications')
        .select('id, status, role, company')
        .order('created_at', { ascending: false });

      if (allApplications && allApplications.length > 0) {
        console.log(`Checking ${allApplications.length} existing applications for match with "${parsedCompany}" - "${parsedRole || 'no role'}"`);

        // Get all applications matching this company
        const companyMatches = allApplications.filter(app =>
          app.company && companiesMatch(app.company, parsedCompany)
        );

        if (companyMatches.length > 0) {
          console.log(`Found ${companyMatches.length} company matches for "${parsedCompany}"`);

          // Priority 1: Exact company + role match (fuzzy role matching)
          if (parsedRole) {
            const roleMatch = companyMatches.find(app =>
              rolesMatch(app.role, parsedRole)
            );
            if (roleMatch) {
              console.log(`Found role match: ${roleMatch.company} - ${roleMatch.role}`);
              existing = roleMatch;
            }
          }

          // Priority 2: If no role match but we have a role, check for app with null role (update it)
          if (!existing && parsedRole) {
            const nullRoleMatch = companyMatches.find(app => app.role === null);
            if (nullRoleMatch) {
              await supabase
                .from('applications')
                .update({ role: parsedRole })
                .eq('id', nullRoleMatch.id);
              console.log(`Updated ${nullRoleMatch.company} role to: ${parsedRole}`);
              existing = { ...nullRoleMatch, role: parsedRole };
            }
          }

          // Priority 3: If still no match, prefer non-closed applications (most likely the active one)
          if (!existing) {
            const activeMatch = companyMatches.find(app => app.status !== 'closed');
            if (activeMatch) {
              console.log(`Found active (non-closed) company match: ${activeMatch.company} - ${activeMatch.role} (status: ${activeMatch.status})`);
              existing = activeMatch;
            }
          }

          // Priority 4: Final fallback - take the first (most recent) company match
          if (!existing) {
            const fallback = companyMatches[0];
            console.log(`Fallback to most recent company match: ${fallback.company} - ${fallback.role} (status: ${fallback.status})`);
            existing = fallback;
          }
        }
      }

      const newStatus = emailTypeToStatus(parsed.type);
      const emailDate = new Date(email.date).toISOString();

      let applicationId: string | null = null;

      if (existing) {
        applicationId = existing.id;
        // Status progression: saved -> applied -> interviewing -> offer -> closed
        // Note: 'saved' is now explicitly included in the order
        const statusOrder = ['saved', 'applied', 'interviewing', 'offer', 'closed'];
        const currentIndex = statusOrder.indexOf(existing.status);
        const newIndex = statusOrder.indexOf(newStatus);

        console.log(`Status check: current="${existing.status}" (${currentIndex}) -> new="${newStatus}" (${newIndex})`);

        // Update if moving forward in the pipeline, or if closing due to rejection
        if (newIndex > currentIndex || (newStatus === 'closed' && parsed.type === 'rejection')) {
          const updateData: { status: string; close_reason?: string | null; applied_date?: string } = {
            status: newStatus,
            close_reason: parsed.type === 'rejection' ? 'rejected' : null,
          };

          // If transitioning from 'saved' to 'applied', set the applied_date
          if (existing.status === 'saved' && newStatus === 'applied') {
            updateData.applied_date = emailDate;
          }

          await supabase
            .from('applications')
            .update(updateData)
            .eq('id', existing.id);
          updatedCount++;
          console.log(`Updated ${existing.company} from "${existing.status}" to "${newStatus}"`);
        } else {
          console.log(`No status update needed for ${existing.company} (${existing.status} -> ${newStatus})`);
        }
      } else {
        const { data: insertedApp, error: insertError } = await supabase
          .from('applications')
          .insert({
            company: parsedCompany,
            role: parsedRole,
            location: parsed.location,
            status: newStatus,
            close_reason: parsed.type === 'rejection' ? 'rejected' : null,
            applied_date: emailDate,
            source_email_id: email.id,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to insert application for ${parsedCompany}:`, insertError);
          continue;
        }
        applicationId = insertedApp?.id;
        newCount++;
        console.log(`Created new application: ${parsedCompany} - ${parsedRole || 'No role'} (id: ${insertedApp?.id})`);
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
            console.error(`Failed to link email for ${parsedCompany}:`, emailLinkError);
            // Don't fail the sync, just log the error
          } else {
            console.log(`Linked email to application ${applicationId}`);
          }
        } catch (emailError) {
          console.error(`Error linking email for ${parsedCompany}:`, emailError);
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
