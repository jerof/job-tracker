-- Research Chats table for storing conversation history
CREATE TABLE research_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id)
);

CREATE INDEX idx_research_chats_application ON research_chats(application_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_research_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER research_chats_updated_at
  BEFORE UPDATE ON research_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_research_chats_updated_at();
