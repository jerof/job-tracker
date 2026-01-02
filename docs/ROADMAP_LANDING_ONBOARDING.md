# Roadmap: Landing Page & Onboarding

**Status:** Research Complete, Ready for Implementation
**Inspiration:** Attio, Linear, Claude, Intercom

---

## Executive Summary

Build a dark-mode, product-first landing page with a 6-step onboarding flow that gets users to their "aha moment" (3 applications on their board) within 2 minutes.

---

## Part 1: Landing Page

### Hero Section

```
[Badge] Now with Gmail sync

# Land your next job, faster.

Automatically track applications, generate tailored CVs,
and research companies—all from one dashboard.

[Start Free]  [Watch Demo]

Join 10,000+ job seekers | No credit card required
```

**Visual:** Animated Kanban board showing cards moving through stages

### Page Structure

1. **Hero** - Headline + dual CTAs + product screenshot
2. **Logo Bar** - "Where our users work now" + company logos
3. **Value Props** - 4 pillars (Auto-tracking, Visual Pipeline, AI CVs, Company Intel)
4. **Interactive Demo** - Tabbed product walkthrough
5. **Testimonials** - 3 quotes with photos + outcomes
6. **CTA Section** - "Free forever" emphasis + final signup
7. **Footer** - Minimal links

### Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#8B5CF6` (Violet) |
| Accent | `#F43F5E` (Coral) |
| Dark BG | `#09090B` |
| Light BG | `#FAFAFA` |
| Text | `#FAFAFA` (dark) / `#111827` (light) |
| Border Radius | `8px` cards, `12px` buttons |

---

## Part 2: Onboarding Flow

### The "Aha Moment"

> "I can see ALL my applications in one organized view."

**Activation Metric:** 3 applications visible on Kanban board

### 6-Step Flow

| Step | Screen | Duration | Goal |
|------|--------|----------|------|
| 0 | Pre-signup demo | - | Show value before signup |
| 1 | Google OAuth | 5s | Single-click auth |
| 2 | Quick question | 15s | "What's your job search stage?" (skippable) |
| 3 | Add first app | 60s | Quick win - see a card appear |
| 4 | See your board | 10s | The "aha" moment |
| 5 | Gmail sync | 30s | Unlock automation (optional) |
| 6 | Quick tour | 30s | Only if user seems stuck |

### Empty States

Instead of "No applications yet":
- Show **ghost cards** with dotted borders
- Column-specific messages:
  - Saved: "Save jobs you're interested in"
  - Applied: "Track where you've applied"
  - Interviewing: "Drag here when you get the call!"
  - Offer: "The goal! Celebrate here"

### Progressive Disclosure

| Level | Trigger | Features |
|-------|---------|----------|
| Core | Day 1 | Add/edit apps, drag to change status |
| Power | 5+ apps | Gmail sync, filters, stats |
| Advanced | 2+ weeks | CV management, company research, auto-tailor |

---

## Part 3: Implementation Plan

### Phase 1: Landing Page (Sprint 1)

**Files to create:**
- [ ] `app/(marketing)/page.tsx` - Landing page
- [ ] `app/(marketing)/layout.tsx` - Marketing layout (no app nav)
- [ ] `app/components/landing/Hero.tsx`
- [ ] `app/components/landing/FeatureSection.tsx`
- [ ] `app/components/landing/Testimonials.tsx`
- [ ] `app/components/landing/CTASection.tsx`
- [ ] `app/components/landing/Footer.tsx`

**Dependencies:**
- `framer-motion` - Animations
- Hero product screenshot/video

### Phase 2: Auth Flow (Sprint 2)

**Files to create:**
- [ ] `app/(auth)/login/page.tsx` - Login page
- [ ] `app/(auth)/signup/page.tsx` - Signup page
- [ ] `app/(auth)/layout.tsx` - Auth layout

**Features:**
- Google OAuth button (primary)
- Email/password (secondary)
- "Continue as guest" option (view demo board)

### Phase 3: Onboarding (Sprint 3)

**Files to create:**
- [ ] `app/(onboarding)/welcome/page.tsx` - Step 2: Quick question
- [ ] `app/(onboarding)/first-app/page.tsx` - Step 3: Add first app
- [ ] `app/(onboarding)/connect-gmail/page.tsx` - Step 5: Gmail sync
- [ ] `app/components/onboarding/ProgressIndicator.tsx`
- [ ] `app/components/onboarding/OnboardingCard.tsx`

**Logic:**
- Track onboarding progress in user profile
- Skip to dashboard if user has 3+ apps
- Show tour only if user hasn't interacted in 30s

### Phase 4: Empty States (Sprint 4)

**Files to modify:**
- [ ] `app/components/KanbanColumn.tsx` - Ghost cards
- [ ] `app/components/KanbanBoard.tsx` - First-time user detection

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Landing → Signup conversion | 5%+ |
| Time to first app added | < 2 min |
| Activation (3 apps) | Within 24 hours |
| Gmail sync rate | 50% of users |
| Day-7 retention | 40%+ |

---

## Resources Created

| File | Description |
|------|-------------|
| `docs/DESIGN_SYSTEM_LANDING.md` | Visual design system |
| `app/styles/landing.css` | CSS classes |
| `app/components/landing/LandingComponents.tsx` | React components |
| `research/onboarding-flow-recommendation.md` | Full onboarding research |

---

## Quick Start

```tsx
// Example landing page structure
import { Hero, FeatureCard, CTASection } from '@/app/components/landing/LandingComponents';

export default function LandingPage() {
  return (
    <>
      <Hero
        badge="Now with Gmail sync"
        headline="Land your next job, faster."
        primaryCTA={{ text: "Start Free", href: "/signup" }}
      />
      <FeatureSection />
      <Testimonials />
      <CTASection />
    </>
  );
}
```
