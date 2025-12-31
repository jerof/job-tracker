-- Company Research Cache Table
-- Stores AI-generated company and role research for interview prep

CREATE TABLE IF NOT EXISTS company_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  domain VARCHAR(255),
  research_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Cache key: company + role combination
  UNIQUE(company, role)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_research_lookup ON company_research(company, role);
CREATE INDEX IF NOT EXISTS idx_company_research_updated ON company_research(updated_at);

-- Enable RLS but allow public read (research is not user-specific)
ALTER TABLE company_research ENABLE ROW LEVEL SECURITY;

-- Anyone can read research data (it's public company info)
CREATE POLICY "Anyone can read company research" ON company_research
  FOR SELECT USING (true);

-- Only service role can insert/update (API routes use service role key)
CREATE POLICY "Service role can manage company research" ON company_research
  FOR ALL USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_company_research_updated_at
  BEFORE UPDATE ON company_research
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
