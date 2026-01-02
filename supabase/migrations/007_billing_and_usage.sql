-- Migration: Billing and Usage Tracking System
-- Implements subscription tiers, usage tracking, and billing events

-- ============================================
-- 1. USER BILLING TABLE
-- ============================================
-- Separate table for billing info (cleaner than extending auth.users)
CREATE TABLE IF NOT EXISTS user_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'power')),
  cv_generations_used INTEGER DEFAULT 0,
  cv_generation_limit INTEGER DEFAULT 3,
  billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_user_billing_user_id ON user_billing(user_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_stripe_customer ON user_billing(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_cycle_start ON user_billing(billing_cycle_start);

-- RLS for user_billing
ALTER TABLE user_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own billing info" ON user_billing
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all billing" ON user_billing
  FOR ALL USING (true);

-- Updated_at trigger for user_billing
CREATE OR REPLACE FUNCTION update_user_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_billing_updated_at
  BEFORE UPDATE ON user_billing
  FOR EACH ROW
  EXECUTE FUNCTION update_user_billing_updated_at();

-- ============================================
-- 2. BILLING EVENTS TABLE
-- ============================================
-- Track all Stripe events for audit and debugging
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for billing_events
CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_id ON billing_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created ON billing_events(created_at DESC);

-- RLS for billing_events
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own billing events
CREATE POLICY "Users can read own billing events" ON billing_events
  FOR SELECT USING (user_id = auth.uid());

-- Only service role can write billing events (from webhook)
CREATE POLICY "Service role can manage billing events" ON billing_events
  FOR ALL USING (true);

-- ============================================
-- 3. USAGE LOGS TABLE
-- ============================================
-- Track all usage events (CV generations, research chats, etc.)
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'cv_generation', 'research_chat', 'cover_letter', etc.
  metadata JSONB, -- Additional context (job_id, company, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Composite index for efficient user + date queries
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);

-- RLS for usage_logs
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage logs" ON usage_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage usage logs" ON usage_logs
  FOR ALL USING (true);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to get tier limits
CREATE OR REPLACE FUNCTION get_tier_cv_limit(tier TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE tier
    WHEN 'free' THEN RETURN 3;
    WHEN 'pro' THEN RETURN 30;
    WHEN 'power' THEN RETURN -1; -- unlimited
    ELSE RETURN 3;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user can generate CV
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
  v_used INTEGER;
  v_limit INTEGER;
  v_cycle_start TIMESTAMPTZ;
BEGIN
  -- Get user billing info
  SELECT
    ub.subscription_tier,
    ub.cv_generations_used,
    ub.cv_generation_limit,
    ub.billing_cycle_start
  INTO v_tier, v_used, v_limit, v_cycle_start
  FROM user_billing ub
  WHERE ub.user_id = p_user_id;

  -- If no billing record, create default free tier
  IF v_tier IS NULL THEN
    INSERT INTO user_billing (user_id, subscription_tier, cv_generation_limit)
    VALUES (p_user_id, 'free', 3)
    ON CONFLICT (user_id) DO NOTHING;

    v_tier := 'free';
    v_used := 0;
    v_limit := 3;
  END IF;

  -- Power tier has unlimited
  IF v_tier = 'power' THEN
    RETURN QUERY SELECT true, 'unlimited'::TEXT, v_used, -1, v_tier;
    RETURN;
  END IF;

  -- Check if within limit
  IF v_used < v_limit THEN
    RETURN QUERY SELECT true, 'within_limit'::TEXT, v_used, v_limit, v_tier;
  ELSE
    RETURN QUERY SELECT false, 'limit_reached'::TEXT, v_used, v_limit, v_tier;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user usage stats
CREATE OR REPLACE FUNCTION get_user_usage(p_user_id UUID)
RETURNS TABLE(
  tier TEXT,
  cv_used INTEGER,
  cv_limit INTEGER,
  cv_remaining INTEGER,
  billing_cycle_start TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  recent_cv_generations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ub.subscription_tier, 'free') as tier,
    COALESCE(ub.cv_generations_used, 0) as cv_used,
    COALESCE(ub.cv_generation_limit, 3) as cv_limit,
    CASE
      WHEN COALESCE(ub.subscription_tier, 'free') = 'power' THEN -1
      ELSE GREATEST(0, COALESCE(ub.cv_generation_limit, 3) - COALESCE(ub.cv_generations_used, 0))
    END as cv_remaining,
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
      NOW() as billing_cycle_start,
      NULL::TIMESTAMPTZ as subscription_ends_at,
      0::BIGINT as recent_cv_generations;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage for all users
-- Called by cron job at start of each billing cycle
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Reset usage for users whose billing cycle has passed (30 days)
  UPDATE user_billing
  SET
    cv_generations_used = 0,
    billing_cycle_start = NOW(),
    updated_at = NOW()
  WHERE billing_cycle_start < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment CV usage
CREATE OR REPLACE FUNCTION increment_cv_usage(p_user_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  new_count INTEGER,
  limit_val INTEGER
) AS $$
DECLARE
  v_new_count INTEGER;
  v_limit INTEGER;
  v_tier TEXT;
BEGIN
  -- Ensure billing record exists
  INSERT INTO user_billing (user_id, subscription_tier, cv_generation_limit)
  VALUES (p_user_id, 'free', 3)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current state
  SELECT subscription_tier, cv_generation_limit
  INTO v_tier, v_limit
  FROM user_billing
  WHERE user_id = p_user_id;

  -- Power tier: just increment, no limit
  IF v_tier = 'power' THEN
    UPDATE user_billing
    SET cv_generations_used = cv_generations_used + 1
    WHERE user_id = p_user_id
    RETURNING cv_generations_used INTO v_new_count;

    RETURN QUERY SELECT true, v_new_count, -1;
    RETURN;
  END IF;

  -- Check limit and increment
  UPDATE user_billing
  SET cv_generations_used = cv_generations_used + 1
  WHERE user_id = p_user_id
    AND cv_generations_used < cv_generation_limit
  RETURNING cv_generations_used INTO v_new_count;

  IF v_new_count IS NOT NULL THEN
    RETURN QUERY SELECT true, v_new_count, v_limit;
  ELSE
    -- Get current count for error message
    SELECT cv_generations_used INTO v_new_count
    FROM user_billing WHERE user_id = p_user_id;

    RETURN QUERY SELECT false, v_new_count, v_limit;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. AUTO-CREATE BILLING RECORD ON USER SIGNUP
-- ============================================
-- This trigger creates a billing record when a new user signs up
-- Note: Adjust based on your auth setup - this assumes users table exists

-- CREATE OR REPLACE FUNCTION create_billing_on_signup()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO user_billing (user_id, subscription_tier, cv_generation_limit)
--   VALUES (NEW.id, 'free', 3);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uncomment if you have a users table:
-- CREATE TRIGGER on_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION create_billing_on_signup();
