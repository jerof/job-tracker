import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@/lib/supabase';
import { searchWithPerplexity } from '@/lib/perplexity';
import { ChatMessage, Source, ResearchChatRequest } from '@/lib/research-chat.types';

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

const SYSTEM_PROMPT = `You are an expert company analyst helping a job candidate prepare for an interview.

You have access to:
- The job posting details (if provided)
- Web search results about the company
- Previous conversation context

Your goal is to help them understand the company like a consultant would - deeply and practically.

Guidelines:
- Be specific and cite information when possible
- Focus on actionable insights they can use in interviews
- Highlight things that might come up in interview questions
- After your response, suggest 3-4 follow-up questions they should explore

Format your response in clear, scannable sections. Be conversational but substantive.

IMPORTANT: At the end of your response, on a new line, output exactly this format:
SUGGESTED_FOLLOWUPS:["question 1","question 2","question 3"]

These should be natural follow-up questions based on what you just discussed.`;

/**
 * Fetch job posting content from URL
 */
async function fetchJobPosting(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!response.ok) return null;

    const html = await response.text();
    const contentParts: string[] = [];

    // Extract meta description
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    if (metaDesc?.[1]) contentParts.push(`Description: ${metaDesc[1]}`);

    // Extract JSON-LD
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
        try {
          const data = JSON.parse(jsonContent);
          if (data['@type'] === 'JobPosting' || data.description) {
            contentParts.push(`Job Details: ${JSON.stringify(data)}`);
          }
        } catch { /* ignore */ }
      }
    }

    // Extract body text
    const bodyText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (bodyText.length > 200) {
      contentParts.push(`Content: ${bodyText.slice(0, 3000)}`);
    }

    return contentParts.length > 0 ? contentParts.join('\n\n') : null;
  } catch {
    return null;
  }
}

/**
 * POST /api/research/chat
 * Send a message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    const body: ResearchChatRequest = await request.json();
    const { applicationId, message, context } = body;

    if (!applicationId || !message || !context?.company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Load existing chat history
    const { data: chatData } = await supabase
      .from('research_chats')
      .select('messages')
      .eq('application_id', applicationId)
      .single();

    const existingMessages: ChatMessage[] = chatData?.messages || [];

    // Fetch job posting content if URL provided and first message
    let jobPostingContent: string | null = null;
    if (context.jobUrl && existingMessages.length === 0) {
      jobPostingContent = await fetchJobPosting(context.jobUrl);
    }

    // Search with Perplexity for web context
    const searchResult = await searchWithPerplexity(message, context.company);

    // Build context for Claude
    let contextInfo = '';
    if (context.role) {
      contextInfo += `Role: ${context.role}\n`;
    }
    if (jobPostingContent) {
      contextInfo += `\nJob Posting:\n${jobPostingContent.slice(0, 2000)}\n`;
    }
    if (searchResult?.content) {
      contextInfo += `\nWeb Search Results:\n${searchResult.content}\n`;
    }

    // Build conversation history for Claude
    const claudeMessages = existingMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Add current user message
    claudeMessages.push({
      role: 'user' as const,
      content: message,
    });

    // Call Claude
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `${SYSTEM_PROMPT}\n\nCompany: ${context.company}\n${contextInfo}`,
      messages: claudeMessages,
    });

    const fullResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse response and extract suggested followups
    let content = fullResponse;
    let suggestedFollowups: string[] = [];

    const followupsMatch = fullResponse.match(/SUGGESTED_FOLLOWUPS:\s*(\[[\s\S]*?\])/);
    if (followupsMatch) {
      content = fullResponse.replace(/SUGGESTED_FOLLOWUPS:\s*\[[\s\S]*?\]/, '').trim();
      try {
        suggestedFollowups = JSON.parse(followupsMatch[1]);
      } catch { /* ignore parse errors */ }
    }

    // Build sources from Perplexity citations
    const sources: Source[] = (searchResult?.citations || []).map((url, i) => ({
      title: `Source ${i + 1}`,
      url,
    }));

    // Create new messages
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      sources,
      suggestedFollowups,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...existingMessages, userMessage, assistantMessage];

    // Save to database
    await supabase
      .from('research_chats')
      .upsert({
        application_id: applicationId,
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'application_id',
      });

    return NextResponse.json({
      id: assistantMessage.id,
      content: assistantMessage.content,
      sources: assistantMessage.sources,
      suggestedFollowups: assistantMessage.suggestedFollowups,
    });

  } catch (error) {
    console.error('Research chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
