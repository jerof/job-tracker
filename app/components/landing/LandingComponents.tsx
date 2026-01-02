'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';

// ============================================
// REVEAL ON SCROLL HOOK
// ============================================
export function useRevealOnScroll(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ============================================
// NAVIGATION
// ============================================
interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50
      px-6 transition-all duration-200
      ${scrolled
        ? 'py-3 bg-white/95 backdrop-blur-lg border-b border-neutral-200/50 shadow-sm'
        : 'py-4 bg-white/80 backdrop-blur-lg border-b border-neutral-200/30'
      }
    `}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-neutral-900">JobTracker</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors hidden sm:block"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <a
      href={href}
      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
    >
      {children}
    </a>
  );
}

// ============================================
// HERO SECTION
// ============================================
interface HeroProps {
  badge?: string;
  headline: ReactNode;
  subheadline: string;
  primaryCTA: { text: string; href: string };
  secondaryCTA?: { text: string; href: string };
  variant?: 'light' | 'dark';
}

export function Hero({
  badge,
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  variant = 'light'
}: HeroProps) {
  const isDark = variant === 'dark';

  return (
    <section className={`relative min-h-screen flex items-center overflow-hidden ${isDark ? 'bg-neutral-950' : ''}`}>
      {/* Background */}
      {isDark ? (
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-primary-600/30 to-info-600/20 blur-3xl" />
        </div>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-info-50" />
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: `
                radial-gradient(at 20% 30%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
                radial-gradient(at 80% 70%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
              `
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:py-40">
        <div className="max-w-3xl">
          {/* Badge */}
          {badge && (
            <div className={`
              inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full
              ${isDark
                ? 'bg-primary-500/20 border border-primary-500/30'
                : 'bg-primary-50 border border-primary-200'
              }
            `}>
              <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-primary-400' : 'bg-primary-500'} animate-pulse`} />
              <span className={`text-sm font-medium ${isDark ? 'text-primary-300' : 'text-primary-700'}`}>
                {badge}
              </span>
            </div>
          )}

          {/* Headline */}
          <h1 className={`
            text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6
            ${isDark ? 'text-white' : 'text-neutral-900'}
          `}>
            {headline}
          </h1>

          {/* Subheadline */}
          <p className={`
            text-xl leading-relaxed mb-8 max-w-2xl
            ${isDark ? 'text-neutral-400' : 'text-neutral-600'}
          `}>
            {subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={primaryCTA.href}
              className={`
                px-8 py-4 font-semibold rounded-xl transition-all text-center
                ${isDark
                  ? 'bg-white text-neutral-900 hover:bg-neutral-100 shadow-lg shadow-white/10'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/25'
                }
              `}
            >
              {primaryCTA.text}
            </a>
            {secondaryCTA && (
              <a
                href={secondaryCTA.href}
                className={`
                  px-8 py-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-center
                  ${isDark
                    ? 'bg-transparent text-white border border-neutral-700 hover:bg-neutral-800'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                {secondaryCTA.text}
              </a>
            )}
          </div>

          {/* Trust Signals */}
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <TrustSignal>Free forever plan</TrustSignal>
            <TrustSignal>No credit card required</TrustSignal>
            <TrustSignal>Setup in 2 minutes</TrustSignal>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSignal({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-500">
      <svg className="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {children}
    </div>
  );
}

// ============================================
// SECTION WRAPPER
// ============================================
interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, className = '', children }: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 lg:py-32 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {children}
      </div>
    </section>
  );
}

// ============================================
// SECTION HEADER
// ============================================
interface SectionHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export function SectionHeader({ overline, title, description, centered = true }: SectionHeaderProps) {
  const { ref, isVisible } = useRevealOnScroll();

  return (
    <div
      ref={ref}
      className={`
        mb-12 md:mb-16
        ${centered ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'}
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}
    >
      {overline && (
        <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">
          {overline}
        </span>
      )}
      <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-neutral-600">
          {description}
        </p>
      )}
    </div>
  );
}

// ============================================
// FEATURE CARD
// ============================================
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  const { ref, isVisible } = useRevealOnScroll();

  return (
    <div
      ref={ref}
      className={`
        group p-6 md:p-8
        bg-white border border-neutral-200 rounded-2xl
        hover:shadow-lg hover:border-primary-200
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="
        w-12 h-12 mb-4
        flex items-center justify-center
        bg-primary-50 text-primary-600
        rounded-xl
        group-hover:bg-primary-100
        transition-colors duration-300
      ">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 leading-relaxed">{description}</p>
    </div>
  );
}

// ============================================
// STATS
// ============================================
interface StatProps {
  value: string;
  label: string;
}

export function StatsGrid({ stats }: { stats: StatProps[] }) {
  const { ref, isVisible } = useRevealOnScroll();

  return (
    <div
      ref={ref}
      className={`
        grid grid-cols-2 md:grid-cols-4 gap-8
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
      `}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <p className="text-4xl md:text-5xl font-bold text-primary-600 font-mono tracking-tight">
            {stat.value}
          </p>
          <p className="text-neutral-600 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================
// TESTIMONIAL CARD
// ============================================
interface TestimonialProps {
  quote: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export function TestimonialCard({ quote, author }: TestimonialProps) {
  return (
    <div className="p-8 bg-neutral-50 border border-neutral-100 rounded-2xl">
      <p className="text-lg text-neutral-700 leading-relaxed italic mb-6">
        "{quote}"
      </p>
      <div className="flex items-center gap-4">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold">
              {author.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold text-neutral-900">{author.name}</p>
          <p className="text-sm text-neutral-500">{author.role}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CTA SECTION
// ============================================
interface CTASectionProps {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
}

export function CTASection({ title, description, ctaText, ctaHref }: CTASectionProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">{description}</p>
        <a
          href={ctaHref}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-neutral-100 transition-colors shadow-lg"
        >
          {ctaText}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </section>
  );
}

// ============================================
// BADGE / PILL
// ============================================
type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const badgeStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  neutral: 'bg-neutral-100 text-neutral-700'
};

export function Badge({ variant = 'primary', children }: BadgeProps) {
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${badgeStyles[variant]}`}>
      {children}
    </span>
  );
}

// ============================================
// BUTTON
// ============================================
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/25 hover:from-primary-600 hover:to-primary-700 hover:shadow-lg',
  secondary: 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base'
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  href,
  className = ''
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-all duration-150
    active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    ${buttonVariants[variant]}
    ${buttonSizes[size]}
    ${className}
  `;

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
}

// ============================================
// FOOTER
// ============================================
export function LandingFooter() {
  return (
    <footer className="py-16 bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="font-semibold text-neutral-900">JobTracker</span>
            </a>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Track every application, land the perfect job. The modern way to manage your job search.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            {new Date().getFullYear()} JobTracker. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-neutral-400 hover:text-neutral-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-neutral-400 hover:text-neutral-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
