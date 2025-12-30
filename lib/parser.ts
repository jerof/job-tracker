import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedEmail {
  type: 'application' | 'interview' | 'rejection' | 'offer' | 'unknown';
  company: string | null;
  role: string | null;
  location: string | null;
  confidence: number;
}

export async function parseJobEmail(
  subject: string,
  from: string,
  body: string
): Promise<ParsedEmail> {
  const prompt = `You are parsing a job application email. Analyze the email and extract information.

Email From: ${from}
Email Subject: ${subject}
Email Body (first 1500 chars):
${body.slice(0, 1500)}

Determine:
1. type: What kind of email is this?
   - "application" = confirmation that an application was received/submitted
   - "interview" = interview invitation, scheduling, or confirmation
   - "rejection" = rejection or "not moving forward" message
   - "offer" = job offer
   - "unknown" = not job-related or can't determine

2. company: What company sent this? Extract from the email domain or content.

3. role: What job position/role is mentioned? (null if not clear)

4. location: Job location if mentioned (city, country, or "Remote"). null if not mentioned.

5. confidence: How confident are you? (0.0 to 1.0)

Respond with ONLY valid JSON, no other text:
{"type": "...", "company": "...", "role": "...", "location": "...", "confidence": 0.X}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0,
    });

    const text = response.choices[0]?.message?.content || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { type: 'unknown', company: null, role: null, location: null, confidence: 0 };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      type: parsed.type || 'unknown',
      company: parsed.company || null,
      role: parsed.role || null,
      location: parsed.location || null,
      confidence: parsed.confidence || 0,
    };
  } catch (error) {
    console.error('Error parsing email:', error);
    return { type: 'unknown', company: null, role: null, location: null, confidence: 0 };
  }
}

// Map email type to application status
export function emailTypeToStatus(type: ParsedEmail['type']): string {
  switch (type) {
    case 'application':
      return 'applied';
    case 'interview':
      return 'interviewing';
    case 'offer':
      return 'offer';
    case 'rejection':
      return 'closed';
    default:
      return 'applied';
  }
}
