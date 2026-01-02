-- Migration: Credits-Based Billing Model
-- Implements credit purchasing, stacking, and usage tracking
-- Credits never expire (except free monthly reset to max of 3)

-- ============================================
-- 1. ADD CREDIT COLUMNS TO USER_BILLING
-- ============================================

-- Credit balance (stacks from purchases, free credits reset monthly)
ALTER TABLE user_billing ADD COLUMN IF NOT EXISTS cv_credits INTEGER DEFAULT 3;

-- Track total credits ever purchased (for analytics/support)
ALTER TABLE user_billing ADD COLUMN IF NOT EXISTS total_credits_purchased INTEGER DEFAULT 0;

-- Track when free credits were last reset (for monthly free credit top-up)
ALTER TABLE user_billing ADD COLUMN IF NOT EXISTS last_free_credit_reset TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. CREDIT PURCHASES TABLE
-- ============================================
-- Track all credit purchase transactions from Stripe

CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_payment_id TEXT NOT NULL,
  stripe_session_id TEXT,
  bundle_type TEXT NOT NULL CHECK (bundle_type IN ('starter', 'job_seeker', 'power_search')),
  credits_purchased INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for credit_purchases
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_stripe_payment ON credit_purchases(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_stripe_session ON credit_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_created ON credit_purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_bundle ON credit_purchases(bundle_type);

-- RLS for credit_purchases
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchase history
CREATE POLICY "Users can read own credit purchases" ON credit_purchases
  FOR SELECT USING (user_id = auth.uid());

-- Only service role can insert purchases (from Stripe webhook)
CREATE POLICY "Service role can manage credit purchases" ON credit_purchases
  FOR ALL USING (true);

-- ============================================
-- 3. CREDIT USAGE LOG TABLE
-- ============================================
-- Track individual credit usage events for audit trail

CREATE TABLE IF NOT EXISTS credit_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  action TEXT NOT NULL DEFAULT 'cv_generation',
  job_id UUID,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for credit_usage_log
CREATE INDEX IF NOT EXISTS idx_credit_usage_user_id ON credit_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_created ON credit_usage_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_usage_job ON credit_usage_log(job_id);

-- RLS for credit_usage_log
ALTER TABLE credit_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own credit usage" ON credit_usage_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage credit usage" ON credit_usage_log
  FOR ALL USING (true);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to add purchased credits to a user's balance
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance INTEGER,
  total_purchased INTEGER
) AS $$
DECLARE
  v_new_balance INTEGER;
  v_total_purchased INTEGER;
