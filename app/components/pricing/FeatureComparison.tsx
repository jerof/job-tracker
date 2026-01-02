'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface Feature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  power: boolean | string;
  category?: string;
}

const features: Feature[] = [
  // Core Features
  { name: 'Job tracking (Kanban board)', free: true, pro: true, power: true, category: 'Core Features' },
  { name: 'Master CV storage', free: '1', pro: '1', power: 'Unlimited', category: 'Core Features' },
  { name: 'Tailored CVs per month', free: '3', pro: '30', power: 'Unlimited', category: 'Core Features' },
  { name: 'Basic company info', free: true, pro: true, power: true, category: 'Core Features' },

  // AI Features
  { name: 'AI CV tailoring', free: true, pro: true, power: true, category: 'AI Features' },
  { name: 'AI research chat', free: false, pro: true, power: true, category: 'AI Features' },
  { name: 'Cover letter generation', free: false, pro: false, power: true, category: 'AI Features' },
  { name: 'Interview prep with AI', free: false, pro: false, power: true, category: 'AI Features' },
  { name: 'LinkedIn optimization', free: false, pro: false, power: true, category: 'AI Features' },

  // Integrations
  { name: 'Gmail auto-sync', free: false, pro: true, power: true, category: 'Integrations' },
  { name: 'Data export (CSV, PDF)', free: false, pro: true, power: true, category: 'Integrations' },

  // Analytics & Support
  { name: 'Usage analytics', free: false, pro: true, power: true, category: 'Analytics & Support' },
  { name: 'Email support', free: 'Basic', pro: 'Priority', power: '24hr response', category: 'Analytics & Support' },
];

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? <CheckIcon /> : <XIcon />;
  }
  return <span className="text-sm text-neutral-300">{value}</span>;
}

export function FeatureComparison() {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current && tableRef.current) {
        const tableRect = tableRef.current.getBoundingClientRect();
        const headerRect = headerRef.current.getBoundingClientRect();

        // Make header sticky when table is in view but header would scroll out
        setIsSticky(tableRect.top < 80 && tableRect.bottom > headerRect.height + 80);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  return (
    <motion.div
      ref={tableRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full overflow-x-auto"
    >
      <div className="min-w-[640px]">
        {/* Header */}
        <div
          ref={headerRef}
          className={`
            grid grid-cols-4 gap-4 py-4 px-6 rounded-t-xl
            ${isSticky
              ? 'fixed top-16 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-lg border-b border-neutral-800 max-w-5xl mx-auto'
              : 'bg-neutral-900/50'
            }
          `}
        >
          <div className="text-sm font-semibold text-neutral-400">Features</div>
          <div className="text-center">
            <span className="text-sm font-semibold text-neutral-300">Free</span>
            <p className="text-xs text-neutral-500">$0/mo</p>
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-primary-400">Pro</span>
            <p className="text-xs text-neutral-500">$9/mo</p>
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-neutral-300">Power</span>
            <p className="text-xs text-neutral-500">$19/mo</p>
          </div>
        </div>

        {/* Spacer when header is sticky */}
        {isSticky && <div className="h-20" />}

        {/* Feature rows grouped by category */}
        <div className="bg-neutral-900/30 rounded-b-xl border border-neutral-800 border-t-0">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="px-6 py-3 bg-neutral-800/50 border-t border-neutral-800 first:border-t-0">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  {category}
                </span>
              </div>

              {/* Features in category */}
              {categoryFeatures.map((feature, index) => (
                <div
                  key={feature.name}
                  className={`
                    grid grid-cols-4 gap-4 px-6 py-4 items-center
                    ${index < categoryFeatures.length - 1 ? 'border-b border-neutral-800/50' : ''}
                    hover:bg-neutral-800/20 transition-colors
                  `}
                >
                  <div className="text-sm text-neutral-300">{feature.name}</div>
                  <div className="flex justify-center">
                    <FeatureValue value={feature.free} />
                  </div>
                  <div className="flex justify-center">
                    <FeatureValue value={feature.pro} />
                  </div>
                  <div className="flex justify-center">
                    <FeatureValue value={feature.power} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
