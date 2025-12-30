import { NextRequest, NextResponse } from 'next/server';

// Extract job info from URL metadata
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobTracker/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to fetch URL',
        company: extractCompanyFromDomain(parsedUrl.hostname),
      }, { status: 200 }); // Still return partial data
    }

    const html = await response.text();

    // Extract metadata from HTML
    const metadata = extractMetadata(html, parsedUrl.hostname);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('URL extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract URL info' }, { status: 500 });
  }
}

function extractMetadata(html: string, hostname: string) {
  const result: {
    company: string | null;
    role: string | null;
    location: string | null;
    description: string | null;
  } = {
    company: null,
    role: null,
    location: null,
    description: null,
  };

  // Extract OpenGraph tags
  const ogTitle = extractMeta(html, 'og:title');
  const ogDescription = extractMeta(html, 'og:description');
  const ogSiteName = extractMeta(html, 'og:site_name');

  // Extract standard meta tags
  const title = extractTitle(html);
  const description = extractMeta(html, 'description');

  // Try to extract company name
  result.company = ogSiteName || extractCompanyFromDomain(hostname) || extractCompanyFromTitle(title);

  // Try to extract role from title
  result.role = extractRoleFromTitle(ogTitle || title);

  // Try to extract location from description
  result.location = extractLocation(ogDescription || description || '');

  // Store description for notes
  result.description = ogDescription || description || null;

  return result;
}

function extractMeta(html: string, name: string): string | null {
  // Match both property="og:..." and name="..." patterns
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${name}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return decodeHtmlEntities(match[1]);
    }
  }
  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? decodeHtmlEntities(match[1].trim()) : null;
}

function extractCompanyFromDomain(hostname: string): string | null {
  // Remove common prefixes/suffixes
  let domain = hostname
    .replace(/^(www\.|careers\.|jobs\.|apply\.|hire\.|recruiting\.)/, '')
    .replace(/\.(com|org|net|io|co|careers|jobs|workable|lever|greenhouse|ashbyhq|smartrecruiters|bamboohr|workday|icims|taleo|successfactors|myworkdayjobs|hibob).*$/, '');

  if (!domain) return null;

  // Capitalize first letter
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

function extractCompanyFromTitle(title: string | null): string | null {
  if (!title) return null;

  // Common patterns: "Role at Company", "Role - Company", "Company | Role"
  const patterns = [
    / at ([A-Z][A-Za-z0-9\s&]+?)(?:\s*[-|]|$)/,
    / - ([A-Z][A-Za-z0-9\s&]+?)(?:\s*[-|]|$)/,
    /^([A-Z][A-Za-z0-9\s&]+?) \| /,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

function extractRoleFromTitle(title: string | null): string | null {
  if (!title) return null;

  // Remove company name and common suffixes
  let role = title
    .replace(/ at .+$/, '')
    .replace(/ - .+$/, '')
    .replace(/ \| .+$/, '')
    .replace(/\s*\([^)]+\)\s*$/, '')
    .replace(/\s*[-–—]\s*.*$/, '')
    .trim();

  // Don't return if it's too short or looks like a company name only
  if (role.length < 3 || role.length > 100) return null;

  return role;
}

function extractLocation(text: string): string | null {
  if (!text) return null;

  // Common location patterns
  const patterns = [
    /\b(Remote|Hybrid|On-?site)\b/i,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})\b/, // City, ST
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+)\b/, // City, Country
    /\bLocation:\s*([^.|\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}
