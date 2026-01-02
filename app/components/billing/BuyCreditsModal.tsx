'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody } from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';
import { BUNDLE_CONFIG, STRIPE_PRICES, CreditBundle } from '@/lib/stripe-prices';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
}

const BUNDLE_ORDER: CreditBundle[] = ['starter', 'job_seeker', 'power_search'];

const BUNDLE_DISPLAY_NAMES: Record<CreditBundle, string> = {
  starter: 'Starter',
  job_seeker: 'Job Seeker',
  power_search: 'Power Search',
};

export function BuyCreditsModal({ isOpen, onClose, currentCredits }: BuyCreditsModalProps) {
  const [loadingBundle, setLoadingBundle] = useState<CreditBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (bundle: CreditBundle) => {
    const priceId = STRIPE_PRICES[bundle];

    if (!priceId) {
      setError('Payment not configured. Please try again later.');
      return;
    }

    setLoadingBundle(bundle);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingBundle(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" data-testid="buy-credits-modal">
      <ModalHeader>
        <ModalTitle>Buy Credits</ModalTitle>
        <ModalDescription>
          Choose a credit bundle to power your job search.
          {currentCredits !== undefined && (
            <span className="block mt-1">
              Current balance: <strong>{currentCredits} credits</strong>
            </span>
          )}
        </ModalDescription>
      </ModalHeader>

      <ModalBody className="max-h-[70vh]">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BUNDLE_ORDER.map((bundle) => {
            const config = BUNDLE_CONFIG[bundle];
            const isPopular = bundle === 'job_seeker';
            const isLoading = loadingBundle === bundle;

            return (
              <div
                key={bundle}
                data-testid={`bundle-${bundle}`}
                className={`
                  relative flex flex-col p-5 rounded-xl border-2 transition-all duration-200
                  ${isPopular
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                      POPULAR
                    </span>
                  </div>
                )}

                {/* Bundle Name */}
                <h3 className={`
                  text-lg font-semibold text-center mb-1
                  ${isPopular ? 'text-blue-700 dark:text-blue-300 mt-2' : 'text-gray-900 dark:text-gray-100'}
                `}>
                  {BUNDLE_DISPLAY_NAMES[bundle]}
                </h3>

                {/* Credits */}
                <p className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {config.credits} <span className="text-base font-normal text-gray-500 dark:text-gray-400">credits</span>
                </p>

                {/* Price */}
                <p className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {config.priceDisplay}
                </p>

                {/* Savings Badge */}
                {config.savings && (
                  <div className="flex justify-center mb-3">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                      {config.savings}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4 flex-grow">
                  {config.description}
                </p>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePurchase(bundle)}
                  isLoading={isLoading}
                  disabled={loadingBundle !== null}
                  variant={isPopular ? 'primary' : 'secondary'}
                  fullWidth
                >
                  Buy Now
                </Button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
          Secure payment via Stripe. Credits never expire.
        </p>
      </ModalBody>
    </Modal>
  );
}
