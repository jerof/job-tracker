import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/gmail';
import { createServerClient } from '@/lib/supabase';

// GET /api/auth/gmail/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Missing tokens in response');
    }

    // Store tokens in Supabase
    const supabase = createServerClient();
    if (supabase) {
      // For now, store with a placeholder user_id (we'll add proper auth later)
      const { error: dbError } = await supabase
        .from('gmail_tokens')
        .upsert({
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date || Date.now() + 3600000,
        }, {
          onConflict: 'user_id'
        });

      if (dbError) {
        console.error('Error storing tokens:', dbError);
      }
    }

    // Redirect back to app with success
    return NextResponse.redirect(new URL('/?gmail=connected', request.url));
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.redirect(new URL('/?error=token_exchange', request.url));
  }
}
