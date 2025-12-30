-- Migration: Add "saved" status and job_url field
-- Run this in Supabase SQL Editor

-- 1. Add job_url column
ALTER TABLE applications ADD COLUMN IF NOT EXISTS job_url TEXT;

-- 2. Update status check constraint to include 'saved'
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('saved', 'applied', 'interviewing', 'offer', 'closed'));

-- 3. Make applied_date nullable (not needed for saved jobs)
ALTER TABLE applications ALTER COLUMN applied_date DROP NOT NULL;
ALTER TABLE applications ALTER COLUMN applied_date DROP DEFAULT;
