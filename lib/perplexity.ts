// Perplexity API client for web search

export interface PerplexitySearchResult {
  content: string;
  citations: string[];
}

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  citations?: string[];
}

export async function searchWithPerplexity(query: string, company: string): Promise<PerplexitySearchResult | null> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    console.warn('Perplexity API key not configured');
    return null;
  }

  try {
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a research assistant. Provide concise, factual information with citations. Focus on business information, recent news, and company analysis.'
      },
      {
        role: 'user',
        content: `Research about ${company}: ${query}`
      }
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        max_tokens: 1000,
        temperature: 0.2,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status, await response.text());
      return null;
    }

    const data: PerplexityResponse = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      citations: data.citations || [],
    };
  } catch (error) {
    console.error('Perplexity search error:', error);
    return null;
  }
}
