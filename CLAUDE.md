# Job Tracker - Project Instructions

## Philosophy: Simple Scales, Fancy Fails

**Every feature should be the simplest thing that could work.**

- No premature abstraction
- No config options until users demand them
- No "nice to have" fields - only what's essential
- Ship fast, iterate based on real usage
- If it takes more than 1 session to build, it's too complex
- When in doubt, cut scope

## Project Overview
A job application tracker that auto-syncs with Gmail to track applications, interviews, and outcomes.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Google OAuth via Supabase
- **AI:** Claude Haiku for email parsing
- **Hosting:** Vercel

## Key Files
- `FEATURE_JOB_TRACKER.md` - Full specification (in parent folder)
- `feature-list.json` - Implementation task tracking
- `claude-progress.txt` - Session history
- `bugs.md` - Known issues

## Development Commands
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Environment Variables
Required in `.env.local`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
ANTHROPIC_API_KEY=
PERPLEXITY_API_KEY=

# Stripe (Credits System)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=      # 10 credits @ $9
STRIPE_PRICE_JOB_SEEKER=   # 30 credits @ $19
STRIPE_PRICE_POWER=        # 100 credits @ $39
```

## Credits System
Users get 3 free credits/month. Additional credits purchased via Stripe:
- **Starter:** 10 credits @ $9
- **Job Seeker:** 30 credits @ $19 (popular)
- **Power Search:** 100 credits @ $39

Credits are used for CV generation. Balance shown in sidebar.

## Architecture Notes
- Gmail tokens stored encrypted in Supabase
- Email parsing uses Claude Haiku (cheap/fast)
- No full email storage - just Gmail message IDs for linking
- Polling sync (every 15 min), not real-time

## Conventions
- Components in `app/components/`
- API routes in `app/api/`
- Utility functions in `lib/`
- Use React Query for server state
- Keep components simple - no premature abstraction
