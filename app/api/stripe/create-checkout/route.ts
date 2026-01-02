import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import {
  stripe,
  getOrCreateCustomer,
  createCheckoutSession,
  isStripeConfigured,
} from '@/lib/stripe';
import { STRIPE_PRICES, isValidPriceId } from '@/lib/stripe-prices';

interface CheckoutRequest {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    );
  }

  try {
    // Parse request body
    const body: CheckoutRequest = await request.json();
    const { priceId, successUrl, cancelUrl } = body;

    // Validate priceId
    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

    // Validate that priceId is one of our valid bundle prices
    if (!isValidPriceId(priceId)) {
      return NextResponse.json(
        { error: 'Invalid priceId' },
        { status: 400 }
      );
    }

    // Get the Supabase client
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
    let userEmail: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
      userEmail = user?.email || null;
    }

    // For development/testing, allow a demo user
    if (!userId && process.env.NODE_ENV === 'development') {
      userId = 'demo-user-id';
      userEmail = 'demo@example.com';
    }

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Get or create Stripe customer
    const { data: billingData } = await supabase
      .from('user_billing')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    const customerId = await getOrCreateCustomer(
      userId,
      userEmail,
      billingData?.stripe_customer_id
    );

    if (!customerId) {
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Save customer ID to user_billing if new
    if (!billingData?.stripe_customer_id) {
      await supabase
        .from('user_billing')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
        }, {
          onConflict: 'user_id',
        });
    }

    // Determine base URL for redirect
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const defaultSuccessUrl = `${origin}/settings/billing?success=true`;
    const defaultCancelUrl = `${origin}/settings/billing?canceled=true`;

    // Create checkout session - always 'payment' mode for credit purchases
    const session = await createCheckoutSession({
      customerId,
      priceId,
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
      userId,
      mode: 'payment',
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    // Return the checkout URL
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
