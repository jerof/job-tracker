'use client';

import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

// Credit bundle pricing
const pricingTiers = [
  {
    name: 'Free',
    description: 'Try the magic before you commit.',
    price: 0,
    priceLabel: 'forever',
    cvCredits: '3 CVs/month',
    ctaText: 'Get Started Free',
    ctaHref: '/cv-input',
    features: [
      { text: 'Unlimited job tracking', included: true },
      { text: '1 Master CV', included: true },
      { text: '3 tailored CVs per month', included: true },
      { text: 'Basic company info', included: true },
      { text: 'Gmail sync', included: false },
      { text: 'AI research chat', included: false },
    ],
  },
  {
    name: 'Starter',
    description: 'For a focused job search.',
    price: 9,
    priceLabel: 'one-time',
    cvCredits: '10 CVs',
    popular: true,
    ctaText: 'Buy Starter Pack',
    ctaHref: '/signup?plan=starter',
    features: [
      { text: 'Everything in Free, plus:', included: true },
      { text: '10 tailored CV credits', included: true },
      { text: 'Credits never expire', included: true },
      { text: 'Gmail auto-sync', included: true },
      { text: 'AI research chat', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    name: 'Job Seeker',
    description: 'For active job hunters.',
    price: 19,
    priceLabel: 'one-time',
    cvCredits: '30 CVs',
    badge: 'Best Value',
    ctaText: 'Buy Job Seeker Pack',
    ctaHref: '/signup?plan=jobseeker',
    features: [
      { text: 'Everything in Starter, plus:', included: true },
      { text: '30 tailored CV credits', included: true },
      { text: 'Credits never expire', included: true },
      { text: 'Cover letter generation', included: true },
      { text: 'Interview prep AI', included: true },
      { text: 'Export all data', included: true },
    ],
  },
  {
    name: 'Power Search',
    description: 'For aggressive job seekers.',
    price: 39,
    priceLabel: 'one-time',
    cvCredits: '100 CVs',
    ctaText: 'Buy Power Pack',
    ctaHref: '/signup?plan=power',
    features: [
      { text: 'Everything in Job Seeker, plus:', included: true },
      { text: '100 tailored CV credits', included: true },
      { text: 'Credits never expire', included: true },
      { text: 'Multiple master CVs', included: true },
      { text: 'LinkedIn optimization', included: true },
      { text: 'Priority 24hr support', included: true },
    ],
  },
];

// ============================================
// NAVIGATION (Light)
// ============================================
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-1.5">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M3 18C3 10 7 4 12 4C17 4 21 10 21 18" stroke="url(#logo-gradient-pricing-nav)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M6 17C6 11 8.5 6.5 12 6.5C15.5 6.5 18 11 18 17" stroke="url(#logo-gradient-pricing-nav)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 16C9 12 10.5 9 12 9C13.5 9 15 12 15 16" stroke="url(#logo-gradient-pricing-nav)" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="logo-gradient-pricing-nav" x1="3" y1="4" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#059669"/>
                <stop offset="1" stopColor="#0F766E"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="font-semibold text-gray-900">Canopy</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
          <a href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
          <a href="/pricing" className="text-sm text-indigo-600 font-medium">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Sign In</a>
          <a href="/cv-input" className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// HERO SECTION
// ============================================
function PricingHero() {
  return (
    <section className="relative pt-32 pb-16 bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-indigo-100 border border-indigo-200">
              <span className="text-sm font-medium text-indigo-700">No subscriptions. Pay once, use forever.</span>
            </span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            Buy credits.{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
              Land jobs.
            </span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            No monthly fees. No subscriptions to cancel. Buy CV credits once, use them during your job search, come back anytime.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Credits never expire
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              One-time payment
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Money-back guarantee
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// PRICING CARDS
// ============================================
function PricingCard({ tier }: { tier: typeof pricingTiers[0] }) {
  const isPopular = tier.popular;
  const isFree = tier.price === 0;

  return (
    <motion.div
      variants={fadeInUp}
      className={`relative rounded-2xl p-8 ${
        isPopular
          ? 'bg-indigo-600 text-white ring-4 ring-indigo-600 ring-offset-4 ring-offset-white scale-105'
          : 'bg-white border border-gray-200'
      }`}
    >
      {tier.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
          {tier.badge}
        </span>
      )}

      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded-full">
          Most Popular
        </span>
      )}

      <div className="text-center mb-6">
        <h3 className={`text-xl font-bold mb-1 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
          {tier.name}
        </h3>
        <p className={`text-sm ${isPopular ? 'text-indigo-100' : 'text-gray-500'}`}>
          {tier.description}
        </p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          {!isFree && <span className={`text-2xl ${isPopular ? 'text-indigo-100' : 'text-gray-400'}`}>$</span>}
          <span className={`text-5xl font-bold ${isPopular ? 'text-white' : 'text-gray-900'}`}>
            {isFree ? 'Free' : tier.price}
          </span>
        </div>
        <p className={`text-sm mt-1 ${isPopular ? 'text-indigo-100' : 'text-gray-500'}`}>
          {tier.priceLabel}
        </p>
        <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isPopular ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
        }`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {tier.cvCredits}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            {feature.included ? (
              <svg className={`w-5 h-5 mt-0.5 ${isPopular ? 'text-indigo-200' : 'text-green-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={`w-5 h-5 mt-0.5 ${isPopular ? 'text-indigo-300' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`text-sm ${
              feature.included
                ? (isPopular ? 'text-white' : 'text-gray-700')
                : (isPopular ? 'text-indigo-300' : 'text-gray-400')
            }`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={tier.ctaHref}
        className={`block w-full py-3 px-4 text-center font-semibold rounded-xl transition-colors ${
          isPopular
            ? 'bg-white text-indigo-600 hover:bg-gray-100'
            : isFree
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
        }`}
      >
        {tier.ctaText}
      </a>
    </motion.div>
  );
}

function PricingCardsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 items-start"
        >
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </motion.div>

        {/* Value comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 mb-4">Cost per tailored CV</p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">$0.90</p>
              <p className="text-sm text-gray-500">Starter</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">$0.63</p>
              <p className="text-sm text-gray-500">Job Seeker</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">$0.39</p>
              <p className="text-sm text-gray-500">Power Search</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// WHY CREDITS SECTION
// ============================================
function WhyCreditsSection() {
  const reasons = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Job search is temporary',
      description: 'You search for 2-6 months, land a job, then stop. Why pay monthly for something you won\'t use?'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'No subscription guilt',
      description: 'No forgetting to cancel. No paying when you\'re not using it. Buy once, use when you need.'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Come back anytime',
      description: 'Next job search in 2 years? Your credits are still there. Pick up where you left off.'
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Why Credits?</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Pricing that matches how you actually job search
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-100"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                {reason.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{reason.title}</h3>
              <p className="text-gray-600">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FAQ SECTION
// ============================================
function FAQSection() {
  const faqs = [
    {
      q: 'Do credits expire?',
      a: 'No! Your credits never expire. Buy them today, use them in 2 years. They\'re yours forever.'
    },
    {
      q: 'What counts as one CV credit?',
      a: 'One credit = one tailored CV generated for a specific job. You can download it as many times as you want.'
    },
    {
      q: 'Can I use the free tier forever?',
      a: 'Yes! The free tier gives you 3 CVs per month, forever. No credit card required.'
    },
    {
      q: 'What if I run out of credits?',
      a: 'Just buy another pack. Your new credits add to any remaining ones.'
    },
    {
      q: 'Is there a refund policy?',
      a: 'Yes, 14-day money-back guarantee. If you\'re not happy, we\'ll refund you, no questions asked.'
    },
    {
      q: 'Can I upgrade later?',
      a: 'Absolutely. Buy any pack anytime. Credits stack, so you never lose what you have.'
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">FAQ</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Common questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA SECTION
// ============================================
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-500 to-indigo-700 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          Start free. Buy credits when you need them.
        </h2>
        <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
          Try 3 free CVs. See the magic. Then decide.
        </p>
        <a
          href="/cv-input"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
        >
          Get Started Free
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <a href="/" className="flex items-center gap-1.5">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M3 18C3 10 7 4 12 4C17 4 21 10 21 18" stroke="url(#logo-gradient-pricing-footer)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 17C6 11 8.5 6.5 12 6.5C15.5 6.5 18 11 18 17" stroke="url(#logo-gradient-pricing-footer)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 16C9 12 10.5 9 12 9C13.5 9 15 12 15 16" stroke="url(#logo-gradient-pricing-footer)" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="logo-gradient-pricing-footer" x1="3" y1="4" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#059669"/>
                  <stop offset="1" stopColor="#0F766E"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="font-semibold text-gray-900">Canopy</span>
          </a>
          <p className="text-sm text-gray-400">{new Date().getFullYear()} Canopy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN PRICING PAGE
// ============================================
export default function PricingPage() {
  return (
    <main className="scroll-smooth bg-white min-h-screen">
      <Nav />
      <PricingHero />
      <PricingCardsSection />
      <WhyCreditsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
