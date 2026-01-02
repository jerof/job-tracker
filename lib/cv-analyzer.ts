import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type GapType = 'achievements' | 'skills' | 'target' | 'recent' | 'education' | 'project';
export type CVQuality = 'good' | 'thin' | 'none';

export interface Question {
  id: string;
  text: string;
  placeholder: string;
  gapType: GapType;
  required: boolean;
}

export interface CVAnalysisResult {
  questions: Question[];
  cvQuality: CVQuality;
}

const CV_ANALYSIS_PROMPT = `Analyze this CV and identify 3-4 gaps that would improve job applications.

CV:
{cvText}

Return JSON with questions to fill gaps:
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Question text",
      "placeholder": "Example answer",
      "gapType": "achievements|skills|target|recent|education|project",
      "required": false
    }
  ],
  "cvQuality": "good|thin|none"
}

Gap Types and Questions:
- achievements: No metrics/achievements -> "What's a measurable achievement from your most recent role?"
- skills: Missing skills section -> "What are your top 5 professional skills?"
- target: No target role clear -> "What type of role are you looking for?"
- recent: Old experience only -> "What have you been doing recently?"
- education: No education -> "What's your educational background?"
- project: Generic descriptions -> "Can you describe a specific project you led?"

CV Quality Assessment:
- "good": CV has clear structure, multiple roles, some achievements, reasonable length
- "thin": CV is sparse, missing key sections, or lacks detail
- "none": No CV provided or just a few words

Rules:
- Only ask about genuine gaps (don't ask about skills if they're listed)
- Max 4 questions for existing CVs
- Make questions specific to their industry/experience when possible
- Always include target role question if unclear
- Set required: true only for critical gaps
- Output ONLY valid JSON, no other text`;

const NO_CV_QUESTIONS: Question[] = [
  {
    id: 'job_title',
    text: "What's your current or most recent job title?",
    placeholder: 'e.g., Software Engineer, Marketing Manager',
    gapType: 'recent',
    required: true,
  },
  {
    id: 'company_duration',
    text: 'What company and how long have you worked there?',
    placeholder: 'e.g., Google, 3 years',
    gapType: 'recent',
    required: true,
  },
  {
    id: 'responsibilities',
    text: 'Describe your main responsibilities in 2-3 bullets',
    placeholder: 'e.g., Led team of 5, Managed $1M budget, Built customer-facing features',
    gapType: 'recent',
    required: true,
  },
  {
    id: 'achievement',
    text: "What's an achievement you're proud of?",
    placeholder: 'e.g., Increased sales by 40%, Reduced costs by $500K',
    gapType: 'achievements',
    required: false,
  },
  {
    id: 'skills',
    text: 'What are your top skills?',
    placeholder: 'e.g., Python, Leadership, Data Analysis, Communication',
    gapType: 'skills',
    required: true,
  },
  {
    id: 'education',
    text: "What's your educational background?",
    placeholder: 'e.g., BS Computer Science from MIT, MBA from Stanford',
    gapType: 'education',
    required: false,
  },
  {
    id: 'target_role',
    text: 'What role are you targeting?',
    placeholder: 'e.g., Senior Product Manager, Staff Engineer',
    gapType: 'target',
    required: true,
  },
];

/**
 * Analyze a CV and generate questions to fill gaps
 * Uses Claude Haiku for fast, cheap analysis
 */
export async function analyzeCV(cvText: string): Promise<CVAnalysisResult> {
  // Handle empty or minimal CV input
  const trimmedCV = cvText.trim();

  if (!trimmedCV || trimmedCV.length < 50) {
    return {
      questions: NO_CV_QUESTIONS,
      cvQuality: 'none',
    };
  }

  try {
    const prompt = CV_ANALYSIS_PROMPT.replace('{cvText}', trimmedCV.slice(0, 10000));

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    let result: CVAnalysisResult;
    try {
      // Clean up potential markdown code blocks
      let jsonText = content.text.trim();
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }

      result = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse CV analysis response:', content.text);
      // Return fallback questions
      return {
        questions: [
          {
            id: 'achievements',
            text: "What's a measurable achievement from your most recent role?",
            placeholder: 'e.g., Increased revenue by 30%, Reduced costs by 20%',
            gapType: 'achievements',
            required: false,
          },
          {
            id: 'target_role',
            text: 'What type of role are you looking for?',
            placeholder: 'e.g., Senior Software Engineer, Product Manager',
            gapType: 'target',
            required: false,
          },
        ],
        cvQuality: 'thin',
      };
    }

    // Validate and sanitize the result
    if (!result.questions || !Array.isArray(result.questions)) {
      result.questions = [];
    }

    // Ensure max 4 questions
    result.questions = result.questions.slice(0, 4);

    // Validate cvQuality
    if (!['good', 'thin', 'none'].includes(result.cvQuality)) {
      result.cvQuality = 'thin';
    }

    return result;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error during CV analysis:', error.message);
      throw new Error(`Failed to analyze CV: ${error.message}`);
    }
    throw error;
  }
}
