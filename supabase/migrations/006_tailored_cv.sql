-- Add tailored CV fields to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tailored_cv_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tailored_cv_filename TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS tailored_cv_generated_at TIMESTAMPTZ;

-- Create storage bucket for tailored CVs (run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tailored-cvs', 'tailored-cvs', true);
