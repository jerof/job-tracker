import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createBillingPortalSession, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  try {
    // Get Supabase client
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // For development/testing, allow demo user
    if (!userId && process.env.NODE_ENV === 'development') {
      userId = 'demo-user-id';
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID from user_billing
    const { data: billingData, error: billingError } = await supabase
      .from('user_billing')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (billingError || !billingData) {
      return NextResponse.json(
        { error: 'Billing record not found' },
        { status: 404 }
      );
    }

    if (!billingData.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // Parse request body for return URL
    let returnUrl: string;
    try {
      const body = await request.json();
      returnUrl = body.returnUrl;
    } catch {
      // No body or invalid JSON, use default
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      returnUrl = `${origin}/settings/billing`;
    }

    // Ensure return URL is valid
    if (!returnUrl) {
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      returnUrl = `${origin}/settings/billing`;
    }

    // Create billing portal session
    const session = await createBillingPortalSession(
      billingData.stripe_customer_id,
      returnUrl
    );

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create portal session' },
        { status: 500 }
      );
    }

    // Return the portal URL
    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
