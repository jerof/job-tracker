// Types for company and role research

export interface FundingInfo {
  stage: string | null;
  totalRaised: string | null;
}

export interface NewsItem {
  title: string;
  date: string;
  summary: string;
}

export interface CompanyResearch {
  name: string;
  domain: string | null;
  logo: string | null;
  description: string;
  founded: string | null;
  headquarters: string | null;
  employeeCount: string | null;
  funding: FundingInfo | null;
  culture: string[];
  recentNews: NewsItem[];
  competitors: string[];
}

export interface RoleResearch {
  title: string;
  typicalResponsibilities: string[];
  requiredSkills: string[];
  interviewQuestions: string[];
  questionsToAsk: string[];
  salaryRange: string | null;
}

export interface ResearchResponse {
  company: CompanyResearch;
  role: RoleResearch;
  generatedAt: string;
}

export interface ResearchRequest {
  company: string;
  role: string;
  jobUrl?: string;
  applicationId?: string;  // To fetch email context for grounded research
}

// Database types for company_research table
export interface DbCompanyResearch {
  id: string;
  company: string;
  role: string | null;
  domain: string | null;
  research_data: ResearchResponse;
  created_at: string;
  updated_at: string;
}
