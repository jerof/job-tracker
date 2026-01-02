/**
 * Billing utilities for subscription management and usage tracking
 */

import { createServerClient } from './supabase';

// Subscription tiers
export type SubscriptionTier = 'free' | 'pro' | 'power';

// Tier limits configuration
export const TIER_LIMITS: Record<SubscriptionTier, { cvLimit: number; displayName: string }> = {
  free: { cvLimit: 3, displayName: 'Free' },
  pro: { cvLimit: 30, displayName: 'Pro' },
  power: { cvLimit: -1, displayName: 'Power' }, // -1 = unlimited
};

// Billing info type
export interface UserBillingInfo {
  userId: string;
  tier: SubscriptionTier;
  cvUsed: number;
  cvLimit: number;
  cvRemaining: number;
  billingCycleStart: string;
  subscriptionEndsAt: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

// CV generation check result
export interface CanGenerateCVResult {
  canGenerate: boolean;
  reason: 'within_limit' | 'unlimited' | 'limit_reached' | 'error';
  used: number;
  limit: number;
  tier: SubscriptionTier;
}

/**
 * Get user's billing info including subscription tier and usage
 */
export async function getUserBillingInfo(userId: string): Promise<UserBillingInfo | null> {
  const supabase = createServerClient();
  if (!supabase) {
    console.error('Supabase not configured');
    return null;
  }

  // Try to get existing billing record
  const { data, error } = await supabase
    .from('user_billing')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    console.error('Error fetching billing info:', error);
    return null;
  }

