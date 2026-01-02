import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { useCredit, canUseCredit } from '@/lib/credits';

interface UseCreditsRequest {
  metadata?: {
    jobId?: string;
    company?: string;
    [key: string]: unknown;
  };
}

// POST /api/credits/use - Use 1 credit
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get user from auth header
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

    // Check if user has credits available
    const hasCredits = await canUseCredit(userId);
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'No credits available. Please purchase more credits.' },
        { status: 402 }
      );
    }

    // Parse request body for metadata
    let metadata: UseCreditsRequest['metadata'] = undefined;
    try {
      const body: UseCreditsRequest = await request.json();
      metadata = body.metadata;
    } catch {
      // Body is optional, ignore parse errors
    }

    // Use one credit
    const result = await useCredit(userId, metadata);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to use credit. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      remaining: result.remaining,
    });
  } catch (error) {
    console.error('Error using credit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
