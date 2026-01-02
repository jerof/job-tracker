'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Can I use Job Tracker for free?',
    answer: 'Yes! Our free plan includes unlimited job tracking and 3 tailored CVs per month, forever. No credit card required to get started.',
  },
  {
    question: 'What happens when I hit my CV limit?',
    answer: 'You\'ll see an upgrade prompt. Your existing CVs remain accessible, you just can\'t generate new ones until next month (or upgrade). We never delete your work.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, cancel with one click from your billing settings. You\'ll keep access until the end of your billing period with no questions asked.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 14-day money-back guarantee, no questions asked. If Job Tracker isn\'t right for you, just reach out and we\'ll refund your payment.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'All major credit cards, Apple Pay, Google Pay, and bank transfers in supported countries. Payments are securely processed through Stripe.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'We use Stripe for payments, which is PCI Level 1 compliant (the highest level of certification). We never see or store your card details.',
  },
  {
    question: 'Can I switch plans?',
    answer: 'Yes! You can upgrade or downgrade at any time. When upgrading, you\'ll get immediate access to new features. When downgrading, changes take effect at your next billing cycle.',
  },
  {
    question: 'Is there a discount for annual billing?',
    answer: 'Yes! Annual billing saves you up to 36% compared to monthly. Pro is $69/year (vs $108 monthly) and Power is $149/year (vs $228 monthly).',
  },
];

function FAQAccordion({ item, isOpen, onToggle }: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-neutral-800 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-base font-medium text-neutral-200 group-hover:text-white transition-colors pr-4">
          {item.question}
        </span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 text-neutral-500 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-neutral-400 leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 md:p-8">
        {faqItems.map((item, index) => (
          <FAQAccordion
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-8 text-center">
        <p className="text-neutral-400 mb-4">
          Still have questions?
        </p>
        <a
          href="mailto:support@jobtracker.com"
          className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact our team
        </a>
      </div>
    </motion.div>
  );
}
