-- Migration: Add application_emails table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS application_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  gmail_message_id VARCHAR(255) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  subject VARCHAR(500),
  snippet TEXT,
  email_date TIMESTAMP WITH TIME ZONE,
  email_type VARCHAR(50) CHECK (email_type IN ('application', 'interview', 'rejection', 'offer', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(application_id, gmail_message_id)
);

CREATE INDEX IF NOT EXISTS idx_app_emails_app_id ON application_emails(application_id);
CREATE INDEX IF NOT EXISTS idx_app_emails_date ON application_emails(email_date DESC);

-- RLS policies
ALTER TABLE application_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view emails for own applications" ON application_emails
  FOR SELECT USING (
    application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all emails" ON application_emails
  FOR ALL USING (true);
