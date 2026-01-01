/**
 * Skills Matcher AI Feature Types
 * Analyzes job descriptions against user's CV to identify matches and gaps
 */

export interface SkillsMatchResult {
  matchedSkills: string[];
  skillGaps: string[];
  talkingPoints: string[];
  matchScore: number;
  generatedAt: string;
}

export interface SkillsMatchRequest {
  applicationId: string;
}

export interface SkillsMatchError {
  error: string;
  code?: 'NO_CV' | 'NO_JOB_DESCRIPTION' | 'AI_ERROR' | 'SERVER_ERROR';
}
