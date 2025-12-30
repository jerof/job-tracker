import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export function createGmailClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Broader search queries for job-related emails (English + French)
const JOB_QUERIES = [
  // English - confirmation emails
  'subject:(application OR applied OR applying)',
  'subject:("thank you for applying" OR "thanks for applying")',
  'subject:("thank you for your application" OR "thank you for your interest")',
  // French - confirmation emails
  'subject:(candidature OR postuler OR postulé)',
  'subject:("candidature bien reçue" OR "candidature reçue")',
  'subject:("merci pour votre candidature" OR "merci de votre intérêt")',
  // English - interview/process
  'subject:(interview OR screening OR recruiter)',
  'subject:(unfortunately OR regret OR rejected)',
  'subject:(offer OR congratulations OR excited to)',
  'subject:(your application OR job application)',
  'subject:(book a slot OR schedule OR calendly OR availability)',
  'subject:(next steps OR moving forward OR phone call OR video call)',
  // Recruiter outreach patterns
  'subject:("let\'s talk" OR "let\'s chat" OR "let\'s connect")',
  'subject:("quick call" OR "quick chat" OR "intro call")',
  'subject:("would love to chat" OR "love to connect")',
  // French - interview/process
  'subject:(entretien OR recruteur)',
  'subject:(malheureusement OR regret)',
  'subject:(offre OR félicitations)',
  // ATS platforms
  'from:(greenhouse OR lever OR workday OR icims OR jobvite OR ashby OR welcomekit OR smartrecruiters)',
];

export async function fetchJobEmails(
  accessToken: string,
  refreshToken: string,
  afterDate?: Date
) {
  const gmail = createGmailClient(accessToken, refreshToken);
  const emails: Array<{
    id: string;
    subject: string;
    from: string;
    date: string;
    snippet: string;
    body: string;
  }> = [];

  // Search last 90 days by default
  // Gmail uses YYYY/MM/DD format for after: operator
  const formatGmailDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const dateFilter = afterDate
    ? ` after:${formatGmailDate(afterDate)}`
    : ' newer_than:90d';

  console.log('Starting Gmail fetch with queries:', JOB_QUERIES.length);

  for (const query of JOB_QUERIES) {
    try {
      console.log(`Searching: ${query}${dateFilter}`);

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query + dateFilter,
        maxResults: 30,
      });

      const messages = response.data.messages || [];
      console.log(`Found ${messages.length} messages for query`);

      for (const msg of messages) {
        if (emails.some((e) => e.id === msg.id)) continue;

        try {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          });

          const headers = fullMessage.data.payload?.headers || [];
          const subject = headers.find((h) => h.name === 'Subject')?.value || '';
          const from = headers.find((h) => h.name === 'From')?.value || '';
          const date = headers.find((h) => h.name === 'Date')?.value || '';

          let body = '';
          const payload = fullMessage.data.payload;
          if (payload?.body?.data) {
            body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
          } else if (payload?.parts) {
            const textPart = payload.parts.find((p) => p.mimeType === 'text/plain');
            if (textPart?.body?.data) {
              body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
            }
          }

          emails.push({
            id: msg.id!,
            subject,
            from,
            date,
            snippet: fullMessage.data.snippet || '',
            body: body.slice(0, 2000),
          });
        } catch (err) {
          console.error(`Error fetching message ${msg.id}:`, err);
        }
      }
    } catch (error) {
      console.error(`Error fetching emails for query "${query}":`, error);
    }
  }

  console.log(`Total unique emails found: ${emails.length}`);
  return emails;
}
