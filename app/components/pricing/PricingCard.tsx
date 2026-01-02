'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  isAnnual: boolean;
  features: PricingFeature[];
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
  badge?: string;
}

export function PricingCard({
  name,
  description,
  monthlyPrice,
  annualPrice,
  isAnnual,
  features,
  popular = false,
  ctaText,
  ctaHref,
  badge,
}: PricingCardProps) {
  const currentPrice = isAnnual ? annualPrice : monthlyPrice;
  const monthlyEquivalent = isAnnual ? Math.round(annualPrice / 12) : monthlyPrice;
  const savings = isAnnual && monthlyPrice > 0
    ? Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`
        relative flex flex-col p-8 rounded-2xl transition-all duration-300
        ${popular
          ? 'bg-gradient-to-b from-neutral-800 to-neutral-900 border-2 border-primary-500/50 shadow-xl shadow-primary-500/10 scale-105 z-10'
          : 'bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700'
        }
      `}
    >
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      {/* Glow effect for popular card */}
      {popular && (
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary-500/20 to-transparent pointer-events-none" />
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-500/20 text-primary-400 rounded">
              {badge}
            </span>
          )}
        </div>
        <p className="text-neutral-400 text-sm">{description}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">
            ${monthlyPrice === 0 ? '0' : monthlyEquivalent}
          </span>
          <span className="text-neutral-500">/month</span>
        </div>

        {isAnnual && monthlyPrice > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-neutral-500">
              ${annualPrice}/year
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-success-500/20 text-success-400 rounded">
              Save {savings}%
            </span>
          </div>
        )}

        {monthlyPrice === 0 && (
          <p className="mt-2 text-sm text-neutral-500">Free forever</p>
        )}
      </div>

      {/* CTA Button */}
      <a
        href={ctaHref}
        className={`
          w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200
          ${popular
            ? 'bg-white text-neutral-900 hover:bg-neutral-100 shadow-lg'
            : 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700'
          }
        `}
      >
        {ctaText}
      </a>

      {/* Features */}
      <div className="mt-8 pt-6 border-t border-neutral-800">
        <p className="text-sm font-semibold text-neutral-300 mb-4">What&apos;s included:</p>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <svg
                  className="w-5 h-5 text-success-500 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span
                className={`text-sm ${
                  feature.included ? 'text-neutral-300' : 'text-neutral-600'
                }`}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
