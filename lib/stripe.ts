import Stripe from 'stripe';

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('STRIPE_SECRET_KEY is not configured');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// Get or create a Stripe customer for a user
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  existingCustomerId?: string | null
): Promise<string | null> {
  if (!stripe) return null;

  // If user already has a Stripe customer ID, verify it exists
  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId);
      if (!customer.deleted) {
        return existingCustomerId;
      }
    } catch {
      // Customer doesn't exist, create a new one
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

// Create a checkout session
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId,
  mode,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
  mode: 'subscription' | 'payment';
}): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
    // For subscriptions, allow promotion codes
    ...(mode === 'subscription' && {
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId,
        },
      },
    }),
    // For one-time payments (Job Search Pass)
    ...(mode === 'payment' && {
      payment_intent_data: {
        metadata: {
          userId,
        },
      },
    }),
  });

  return session;
}

// Create a billing portal session
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session | null> {
  if (!stripe) return null;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Retrieve a subscription
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) return null;

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

// Cancel a subscription
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription | null> {
  if (!stripe) return null;

  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  // Cancel at period end (user keeps access until then)
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  if (!stripe) return null;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}

// Type exports
export type { Stripe };
