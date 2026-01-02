# Roadmap: Pricing & Payments

**Status:** Ready for Implementation
**Payment Provider:** Stripe
**Model:** Credits (No Subscriptions)

---

## Revenue Model: "Free Forever + Credit Bundles"

### Philosophy (Marc Lou Principles)

> "Selling a $10/month subscription is as hard as selling a $100 one-time payment."
> "Not charging a subscription can be a competitive edge."
> — Marc Lou

**Why NO subscriptions:**
1. **Job search is temporary** - Users naturally churn when they land a job
2. **Subscription friction kills conversion** - People are tired of subscriptions
3. **Fighting churn is exhausting** - Why fight natural behavior?
4. **Competitive edge** - Every competitor charges $20-40/month

**Why CREDITS work:**
1. **Pay for what you use** - Fair, transparent pricing
2. **Never expire** - No pressure, come back anytime
3. **One-time purchase** - Higher conversion, simpler accounting
4. **Aligns costs with value** - CV generation has real AI costs

---

## Cost Analysis

| Item | Cost per CV |
|------|-------------|
| Claude Sonnet (CV generation) | $0.05-0.10 |
| PDF generation | $0.01 |
| Storage | ~$0.001 |
| **Total** | **~$0.15** |

At $0.40-0.90 per CV (depending on bundle), margin is **75-85%**.

---

## Pricing Tiers

### Free Forever - $0

**Includes:**
- Unlimited job tracking (Kanban board)
- Unlimited Gmail sync
- AI research chat
- Chrome extension
- 1 Master CV
- **3 CV credits/month** (resets monthly)

**Why generous:**
- Tracking/sync costs us nothing
- 3 CVs = taste the magic, want more
- Word of mouth from happy free users

---

### Credit Bundles (One-Time, Never Expire)

| Tier | Price | CVs | Per CV | Savings | Best For |
|------|-------|-----|--------|---------|----------|
| **Starter** | $9 | 10 | $0.90 | — | Testing the waters |
| **Job Seeker** | $19 | 30 | $0.63 | 30% off | Active 2-3 month search |
| **Power Search** | $39 | 100 | $0.39 | 57% off | Aggressive job hunt |

**Key features:**
- Credits **never expire**
- Use across unlimited job applications
- Stack multiple purchases if needed
- Full access to all features

---

## Competitive Analysis

| Product | Price | Model | Our Advantage |
|---------|-------|-------|---------------|
| Teal | $29/mo | Subscription | No subscription, 10x cheaper |
| Rezi | $29/mo | Subscription | No subscription, 10x cheaper |
| Huntr | $40/mo | Subscription | No subscription, 12x cheaper |
| Kickresume | $19/mo | Subscription | No subscription, credits never expire |
| Resume.io | $24.95/mo | Subscription | No subscription, pay once |

**3-month job search comparison:**
- Competitors: $60-120 in subscriptions
- Us: $19 for 30 CVs (enough for most searches)

**Marketing angle:**
> "Why pay monthly for a 3-month job search? Buy credits. Land the job. Move on."

---

## Implementation Plan

### Phase 1: Database Schema (Sprint 1)

```sql
-- User credits (simple, no subscription complexity)
ALTER TABLE users ADD COLUMN cv_credits INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN cv_credits_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN last_free_credit_reset TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;

-- Credit purchases (one-time payments)
CREATE TABLE credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT NOT NULL,
  credits_purchased INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE cv_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id),
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cv_generations_user ON cv_generations(user_id, created_at);

-- Monthly free credit reset function
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
BEGIN
  UPDATE users
  SET cv_credits = GREATEST(cv_credits, 3),
      last_free_credit_reset = NOW()
  WHERE last_free_credit_reset < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

### Phase 2: Stripe Integration (Sprint 1)

**Stripe Products (One-Time Payments Only):**
```
price_starter_10cv     = $9   (10 credits)
price_jobseeker_30cv   = $19  (30 credits)
price_power_100cv      = $39  (100 credits)
```

**Files to create:**
- `lib/credits.ts` - Credit checking and deduction
- `app/api/stripe/create-checkout/route.ts` - One-time payment checkout
- `app/api/stripe/webhooks/route.ts` - Add credits on payment success

**Webhook handling (simplified - no subscription events):**
```typescript
// Only need to handle one event
case 'checkout.session.completed':
  // Add credits to user account
  await addCreditsToUser(userId, creditsPurchased);
  break;
```

### Phase 3: Pricing Page (Sprint 1)

**Already built:** `app/(marketing)/pricing/page.tsx`
- Light mode design
- 4 tier cards (Free + 3 bundles)
- "Why Credits?" explanation section
- FAQ for credit model

### Phase 4: In-App Credit UI (Sprint 2)

**Files to create:**
- `app/components/billing/CreditBalance.tsx` - Show remaining credits
- `app/components/billing/BuyCreditsModal.tsx` - Quick purchase flow
- `app/components/billing/LowCreditsWarning.tsx` - Nudge when running low

**UX Flow:**
1. User generates CV → Deduct 1 credit
2. Credits < 3 → Show subtle "Running low" indicator
3. Credits = 0 → Show "Buy more credits" modal
4. Free users → Monthly reset to 3 credits

---

## Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (one-time payments only)
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_JOBSEEKER=price_...
STRIPE_PRICE_POWER=price_...
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Free → Paid conversion | 8-15% |
| Average purchase value | $22 |
| Repeat purchase rate | 20% (users who job hunt again) |
| CV generations per paying user | 25+ |
| Refund rate | <2% |

---

## Revenue Projections

**Conservative (Month 6):**
- 10,000 free users
- 800 credit purchases (8% conversion)
- Average $22/purchase
- **Revenue: $17,600**

**Optimistic (Month 12):**
- 50,000 free users
- 5,000 credit purchases (10% conversion)
- Average $25/purchase (more Power tier)
- **Revenue: $125,000**

**Key insight:** No MRR to track, no churn to fight. Just sales.

---

## FAQ Content

**Q: Can I use JobTracker for free?**
A: Yes! Free forever includes unlimited job tracking, Gmail sync, research chat, and 3 CV credits per month.

**Q: Do credits expire?**
A: Never. Buy credits now, use them whenever you need them.

**Q: What if I need more credits later?**
A: Just buy another bundle. Credits stack - buy as many as you need.

**Q: Why don't you offer a subscription?**
A: Job searching is temporary. Why pay monthly for something you'll use for 3 months? Buy what you need, land the job, move on.

**Q: What payment methods do you accept?**
A: All major credit cards, Apple Pay, Google Pay via Stripe.

**Q: Do you offer refunds?**
A: Yes, 14-day money-back guarantee, no questions asked.

---

## Implementation Checklist

### Sprint 1: Core
- [ ] Database migration for credits
- [ ] Credit checking/deduction logic
- [ ] Stripe one-time payment integration
- [ ] Webhook for adding credits
- [x] Pricing page UI (done)

### Sprint 2: Polish
- [ ] Credit balance display in app
- [ ] Low credits warning
- [ ] Buy credits modal
- [ ] Purchase history page
- [ ] Email receipt on purchase

### Sprint 3: Growth
- [ ] "Gift credits" feature (refer a friend)
- [ ] Bulk discount for 200+ credits
- [ ] Analytics: conversion funnel
