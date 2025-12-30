import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createGmailClient } from '@/lib/gmail';

interface EmailContent {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  htmlBody: string | null;
  gmailUrl: string;
}

// Helper to convert HTML to plain text
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// GET /api/emails/[messageId] - Fetch full email content from Gmail API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { messageId } = await params;

    // Get stored Gmail tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('gmail_tokens')
      .select('*')
      .single();

    if (tokenError) {
      console.error('Token fetch error:', tokenError);
      return NextResponse.json(
        { error: 'Gmail not connected', needsAuth: true },
        { status: 401 }
      );
    }

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Gmail not connected', needsAuth: true },
        { status: 401 }
      );
    }

    // Create Gmail client with stored tokens
    const gmail = createGmailClient(tokenData.access_token, tokenData.refresh_token);

    // Get the user's email address for correct Gmail URL
    let userEmail = '';
    try {
      const profile = await gmail.users.getProfile({ userId: 'me' });
      userEmail = profile.data.emailAddress || '';
    } catch (profileError) {
      console.error('Could not fetch user profile:', profileError);
    }

    // Fetch the full message from Gmail
    let fullMessage;
    try {
      fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });
    } catch (gmailError: unknown) {
      console.error('Gmail API error:', gmailError);

      // Check for specific Gmail API errors
      const error = gmailError as { code?: number; message?: string };
      if (error.code === 404) {
        return NextResponse.json(
          { error: 'Message not found in Gmail' },
          { status: 404 }
        );
      }
      if (error.code === 401) {
        return NextResponse.json(
          { error: 'Gmail authentication expired', needsAuth: true },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch email from Gmail', details: error.message },
        { status: 500 }
      );
    }

    // Extract headers
    const headers = fullMessage.data.payload?.headers || [];
    const subject = headers.find((h) => h.name === 'Subject')?.value || '(No subject)';
    const from = headers.find((h) => h.name === 'From')?.value || '';
    const date = headers.find((h) => h.name === 'Date')?.value || '';
    const rfc822MessageId = headers.find((h) => h.name === 'Message-ID' || h.name === 'Message-Id')?.value || '';

    // Extract body content
    let textBody = '';
    let htmlBody: string | null = null;
    const payload = fullMessage.data.payload;

    if (payload?.body?.data) {
      // Simple message with body directly in payload
      textBody = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload?.parts) {
      // Multipart message - extract both text and HTML parts
      const extractParts = (parts: typeof payload.parts): void => {
        if (!parts) return;

        for (const part of parts) {
          if (part.mimeType === 'text/plain' && part.body?.data && !textBody) {
            textBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part.mimeType === 'text/html' && part.body?.data && !htmlBody) {
            htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part.parts) {
            // Handle nested multipart
            extractParts(part.parts);
          }
        }
      };

      extractParts(payload.parts);
    }

    // If we only have HTML and no plain text, convert HTML to basic text
    const body = textBody || (htmlBody ? htmlToText(htmlBody) : '');

    // Generate Gmail URL using RFC822 Message-ID for reliable search
    // Remove angle brackets from Message-ID: <abc123@mail.gmail.com> -> abc123@mail.gmail.com
    const cleanMessageId = rfc822MessageId.replace(/^<|>$/g, '');
    // Include authuser param to open correct account
    const authParam = userEmail ? `?authuser=${encodeURIComponent(userEmail)}` : '';
    const gmailUrl = cleanMessageId
      ? `https://mail.google.com/mail/${authParam}#search/rfc822msgid:${encodeURIComponent(cleanMessageId)}`
      : `https://mail.google.com/mail/${authParam}#inbox/${messageId}`;

    const email: EmailContent = {
      id: messageId,
      from,
      subject,
      date,
      body,
      htmlBody,
      gmailUrl,
    };

    return NextResponse.json({ email });
  } catch (error) {
    console.error('Error fetching email content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
