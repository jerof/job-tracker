import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail';

// GET /api/auth/gmail - Redirect to Google OAuth
export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Gmail auth error:', error);
    return NextResponse.json(
      { error: 'Gmail authentication not configured' },
      { status: 500 }
    );
  }
}
