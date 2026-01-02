import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { constructWebhookEvent, stripe, Stripe } from '@/lib/stripe';
import { addCredits } from '@/lib/credits';
import { getBundleFromPriceId } from '@/lib/stripe-prices';

// Disable body parsing - we need raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Get raw body for signature verification
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No stripe-signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  // Verify webhook signature
  const event = constructWebhookEvent(body, signature);
  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Get Supabase client
  const supabase = createServerClient();
  if (!supabase) {
    console.error('Supabase not configured');
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    // Only handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
    } else {
      console.log(`Ignoring event type: ${event.type}`);
    }

    // Log all events for audit trail
    await logBillingEvent(event, supabase);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Return 200 to prevent Stripe retries - errors should be monitored via logs
    return NextResponse.json({ received: true, error: 'Handler error' });
  }
}

/**
 * Handle successful checkout - add credits to user
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: NonNullable<ReturnType<typeof createServerClient>>
) {
  // Get user ID from metadata
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  // Get line items to find price ID
  const lineItems = await stripe?.checkout.sessions.listLineItems(session.id);
  const priceId = lineItems?.data[0]?.price?.id;

  if (!priceId) {
    console.error('No price ID found in checkout session');
    return;
  }

  // Look up bundle from price ID
  const bundleType = getBundleFromPriceId(priceId);
  if (!bundleType) {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Get payment intent ID for idempotency
  const paymentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || session.id;

  // Add credits to user
  const success = await addCredits(userId, bundleType, paymentId, session.id);

  if (success) {
    console.log(`Added ${bundleType} credits to user ${userId}`);
  } else {
    console.error(`Failed to add credits for user ${userId}`);
  }
}

/**
 * Log billing event for audit trail
 */
async function logBillingEvent(
  event: Stripe.Event,
  supabase: NonNullable<ReturnType<typeof createServerClient>>
) {
  const eventData = event.data.object as {
    metadata?: Record<string, string>;
    amount_total?: number;
  };

  const userId = eventData.metadata?.userId || null;
  const amountCents = eventData.amount_total || null;

  await supabase.from('billing_events').insert({
    user_id: userId,
    event_type: event.type,
    stripe_event_id: event.id,
    amount_cents: amountCents,
    currency: 'usd',
    metadata: {
      stripeEventType: event.type,
      livemode: event.livemode,
    },
  });
}
