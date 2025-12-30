-- Job Tracker Database Schema
-- Run this in Supabase SQL Editor

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'interviewing', 'offer', 'closed')),
  close_reason VARCHAR(50) CHECK (close_reason IN ('rejected', 'withdrawn', 'ghosted', 'accepted', NULL)),
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_email_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate applications to same company/role per user
  UNIQUE(user_id, company, role)
);

-- Migration: Add location column to existing table
-- Run this if you already have the table:
-- ALTER TABLE applications ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Email sync log to track processed emails
CREATE TABLE email_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id VARCHAR(255) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result VARCHAR(50) CHECK (result IN ('processed', 'skipped', 'error')),

  UNIQUE(user_id, email_id)
);

-- Gmail tokens storage (encrypted)
CREATE TABLE gmail_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_applications_user_status ON applications(user_id, status);
CREATE INDEX idx_applications_user_date ON applications(user_id, applied_date DESC);
CREATE INDEX idx_sync_log_user ON email_sync_log(user_id);

-- Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gmail_tokens ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications" ON applications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sync log" ON email_sync_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync log" ON email_sync_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own gmail tokens" ON gmail_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own gmail tokens" ON gmail_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_tokens_updated_at
  BEFORE UPDATE ON gmail_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
