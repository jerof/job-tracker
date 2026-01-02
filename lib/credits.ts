/**
 * Credits management for credit-bundle billing model
 * Simple pay-as-you-go credits without subscription complexity
 */

import { createServerClient } from './supabase';

// Credit bundle types
export type CreditBundle = 'starter' | 'job_seeker' | 'power_search';

// Credit balance info
export interface CreditBalance {
  credits: number;
  totalPurchased: number;
  lastFreeReset: string;
}

// Credit purchase record
export interface CreditPurchase {
  id: string;
  bundleType: CreditBundle;
  creditsPurchased: number;
  amountCents: number;
  createdAt: string;
}

// Bundle configuration
export const CREDIT_BUNDLES: Record<
  CreditBundle,
  {
    credits: number;
    priceCents: number;
    priceDisplay: string;
    savings?: string;
  }
> = {
  starter: { credits: 10, priceCents: 900, priceDisplay: '$9' },
  job_seeker: { credits: 30, priceCents: 1900, priceDisplay: '$19', savings: '30% off' },
  power_search: { credits: 100, priceCents: 3900, priceDisplay: '$39', savings: '57% off' },
};

// Free credits given on reset (monthly)
const FREE_CREDITS_AMOUNT = 3;

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(userId: string): Promise<CreditBalance> {
  const supabase = createServerClient();
  if (!supabase) {
    console.error('Supabase not configured');
    return { credits: 0, totalPurchased: 0, lastFreeReset: '' };
  }

  // Try to get existing credit record
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    console.error('Error fetching credit balance:', error);
    return { credits: 0, totalPurchased: 0, lastFreeReset: '' };
  }

  // If no record exists, create one with free credits
  if (!data) {
    const now = new Date().toISOString();
    const { data: newData, error: insertError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits: FREE_CREDITS_AMOUNT,
        total_purchased: 0,
        last_free_reset: now,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating credit record:', insertError);
      return { credits: 0, totalPurchased: 0, lastFreeReset: '' };
    }

    return {
      credits: newData.credits,
      totalPurchased: newData.total_purchased,
      lastFreeReset: newData.last_free_reset,
    };
  }

  return {
    credits: data.credits,
    totalPurchased: data.total_purchased,
    lastFreeReset: data.last_free_reset,
  };
}

/**
 * Check if user has at least one credit available
 */
export async function canUseCredit(userId: string): Promise<boolean> {
  const balance = await getCreditBalance(userId);
  return balance.credits > 0;
}

/**
 * Use one credit (atomic operation)
 * Returns success status and remaining credits
 */
export async function useCredit(
  userId: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; remaining: number }> {
  const supabase = createServerClient();
  if (!supabase) {
    return { success: false, remaining: 0 };
  }

  // Get current balance first
  const balance = await getCreditBalance(userId);
  if (balance.credits <= 0) {
    return { success: false, remaining: 0 };
  }

  // Atomic decrement using update with check
  const { data, error } = await supabase
    .from('user_credits')
    .update({ credits: balance.credits - 1 })
    .eq('user_id', userId)
    .gte('credits', 1) // Only update if credits >= 1
    .select('credits')
    .single();

  if (error || !data) {
    console.error('Error using credit:', error);
    return { success: false, remaining: balance.credits };
  }

  // Log the usage
  await supabase.from('credit_usage_logs').insert({
    user_id: userId,
    credits_used: 1,
    metadata: metadata || {},
  });

  return { success: true, remaining: data.credits };
}

/**
 * Add credits from a purchased bundle
 */
export async function addCredits(
  userId: string,
  bundle: CreditBundle,
  stripePaymentId: string,
  stripeSessionId?: string
): Promise<boolean> {
  const supabase = createServerClient();
  if (!supabase) {
    return false;
  }

  const bundleConfig = CREDIT_BUNDLES[bundle];
  if (!bundleConfig) {
    console.error('Invalid bundle type:', bundle);
    return false;
  }

  // Check for duplicate payment (idempotency)
  const { data: existing } = await supabase
    .from('credit_purchases')
    .select('id')
    .eq('stripe_payment_id', stripePaymentId)
    .single();

  if (existing) {
    console.warn('Duplicate payment detected:', stripePaymentId);
    return true; // Already processed, return success
  }

  // Get current balance
  const balance = await getCreditBalance(userId);

  // Add credits atomically
  const { error: updateError } = await supabase
    .from('user_credits')
    .update({
      credits: balance.credits + bundleConfig.credits,
      total_purchased: balance.totalPurchased + bundleConfig.credits,
    })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error adding credits:', updateError);
    return false;
  }

  // Record the purchase
  const { error: purchaseError } = await supabase.from('credit_purchases').insert({
    user_id: userId,
    bundle_type: bundle,
    credits_purchased: bundleConfig.credits,
    amount_cents: bundleConfig.priceCents,
    stripe_payment_id: stripePaymentId,
    stripe_session_id: stripeSessionId || null,
  });

  if (purchaseError) {
    console.error('Error recording purchase:', purchaseError);
    // Credits were added, just failed to log - don't fail the whole operation
  }

  return true;
}

/**
 * Get user's purchase history
 */
export async function getPurchaseHistory(
  userId: string,
  limit: number = 10
): Promise<CreditPurchase[]> {
  const supabase = createServerClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('credit_purchases')
    .select('id, bundle_type, credits_purchased, amount_cents, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching purchase history:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    bundleType: row.bundle_type as CreditBundle,
    creditsPurchased: row.credits_purchased,
    amountCents: row.amount_cents,
    createdAt: row.created_at,
  }));
}

/**
 * Check if user is eligible for free credit reset (monthly)
 * If eligible, reset their free credits
 */
export async function checkAndResetFreeCredits(userId: string): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) {
    return;
  }

  const balance = await getCreditBalance(userId);
  if (!balance.lastFreeReset) {
    return;
  }

  const lastReset = new Date(balance.lastFreeReset);
  const now = new Date();

  // Check if a month has passed since last reset
  const monthsSinceReset =
    (now.getFullYear() - lastReset.getFullYear()) * 12 +
    (now.getMonth() - lastReset.getMonth());

  if (monthsSinceReset < 1) {
    return; // Not yet eligible for reset
  }

  // Reset free credits (add them, don't replace existing)
  const { error } = await supabase
    .from('user_credits')
    .update({
      credits: balance.credits + FREE_CREDITS_AMOUNT,
      last_free_reset: now.toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error resetting free credits:', error);
    return;
  }

  // Log the reset
  await supabase.from('credit_usage_logs').insert({
    user_id: userId,
    credits_used: -FREE_CREDITS_AMOUNT, // Negative = credits added
    metadata: { type: 'monthly_free_reset' },
  });
}