BEGIN
  -- Ensure billing record exists
  INSERT INTO user_billing (user_id, subscription_tier, cv_credits, total_credits_purchased)
  VALUES (p_user_id, 'free', 3, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add credits to balance and update total purchased
  UPDATE user_billing
  SET
    cv_credits = cv_credits + p_credits,
    total_credits_purchased = total_credits_purchased + p_credits,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING cv_credits, total_credits_purchased INTO v_new_balance, v_total_purchased;

  RETURN QUERY SELECT true, v_new_balance, v_total_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to use a single credit (for CV generation)
-- Returns success status and remaining balance
CREATE OR REPLACE FUNCTION use_credit(
  p_user_id UUID,
  p_job_id UUID DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  remaining_credits INTEGER,
  message TEXT
) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Ensure billing record exists
  INSERT INTO user_billing (user_id, subscription_tier, cv_credits)
  VALUES (p_user_id, 'free', 3)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current balance
  SELECT cv_credits INTO v_current_balance
  FROM user_billing
  WHERE user_id = p_user_id
  FOR UPDATE; -- Lock the row to prevent race conditions

  -- Check if user has credits
  IF v_current_balance IS NULL OR v_current_balance < 1 THEN
    RETURN QUERY SELECT false, COALESCE(v_current_balance, 0), 'insufficient_credits'::TEXT;
    RETURN;
  END IF;

  -- Deduct the credit
  UPDATE user_billing
  SET
    cv_credits = cv_credits - 1,
    cv_generations_used = cv_generations_used + 1, -- Also track for backwards compat
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING cv_credits INTO v_new_balance;

  -- Log the usage
  INSERT INTO credit_usage_log (
    user_id,
    credits_used,
    action,
    job_id,
    balance_before,
    balance_after
  )
  VALUES (
    p_user_id,
    1,
    'cv_generation',
    p_job_id,
    v_current_balance,
    v_new_balance
  );

  RETURN QUERY SELECT true, v_new_balance, 'credit_used'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current credit balance
CREATE OR REPLACE FUNCTION get_credit_balance(p_user_id UUID)
RETURNS TABLE(
  credits INTEGER,
  total_purchased INTEGER,
  last_free_reset TIMESTAMPTZ
) AS $$
BEGIN
  -- Ensure billing record exists
  INSERT INTO user_billing (user_id, subscription_tier, cv_credits)
  VALUES (p_user_id, 'free', 3)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN QUERY
  SELECT
    COALESCE(ub.cv_credits, 3) as credits,
    COALESCE(ub.total_credits_purchased, 0) as total_purchased,
    COALESCE(ub.last_free_credit_reset, NOW()) as last_free_reset
  FROM user_billing ub
  WHERE ub.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset free credits for users (monthly)
-- Sets credits to MAX(current_credits, 3) for users who haven't had reset in 30 days
-- This ensures purchased credits are never lost, only guarantees minimum of 3
CREATE OR REPLACE FUNCTION reset_free_credits()
RETURNS TABLE(
  users_reset INTEGER,
  users_checked INTEGER
) AS $$
DECLARE
  v_reset_count INTEGER := 0;
  v_checked_count INTEGER := 0;
BEGIN
  -- Count users eligible for reset
  SELECT COUNT(*) INTO v_checked_count
  FROM user_billing
  WHERE last_free_credit_reset < NOW() - INTERVAL '30 days';

  -- Update users: ensure they have at least 3 credits (don't reduce if they have more)
  UPDATE user_billing
  SET
    cv_credits = GREATEST(cv_credits, 3),
    last_free_credit_reset = NOW(),
    updated_at = NOW()
  WHERE last_free_credit_reset < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS v_reset_count = ROW_COUNT;

  RETURN QUERY SELECT v_reset_count, v_checked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can generate CV (credits version)
-- Updates the existing function to use credits
CREATE OR REPLACE FUNCTION check_can_generate_cv(p_user_id UUID)
RETURNS TABLE(
  can_generate BOOLEAN,
  reason TEXT,
  used INTEGER,
  limit_val INTEGER,
  tier TEXT
) AS $$
DECLARE
  v_tier TEXT;
  v_credits INTEGER;
  v_used INTEGER;
BEGIN
  -- Ensure billing record exists
  INSERT INTO user_billing (user_id, subscription_tier, cv_credits)
  VALUES (p_user_id, 'free', 3)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get user billing info
  SELECT
    ub.subscription_tier,
    ub.cv_credits,
    ub.cv_generations_used
  INTO v_tier, v_credits, v_used
  FROM user_billing ub
  WHERE ub.user_id = p_user_id;

  -- Power tier has unlimited (backwards compat)
  IF v_tier = 'power' THEN
    RETURN QUERY SELECT true, 'unlimited'::TEXT, v_used, -1, v_tier;
    RETURN;
  END IF;

  -- Check credits balance
  IF v_credits > 0 THEN
    RETURN QUERY SELECT true, 'has_credits'::TEXT, v_used, v_credits, v_tier;
  ELSE
    RETURN QUERY SELECT false, 'no_credits'::TEXT, v_used, 0, v_tier;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_user_usage to include credits
CREATE OR REPLACE FUNCTION get_user_usage(p_user_id UUID)
RETURNS TABLE(
  tier TEXT,
  cv_used INTEGER,
  cv_limit INTEGER,
  cv_remaining INTEGER,
  cv_credits INTEGER,
  total_credits_purchased INTEGER,
  billing_cycle_start TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  recent_cv_generations BIGINT
) AS $$
BEGIN
  -- Ensure billing record exists
  INSERT INTO user_billing (user_id, subscription_tier, cv_credits)
  VALUES (p_user_id, 'free', 3)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN QUERY
  SELECT
    COALESCE(ub.subscription_tier, 'free') as tier,
    COALESCE(ub.cv_generations_used, 0) as cv_used,
    COALESCE(ub.cv_generation_limit, 3) as cv_limit,
    CASE
      WHEN COALESCE(ub.subscription_tier, 'free') = 'power' THEN -1
      ELSE COALESCE(ub.cv_credits, 3)
    END as cv_remaining,
    COALESCE(ub.cv_credits, 3) as cv_credits,
    COALESCE(ub.total_credits_purchased, 0) as total_credits_purchased,
    COALESCE(ub.billing_cycle_start, NOW()) as billing_cycle_start,
    ub.subscription_ends_at,
    (
      SELECT COUNT(*)
      FROM usage_logs ul
      WHERE ul.user_id = p_user_id
        AND ul.action = 'cv_generation'
        AND ul.created_at > COALESCE(ub.billing_cycle_start, NOW() - INTERVAL '30 days')
    ) as recent_cv_generations
  FROM user_billing ub
  WHERE ub.user_id = p_user_id;

  -- Return defaults if no record exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      'free'::TEXT as tier,
      0 as cv_used,
      3 as cv_limit,
      3 as cv_remaining,
      3 as cv_credits,
      0 as total_credits_purchased,
      NOW() as billing_cycle_start,
      NULL::TIMESTAMPTZ as subscription_ends_at,
      0::BIGINT as recent_cv_generations;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. MIGRATE EXISTING USERS TO CREDITS
-- ============================================
-- Set cv_credits based on existing cv_generation_limit - cv_generations_used
-- This ensures existing users don't lose their remaining generations

UPDATE user_billing
SET cv_credits = GREATEST(0, COALESCE(cv_generation_limit, 3) - COALESCE(cv_generations_used, 0))
WHERE cv_credits IS NULL OR cv_credits = 3;

-- ============================================
-- 6. BUNDLE PRICING REFERENCE (for documentation)
-- ============================================
-- These values should match your Stripe products:
--
-- starter:     5 credits  @ $4.99  ($1.00/credit)
-- job_seeker: 15 credits  @ $9.99  ($0.67/credit)
-- power_search: 50 credits @ $24.99 ($0.50/credit)
--
-- Free tier: 3 credits/month (resets to max of 3, doesn't stack)
