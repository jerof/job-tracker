import Anthropic from '@anthropic-ai/sdk';

// Lazy-initialize Anthropic client to avoid build-time errors
let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

export interface CVEnhanceInput {
  cvText: string;
  answers: Record<string, string>;
}

export interface CVEnhanceResult {
  masterCV: string;
  tokensUsed: number;
}

const CV_ENHANCEMENT_PROMPT = `Enhance this CV by incorporating the additional information provided.

Original CV:
{cvText}

Additional Information:
{answers}

Create an enhanced master CV that:
1. Integrates all new information naturally into appropriate sections
2. Maintains professional formatting with clear sections (Experience, Skills, Education, etc.)
3. Quantifies achievements where possible (use numbers/metrics from the answers)
4. Keeps total length reasonable (1-2 pages worth of content)
5. NEVER invents information not provided - only use what's given
6. Uses strong action verbs (Led, Built, Increased, Managed, etc.)
7. Formats experience as: Title at Company (Date Range) followed by bullet points
8. Lists skills in a clear, scannable format

If starting from scratch (minimal or no original CV), structure the CV as:
1. Name and Contact (placeholder: [Your Name], [Email], [Phone])
2. Professional Summary (2-3 sentences based on target role)
3. Experience (from the answers provided)
4. Skills (from the answers provided)
5. Education (from the answers provided)

Output the enhanced CV as plain text with clear section headers.
Do not include any explanatory text - just the CV content.`;

const FROM_SCRATCH_PROMPT = `Create a professional CV from the following information:

{answers}

Structure the CV as:

[YOUR NAME]
[Email] | [Phone] | [LinkedIn]

PROFESSIONAL SUMMARY
[2-3 sentences positioning them for their target role]

EXPERIENCE
[Job Title] at [Company]
[Date Range if provided, otherwise use "Present"]
- [Responsibility/Achievement 1]
- [Responsibility/Achievement 2]
- [Responsibility/Achievement 3]

SKILLS
[List skills in categories if possible]

EDUCATION
[Degree/School if provided]

Rules:
1. ONLY use information from the answers - never invent details
2. Use strong action verbs for bullet points
3. Quantify achievements when numbers are provided
4. Keep it professional and concise
5. If information is missing, use placeholders like [Your Name] or omit the section

Output ONLY the CV text, no explanations.`;

/**
 * Enhance an existing CV by merging in additional information
 * Uses Claude Sonnet for better quality output
 */
export async function enhanceCV(input: CVEnhanceInput): Promise<CVEnhanceResult> {
  const { cvText, answers } = input;

  // Format answers for the prompt
  const formattedAnswers = Object.entries(answers)
    .filter(([, value]) => value && value.trim().length > 0)
    .map(([key, value]) => `${formatQuestionKey(key)}: ${value}`)
    .join('\n');

  if (!formattedAnswers) {
    // No additional info provided, just clean up the CV
    if (!cvText || cvText.trim().length < 50) {
      throw new Error('No CV text or answers provided');
    }
    return {
      masterCV: cvText.trim(),
      tokensUsed: 0,
    };
  }

  // Determine which prompt to use
  const isFromScratch = !cvText || cvText.trim().length < 100;
  let prompt: string;

  if (isFromScratch) {
    prompt = FROM_SCRATCH_PROMPT.replace('{answers}', formattedAnswers);
  } else {
    prompt = CV_ENHANCEMENT_PROMPT
      .replace('{cvText}', cvText.trim().slice(0, 8000))
      .replace('{answers}', formattedAnswers);
  }

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
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

    let masterCV = content.text.trim();

    // Clean up any markdown code blocks if present
    const codeBlockMatch = masterCV.match(/```(?:\w+)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      masterCV = codeBlockMatch[1].trim();
    }

    return {
      masterCV,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Claude API error during CV enhancement:', error.message);
      throw new Error(`Failed to enhance CV: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Format question key to readable text
 */
function formatQuestionKey(key: string): string {
  const keyMap: Record<string, string> = {
    job_title: 'Current/Recent Job Title',
    company_duration: 'Company and Duration',
    responsibilities: 'Main Responsibilities',
    achievement: 'Key Achievement',
    achievements: 'Key Achievements',
    skills: 'Top Skills',
    education: 'Education',
    target_role: 'Target Role',
    recent: 'Recent Activity',
    project: 'Notable Project',
  };

  return keyMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
