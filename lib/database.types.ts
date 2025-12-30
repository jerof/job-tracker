// Database types matching Supabase schema

export interface DbApplication {
  id: string;
  user_id: string;
  company: string;
  role: string | null;
  location: string | null;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'closed';
  close_reason: 'rejected' | 'withdrawn' | 'ghosted' | 'accepted' | null;
  applied_date: string | null;
  source_email_id: string | null;
  job_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEmailSyncLog {
  id: string;
  user_id: string;
  email_id: string;
  processed_at: string;
  result: 'processed' | 'skipped' | 'error';
}

export interface DbGmailTokens {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  created_at: string;
  updated_at: string;
}

// Convert database row to frontend Application type
export function dbToApplication(row: DbApplication) {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    location: row.location,
    status: row.status,
    closeReason: row.close_reason,
    appliedDate: row.applied_date,
    sourceEmailId: row.source_email_id,
    jobUrl: row.job_url,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert frontend Application to database insert/update
export function applicationToDb(app: {
  company: string;
  role?: string | null;
  status?: string;
  closeReason?: string | null;
  appliedDate?: string | null;
  jobUrl?: string | null;
  notes?: string | null;
}) {
  return {
    company: app.company,
    role: app.role || null,
    status: app.status || 'applied',
    close_reason: app.closeReason || null,
    applied_date: app.appliedDate || null,
    job_url: app.jobUrl || null,
    notes: app.notes || null,
  };
}
