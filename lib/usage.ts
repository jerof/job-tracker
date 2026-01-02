/**
 * Usage tracking utilities for analytics and monitoring
 */

import { createServerClient } from './supabase';

// Supported usage actions
export type UsageAction =
  | 'cv_generation'
  | 'cv_download'
  | 'research_chat'
  | 'cover_letter'
  | 'interview_prep'
  | 'gmail_sync'
  | 'application_created'
  | 'application_updated';

// Usage log entry
export interface UsageLogEntry {
  id: string;
  userId: string;
  action: UsageAction;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Usage stats summary
export interface UsageStats {
  totalActions: number;
  byAction: Record<string, number>;
  startDate: string;
  endDate: string;
}

/**
 * Log a usage event
 */
export async function logUsage(
  userId: string,
  action: UsageAction,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  const supabase = createServerClient();
  if (!supabase) {
    console.error('Supabase not configured');
    return false;
  }

  const { error } = await supabase.from('usage_logs').insert({
    user_id: userId,
    action,
    metadata: metadata || {},
  });

  if (error) {
    console.error('Error logging usage:', error);
    return false;
  }

  return true;
}

/**
 * Get usage stats for a user within a date range
 */
export async function getUsageStats(
  userId: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<UsageStats> {
  const supabase = createServerClient();
  if (!supabase) {
    return {
      totalActions: 0,
      byAction: {},
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('usage_logs')
    .select('action')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error) {
    console.error('Error fetching usage stats:', error);
    return {
      totalActions: 0,
      byAction: {},
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  // Aggregate by action type
  const byAction: Record<string, number> = {};
  for (const row of data || []) {
    byAction[row.action] = (byAction[row.action] || 0) + 1;
  }

  return {
    totalActions: data?.length || 0,
    byAction,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

/**
 * Get recent usage logs for a user
 */
export async function getRecentUsage(
  userId: string,
  limit: number = 20
): Promise<UsageLogEntry[]> {
  const supabase = createServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent usage:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    action: row.action as UsageAction,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  }));
}

/**
 * Get usage count for a specific action in date range
 */
export async function getActionCount(
  userId: string,
  action: UsageAction,
  startDate?: Date
): Promise<number> {
  const supabase = createServerClient();
  if (!supabase) {
    return 0;
  }

  let query = supabase
    .from('usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action);

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting action:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get CV generation count for current billing cycle
 */
export async function getCVGenerationCount(userId: string): Promise<number> {
  const supabase = createServerClient();
  if (!supabase) {
    return 0;
  }

  // First get the billing cycle start
  const { data: billingData } = await supabase
    .from('user_billing')
    .select('billing_cycle_start')
    .eq('user_id', userId)
    .single();

  const cycleStart = billingData?.billing_cycle_start
    ? new Date(billingData.billing_cycle_start)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago

  return getActionCount(userId, 'cv_generation', cycleStart);
}

/**
 * Get daily usage breakdown for charts
 */
export async function getDailyUsage(
  userId: string,
  days: number = 30
): Promise<Array<{ date: string; count: number }>> {
  const supabase = createServerClient();
  if (!supabase) {
    return [];
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('usage_logs')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching daily usage:', error);
    return [];
  }

  // Group by date
  const dailyCounts: Record<string, number> = {};
  for (const row of data || []) {
    const date = row.created_at.split('T')[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  }

  // Convert to array and fill in missing dates
  const result: Array<{ date: string; count: number }> = [];
  const current = new Date(startDate);
  const today = new Date();

  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: dailyCounts[dateStr] || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Check if user has used a feature before (for onboarding)
 */
export async function hasUsedFeature(
  userId: string,
  action: UsageAction
): Promise<boolean> {
  const count = await getActionCount(userId, action);
  return count > 0;
}

/**
 * Get usage summary for dashboard display
 */
export async function getUsageSummary(userId: string): Promise<{
  cvGenerations: number;
  researchChats: number;
  applicationsCreated: number;
  lastActivity: string | null;
}> {
  const supabase = createServerClient();
  if (!supabase) {
    return {
      cvGenerations: 0,
      researchChats: 0,
      applicationsCreated: 0,
      lastActivity: null,
    };
  }

  // Get all-time stats
  const { data, error } = await supabase
    .from('usage_logs')
    .select('action, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching usage summary:', error);
    return {
      cvGenerations: 0,
      researchChats: 0,
      applicationsCreated: 0,
      lastActivity: null,
    };
  }

  const logs = data || [];
  const lastActivity = logs[0]?.created_at || null;

  return {
    cvGenerations: logs.filter((l) => l.action === 'cv_generation').length,
    researchChats: logs.filter((l) => l.action === 'research_chat').length,
    applicationsCreated: logs.filter((l) => l.action === 'application_created').length,
    lastActivity,
  };
}
