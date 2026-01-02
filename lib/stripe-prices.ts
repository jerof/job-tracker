// Credit bundle price IDs from environment
export const STRIPE_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || '',
  job_seeker: process.env.STRIPE_PRICE_JOB_SEEKER || '',
  power_search: process.env.STRIPE_PRICE_POWER_SEARCH || '',
} as const;

export type CreditBundle = keyof typeof STRIPE_PRICES;

// Bundle metadata for display and processing
export const BUNDLE_CONFIG: Record<
  CreditBundle,
  {
    credits: number;
    priceCents: number;
    priceDisplay: string;
    savings?: string;
    description: string;
  }
> = {
  starter: {
    credits: 10,
    priceCents: 900,
    priceDisplay: '$9',
    description: 'Perfect for testing the waters',
  },
  job_seeker: {
    credits: 30,
    priceCents: 1900,
    priceDisplay: '$19',
    savings: '30% off',
    description: 'Active 2-3 month job search',
  },
  power_search: {
    credits: 100,
    priceCents: 3900,
    priceDisplay: '$39',
    savings: '57% off',
    description: 'Aggressive job hunting',
  },
};

// Helper functions

/**
 * Get the bundle type from a Stripe price ID
 */
export function getBundleFromPriceId(priceId: string): CreditBundle | null {
  for (const [bundle, id] of Object.entries(STRIPE_PRICES)) {
    if (id === priceId) {
      return bundle as CreditBundle;
    }
  }
  return null;
}

/**
 * Get the number of credits for a bundle
 */
export function getCreditsForBundle(bundle: CreditBundle): number {
  return BUNDLE_CONFIG[bundle].credits;
}

/**
 * Check if a price ID is valid (exists in our configuration)
 */
export function isValidPriceId(priceId: string): boolean {
  return getBundleFromPriceId(priceId) !== null;
}

// Publishable key for client-side
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
