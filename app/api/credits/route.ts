import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getCreditBalance, checkAndResetFreeCredits, CreditBalance } from '@/lib/credits';

// GET /api/credits - Get user's credit balance
// Response: { credits: number, totalPurchased: number, lastFreeReset: string }
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get user from auth header or cookie
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // For development/testing, allow a demo user
    if (!userId && process.env.NODE_ENV === 'development') {
      userId = 'demo-user-id';
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Check and reset free credits if eligible (monthly reset)
    await checkAndResetFreeCredits(userId);

    // Get credit balance
    const balance: CreditBalance = await getCreditBalance(userId);

    return NextResponse.json({
      credits: balance.credits,
      totalPurchased: balance.totalPurchased,
      lastFreeReset: balance.lastFreeReset,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
