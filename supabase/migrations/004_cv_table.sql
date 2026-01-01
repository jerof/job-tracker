-- CV/Resume storage table
CREATE TABLE IF NOT EXISTS cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  raw_text TEXT NOT NULL,
  pdf_storage_path TEXT,
  file_name TEXT,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_cvs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cvs_updated_at
  BEFORE UPDATE ON cvs
  FOR EACH ROW
  EXECUTE FUNCTION update_cvs_updated_at();