  // If no record exists, create default free tier
  if (!data) {
    const { data: newData, error: insertError } = await supabase
      .from('user_billing')
      .insert({
        user_id: userId,
        subscription_tier: 'free',
        cv_generation_limit: 3,
        cv_generations_used: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating billing record:', insertError);
      return null;
    }

    return formatBillingInfo(newData);
  }

  return formatBillingInfo(data);
}

/**
 * Format database row to billing info
 */
function formatBillingInfo(data: Record<string, unknown>): UserBillingInfo {
  const tier = (data.subscription_tier as SubscriptionTier) || 'free';
  const cvUsed = (data.cv_generations_used as number) || 0;
  const cvLimit = (data.cv_generation_limit as number) || 3;
  const isUnlimited = tier === 'power';

  return {
    userId: data.user_id as string,
    tier,
    cvUsed,
    cvLimit: isUnlimited ? -1 : cvLimit,
    cvRemaining: isUnlimited ? -1 : Math.max(0, cvLimit - cvUsed),
    billingCycleStart: data.billing_cycle_start as string,
    subscriptionEndsAt: (data.subscription_ends_at as string) || null,
    stripeCustomerId: (data.stripe_customer_id as string) || null,
    stripeSubscriptionId: (data.stripe_subscription_id as string) || null,
  };
}

/**
 * Check if user can generate a CV (has credits remaining)
 */
export async function canGenerateCV(userId: string): Promise<CanGenerateCVResult> {
  const supabase = createServerClient();
  if (!supabase) {
    return {
      canGenerate: false,
      reason: 'error',
      used: 0,
      limit: 0,
      tier: 'free',
    };
  }

  // Use the database function for atomic check
  const { data, error } = await supabase.rpc('check_can_generate_cv', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error checking CV generation:', error);
    return {
      canGenerate: false,
      reason: 'error',
      used: 0,
      limit: 0,
      tier: 'free',
    };
  }

  const result = data?.[0];
  if (!result) {
    return {
      canGenerate: false,
      reason: 'error',
      used: 0,
      limit: 0,
      tier: 'free',
    };
  }

  return {
    canGenerate: result.can_generate,
    reason: result.reason as CanGenerateCVResult['reason'],
    used: result.used,
    limit: result.limit_val,
    tier: result.tier as SubscriptionTier,
  };
}

/**
 * Record a CV generation and decrement available credits
 * Returns success status and new count
 */
export async function recordCVGeneration(
  userId: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; used: number; limit: number }> {
  const supabase = createServerClient();
  if (!supabase) {
    return { success: false, used: 0, limit: 0 };
  }

  // Use atomic increment function
  const { data, error } = await supabase.rpc('increment_cv_usage', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error recording CV generation:', error);
    return { success: false, used: 0, limit: 0 };
  }

  const result = data?.[0];
  if (!result?.success) {
    return {
      success: false,
      used: result?.new_count || 0,
      limit: result?.limit_val || 0,
    };
  }

  // Log the usage event
  await supabase.from('usage_logs').insert({
    user_id: userId,
    action: 'cv_generation',
    metadata: metadata || {},
  });

  return {
    success: true,
    used: result.new_count,
    limit: result.limit_val,
  };
}

/**
 * Upgrade user to a new subscription tier
 * Called after successful Stripe checkout
 */
export async function upgradeTier(
  userId: string,
  tier: SubscriptionTier,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
  subscriptionEndsAt?: Date
): Promise<boolean> {
  const supabase = createServerClient();
  if (!supabase) {
    return false;
  }

  const limit = TIER_LIMITS[tier].cvLimit;

  const { error } = await supabase
    .from('user_billing')
    .upsert({
      user_id: userId,
      subscription_tier: tier,
      cv_generation_limit: limit === -1 ? 999999 : limit, // Store large number for unlimited
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_ends_at: subscriptionEndsAt?.toISOString(),
      billing_cycle_start: new Date().toISOString(),
      cv_generations_used: 0, // Reset on upgrade
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error upgrading tier:', error);
    return false;
  }

  // Log the billing event
  await supabase.from('billing_events').insert({
    user_id: userId,
    event_type: 'subscription_upgraded',
    metadata: {
      tier,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
    },
  });

  return true;
}

/**
 * Downgrade user to free tier (on subscription cancellation)
 */
export async function downgradeTier(userId: string): Promise<boolean> {
  const supabase = createServerClient();
  if (!supabase) {
    return false;
  }

  const { error } = await supabase
    .from('user_billing')
    .update({
      subscription_tier: 'free',
      cv_generation_limit: TIER_LIMITS.free.cvLimit,
      stripe_subscription_id: null,
      subscription_ends_at: null,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error downgrading tier:', error);
    return false;
  }

  // Log the billing event
  await supabase.from('billing_events').insert({
    user_id: userId,
    event_type: 'subscription_cancelled',
    metadata: {},
  });

  return true;
}

/**
 * Reset monthly usage for all users (called by cron)
 */
export async function resetMonthlyUsage(): Promise<number> {
  const supabase = createServerClient();
  if (!supabase) {
    return 0;
  }

  const { data, error } = await supabase.rpc('reset_monthly_usage');

  if (error) {
    console.error('Error resetting monthly usage:', error);
    return 0;
  }

  return data || 0;
}

/**
 * Record a Stripe billing event
 */
export async function recordBillingEvent(
  userId: string,
  eventType: string,
  stripeEventId: string,
  amountCents?: number,
  currency?: string,
  metadata?: Record<string, unknown>
): Promise<boolean> {
  const supabase = createServerClient();
  if (!supabase) {
    return false;
  }

  const { error } = await supabase.from('billing_events').insert({
    user_id: userId,
    event_type: eventType,
    stripe_event_id: stripeEventId,
    amount_cents: amountCents,
    currency: currency || 'usd',
    metadata: metadata || {},
  });

  if (error) {
    console.error('Error recording billing event:', error);
    return false;
  }

  return true;
}

/**
 * Get user's billing events history
 */
export async function getBillingHistory(
  userId: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  eventType: string;
  amountCents: number | null;
  currency: string;
  createdAt: string;
}>> {
  const supabase = createServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('billing_events')
    .select('id, event_type, amount_cents, currency, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching billing history:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    eventType: row.event_type,
    amountCents: row.amount_cents,
    currency: row.currency,
    createdAt: row.created_at,
  }));
}

/**
 * Find user by Stripe customer ID (for webhook handling)
 */
export async function findUserByStripeCustomerId(
  stripeCustomerId: string
): Promise<string | null> {
  const supabase = createServerClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_billing')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (error) {
    console.error('Error finding user by Stripe customer ID:', error);
    return null;
  }

  return data?.user_id || null;
}
