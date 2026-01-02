# Job Tracker - Landing Page & Onboarding Design System

A comprehensive visual system inspired by **Attio** (flexibility, AI-native feel), **Linear** (precision, dark elegance), **Claude** (trust, warmth), and **Intercom** (approachability, conversational).

## Brand Personality

**Professional but not corporate** - We're serious about helping you land your dream job, but we're not wearing suits.

**Modern and clean** - Every pixel serves a purpose. No visual noise.

**Trustworthy** - People share sensitive career information. Our design should feel secure and reliable.

**Slightly playful** - Job hunting is stressful. Subtle delights make it feel manageable.

---

## 1. Color Palette

### Primary Colors (Violet - Linear/Claude inspired)

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-50` | `#F5F3FF` | Light backgrounds, hover states |
| `--brand-100` | `#EDE9FE` | Selected states, subtle highlights |
| `--brand-200` | `#DDD6FE` | Progress bars (light) |
| `--brand-300` | `#C4B5FD` | Icons on dark backgrounds |
| `--brand-400` | `#A78BFA` | Secondary CTAs |
| `--brand-500` | `#8B5CF6` | **Primary brand color** |
| `--brand-600` | `#7C3AED` | Primary CTAs, links |
| `--brand-700` | `#6D28D9` | Hover state for primary |
| `--brand-800` | `#5B21B6` | Active/pressed states |
| `--brand-900` | `#4C1D95` | Dark accents |

### Secondary Accent (Warm Coral - for playfulness)

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-400` | `#FB7185` | Celebration moments, notifications |
| `--accent-500` | `#F43F5E` | Secondary accent, offers |
| `--accent-600` | `#E11D48` | Hover on accent elements |

### Neutral Palette (Warm Slate - Attio inspired)

| Token | Hex | Usage |
|-------|-----|-------|
| `--neutral-0` | `#FFFFFF` | Page backgrounds (light mode) |
| `--neutral-50` | `#F8FAFC` | Card backgrounds, subtle sections |
| `--neutral-100` | `#F1F5F9` | Input backgrounds, dividers |
| `--neutral-200` | `#E2E8F0` | Borders |
| `--neutral-300` | `#CBD5E1` | Disabled text, placeholders |
| `--neutral-400` | `#94A3B8` | Muted icons |
| `--neutral-500` | `#64748B` | Secondary text |
| `--neutral-600` | `#475569` | Body text |
| `--neutral-700` | `#334155` | Headings |
| `--neutral-800` | `#1E293B` | Primary text |
| `--neutral-900` | `#0F172A` | Headlines, emphasis |
| `--neutral-950` | `#020617` | Dark mode background |

### Dark Mode Background (Linear-style)

| Token | Hex | Usage |
|-------|-----|-------|
| `--dark-bg` | `#09090B` | Primary dark background |
| `--dark-bg-elevated` | `#18181B` | Cards, modals |
| `--dark-bg-subtle` | `#27272A` | Hover states |
| `--dark-border` | `#3F3F46` | Borders |

### Semantic Colors

| State | Background | Text | Border |
|-------|------------|------|--------|
| Success | `#ECFDF5` | `#047857` | `#10B981` |
| Warning | `#FFFBEB` | `#B45309` | `#F59E0B` |
| Error | `#FEF2F2` | `#B91C1C` | `#EF4444` |
| Info | `#EFF6FF` | `#1D4ED8` | `#3B82F6` |

### Gradients

```css
/* Hero gradient - subtle, professional */
--gradient-hero: linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 50%, #ECFDF5 100%);

/* CTA gradient - eye-catching but tasteful */
--gradient-cta: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);

/* Mesh gradient for hero backgrounds */
--gradient-mesh: radial-gradient(at 0% 0%, #DDD6FE 0%, transparent 50%),
                 radial-gradient(at 100% 0%, #BFDBFE 0%, transparent 50%),
                 radial-gradient(at 100% 100%, #D1FAE5 0%, transparent 50%);

/* Dark mode hero gradient */
--gradient-hero-dark: radial-gradient(ellipse at top, #1E1B4B 0%, #09090B 70%);

/* Glow effect for cards */
--gradient-glow: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y),
                 rgba(139, 92, 246, 0.1), transparent 40%);
```

---

## 2. Typography

### Font Stack

```css
/* Primary - Geist Sans (matches Linear/Vercel aesthetic) */
--font-sans: 'Geist', 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;

/* Headings - Same but with tighter tracking */
--font-display: 'Geist', 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;

/* Monospace for stats/numbers */
--font-mono: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace;
```

### Type Scale (Landing Page)

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-2xl` | 72px / 4.5rem | 1.0 | 700 | Hero headline (desktop) |
| `display-xl` | 60px / 3.75rem | 1.1 | 700 | Hero headline (tablet) |
| `display-lg` | 48px / 3rem | 1.1 | 700 | Hero headline (mobile) |
| `h1` | 36px / 2.25rem | 1.2 | 600 | Section titles |
| `h2` | 30px / 1.875rem | 1.25 | 600 | Subsection titles |
| `h3` | 24px / 1.5rem | 1.3 | 600 | Card titles |
| `h4` | 20px / 1.25rem | 1.4 | 600 | Feature titles |
| `body-lg` | 18px / 1.125rem | 1.6 | 400 | Hero subtext, lead paragraphs |
| `body` | 16px / 1rem | 1.6 | 400 | Default body text |
| `body-sm` | 14px / 0.875rem | 1.5 | 400 | Secondary text, captions |
| `overline` | 12px / 0.75rem | 1.5 | 600 | Labels, all caps |

### Tailwind Classes

```html
<!-- Hero headline -->
<h1 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900">

<!-- Hero subtext -->
<p class="text-lg md:text-xl text-neutral-600 max-w-2xl">

<!-- Section title -->
<h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">

<!-- Body text -->
<p class="text-base text-neutral-600 leading-relaxed">

<!-- Overline/Label -->
<span class="text-xs font-semibold uppercase tracking-wider text-brand-600">
```

---

## 3. Spacing System

Based on 4px base unit (Tailwind default).

### Landing Page Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-hero` | 120px / 7.5rem | Top/bottom hero padding |
| `--space-section` | 96px / 6rem | Between major sections |
| `--space-subsection` | 64px / 4rem | Within sections |
| `--space-card-gap` | 32px / 2rem | Between cards in grid |
| `--space-element` | 24px / 1.5rem | Between related elements |
| `--space-tight` | 16px / 1rem | Between tightly coupled items |
| `--space-xs` | 8px / 0.5rem | Small internal spacing |

### Tailwind Usage

```html
<!-- Hero section padding -->
<section class="py-24 md:py-32 lg:py-40">

<!-- Section spacing -->
<section class="py-16 md:py-24">

<!-- Card grid -->
<div class="grid gap-6 md:gap-8">

<!-- Content stack -->
<div class="space-y-4">
```

### Container Widths

```css
--container-sm: 640px;   /* Narrow content, forms */
--container-md: 768px;   /* Blog, documentation */
--container-lg: 1024px;  /* Feature sections */
--container-xl: 1280px;  /* Full-width sections */
--container-2xl: 1440px; /* Hero, max content width */
```

---

## 4. Component Styles

### Buttons

#### Primary Button (CTA)
```html
<button class="
  inline-flex items-center justify-center gap-2
  px-6 py-3
  bg-gradient-to-r from-brand-500 to-brand-600
  text-white font-medium
  rounded-lg
  shadow-md shadow-brand-500/25
  hover:shadow-lg hover:shadow-brand-500/30
  hover:from-brand-600 hover:to-brand-700
  active:scale-[0.98]
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
">
  Get Started Free
</button>
```

#### Secondary Button
```html
<button class="
  inline-flex items-center justify-center gap-2
  px-6 py-3
  bg-white
  text-neutral-700 font-medium
  border border-neutral-200
  rounded-lg
  hover:bg-neutral-50 hover:border-neutral-300
  active:scale-[0.98]
  transition-all duration-150
">
  Learn More
</button>
```

#### Ghost Button
```html
<button class="
  inline-flex items-center justify-center gap-2
  px-4 py-2
  text-neutral-600 font-medium
  rounded-lg
  hover:bg-neutral-100 hover:text-neutral-900
  transition-colors duration-150
">
  Sign In
</button>
```

### Cards

#### Feature Card
```html
<div class="
  group
  p-6 md:p-8
  bg-white
  border border-neutral-200
  rounded-2xl
  shadow-sm
  hover:shadow-md hover:border-brand-200
  transition-all duration-200
">
  <div class="
    w-12 h-12 mb-4
    flex items-center justify-center
    bg-brand-50 text-brand-600
    rounded-xl
    group-hover:bg-brand-100
    transition-colors
  ">
    <!-- Icon -->
  </div>
  <h3 class="text-lg font-semibold text-neutral-900 mb-2">Feature Title</h3>
  <p class="text-neutral-600">Feature description goes here.</p>
</div>
```

#### Testimonial Card
```html
<div class="
  p-8
  bg-neutral-50
  border border-neutral-100
  rounded-2xl
">
  <p class="text-lg text-neutral-700 mb-6 italic">
    "Quote goes here..."
  </p>
  <div class="flex items-center gap-4">
    <img class="w-12 h-12 rounded-full" src="..." alt="" />
    <div>
      <p class="font-medium text-neutral-900">Name</p>
      <p class="text-sm text-neutral-500">Title, Company</p>
    </div>
  </div>
</div>
```

#### Stats Card
```html
<div class="text-center p-6">
  <p class="text-4xl md:text-5xl font-bold text-brand-600 font-mono">
    10,000+
  </p>
  <p class="text-neutral-600 mt-2">Jobs Tracked</p>
</div>
```

### Inputs

#### Text Input
```html
<input
  type="text"
  placeholder="Enter your email"
  class="
    w-full px-4 py-3
    bg-white
    border border-neutral-200
    rounded-lg
    text-neutral-900 placeholder:text-neutral-400
    focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
    transition-all duration-150
  "
/>
```

#### Email Signup (Hero)
```html
<div class="flex flex-col sm:flex-row gap-3 max-w-md">
  <input
    type="email"
    placeholder="Enter your email"
    class="
      flex-1 px-4 py-3
      bg-white/80 backdrop-blur
      border border-neutral-200
      rounded-lg
      focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
    "
  />
  <button class="
    px-6 py-3
    bg-brand-600 text-white font-medium
    rounded-lg
    hover:bg-brand-700
    transition-colors
  ">
    Get Started
  </button>
</div>
```

### Badges

```html
<!-- Status badges -->
<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-success-100 text-success-700">
  Offer Received
</span>

<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-700">
  Interview Scheduled
</span>

<span class="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-100 text-brand-700">
  Applied
</span>

<!-- Feature tag -->
<span class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-brand-50 text-brand-600 border border-brand-200">
  New Feature
</span>

<!-- Pill badge with icon -->
<span class="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-neutral-100 text-neutral-700">
  <svg class="w-4 h-4" />
  Gmail Sync
</span>
```

### Navigation

```html
<nav class="
  fixed top-0 left-0 right-0 z-50
  px-6 py-4
  bg-white/80 backdrop-blur-lg
  border-b border-neutral-200/50
">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-brand-600"></div>
      <span class="font-semibold text-neutral-900">JobTracker</span>
    </a>

    <!-- Links -->
    <div class="hidden md:flex items-center gap-8">
      <a href="#" class="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Features</a>
      <a href="#" class="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Pricing</a>
      <a href="#" class="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Blog</a>
    </div>

    <!-- CTA -->
    <div class="flex items-center gap-4">
      <a href="#" class="text-sm text-neutral-600 hover:text-neutral-900">Sign In</a>
      <button class="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">
        Get Started
      </button>
    </div>
  </div>
</nav>
```

---

## 5. Animation Principles

### Timing Guidelines

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Micro-interactions | 100-150ms | `ease-out` |
| State changes | 150-200ms | `ease-out` |
| Enter animations | 200-300ms | `ease-out` or `spring` |
| Exit animations | 150-200ms | `ease-in` |
| Page transitions | 300-400ms | `ease-in-out` |
| Loading states | 1000-2000ms | `linear` (loops) |

### Easing Functions

```css
/* Quick, snappy - for small UI elements */
--ease-snappy: cubic-bezier(0.4, 0, 0.2, 1);

/* Smooth deceleration - for entrances */
--ease-out: cubic-bezier(0, 0, 0.2, 1);

/* Smooth acceleration - for exits */
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Playful bounce - for success states, celebrations */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Natural spring - for drag/drop, modals */
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Micro-Interaction Patterns

#### Button Press
```css
.btn:active {
  transform: scale(0.98);
  transition: transform 100ms ease-out;
}
```

#### Card Hover
```css
.card {
  transition: all 200ms ease-out;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
}
```

#### Link Underline
```css
.link {
  position: relative;
}
.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 200ms ease-out;
}
.link:hover::after {
  width: 100%;
}
```

#### Fade In Up (for scroll reveals)
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 500ms ease-out forwards;
}
```

#### Stagger Children
```css
.stagger > * {
  animation: fadeInUp 400ms ease-out forwards;
  opacity: 0;
}
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 100ms; }
.stagger > *:nth-child(3) { animation-delay: 200ms; }
.stagger > *:nth-child(4) { animation-delay: 300ms; }
```

### Loading States

#### Skeleton Shimmer
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--neutral-100) 0%,
    var(--neutral-50) 50%,
    var(--neutral-100) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Spinner
```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--neutral-200);
  border-top-color: var(--brand-600);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

---

## 6. Hero Section Layout

### Structure

```html
<section class="relative min-h-screen flex items-center overflow-hidden">
  <!-- Background -->
  <div class="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-blue-50"></div>

  <!-- Mesh gradient overlay -->
  <div class="absolute inset-0 opacity-60" style="background:
    radial-gradient(at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
  "></div>

  <!-- Grid pattern (subtle) -->
  <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>

  <!-- Content -->
  <div class="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:py-40">
    <div class="max-w-3xl">
      <!-- Overline badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-brand-50 border border-brand-200">
        <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
        <span class="text-sm font-medium text-brand-700">Now with Gmail sync</span>
      </div>

      <!-- Headline -->
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 mb-6">
        Track every job.
        <br />
        <span class="text-brand-600">Land the one.</span>
      </h1>

      <!-- Subheadline -->
      <p class="text-xl text-neutral-600 mb-8 max-w-2xl leading-relaxed">
        The job tracker that actually helps. Auto-sync with Gmail,
        get AI-powered insights, and never lose track of an opportunity again.
      </p>

      <!-- CTA Group -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button class="px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 hover:bg-brand-700 hover:shadow-xl transition-all">
          Start Tracking Free
        </button>
        <button class="px-8 py-4 bg-white text-neutral-700 font-semibold rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
          </svg>
          Watch Demo
        </button>
      </div>

      <!-- Trust signals -->
      <div class="mt-12 flex flex-wrap items-center gap-8 text-neutral-500 text-sm">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
          Free forever plan
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
          No credit card required
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
          Setup in 2 minutes
        </div>
      </div>
    </div>
  </div>

  <!-- Hero visual (right side on desktop) -->
  <div class="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2">
    <div class="relative">
      <!-- App preview with perspective -->
      <div class="transform perspective-1000 rotate-y-[-5deg] rotate-x-[2deg]">
        <div class="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          <!-- App screenshot or component preview -->
        </div>
      </div>

      <!-- Floating elements -->
      <div class="absolute -left-12 top-1/4 p-4 bg-white rounded-xl shadow-lg border animate-bounce-subtle">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-success-500"></div>
          <span class="text-sm font-medium">Interview scheduled!</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Alternative Hero Variants

#### Centered Hero (for simplicity)
```html
<section class="relative py-32 lg:py-48">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <span class="text-sm font-semibold text-brand-600 uppercase tracking-wider">
      Job Search, Simplified
    </span>
    <h1 class="mt-4 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900">
      Your job search<br/>command center
    </h1>
    <p class="mt-6 text-xl text-neutral-600 max-w-2xl mx-auto">
      Stop juggling spreadsheets. Track applications, sync emails,
      and get insights that actually help you land offers.
    </p>
    <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <!-- CTAs -->
    </div>
  </div>
</section>
```

#### Dark Hero (Linear-style)
```html
<section class="relative min-h-screen bg-neutral-950 overflow-hidden">
  <!-- Gradient orb -->
  <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-br from-brand-600/30 to-blue-600/20 blur-3xl"></div>

  <!-- Content -->
  <div class="relative z-10 max-w-7xl mx-auto px-6 py-32 lg:py-40 text-center">
    <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
      Track every job.
      <br/>
      <span class="bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
        Land the one.
      </span>
    </h1>
    <!-- ... -->
  </div>
</section>
```

---

## 7. Onboarding Flow Design

### Step Indicator
```html
<div class="flex items-center gap-2">
  <!-- Completed step -->
  <div class="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
    </svg>
  </div>

  <!-- Connector -->
  <div class="w-12 h-0.5 bg-brand-600"></div>

  <!-- Current step -->
  <div class="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-medium">
    2
  </div>

  <!-- Connector (inactive) -->
  <div class="w-12 h-0.5 bg-neutral-200"></div>

  <!-- Future step -->
  <div class="w-8 h-8 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center font-medium">
    3
  </div>
</div>
```

### Onboarding Card
```html
<div class="max-w-lg mx-auto p-8 bg-white rounded-2xl shadow-xl border border-neutral-100">
  <!-- Step indicator -->
  <div class="mb-8"><!-- ... --></div>

  <!-- Step title -->
  <h2 class="text-2xl font-bold text-neutral-900 mb-2">Connect your Gmail</h2>
  <p class="text-neutral-600 mb-8">
    We'll automatically track your job applications and keep everything organized.
  </p>

  <!-- Step content -->
  <div class="space-y-4 mb-8">
    <button class="w-full p-4 flex items-center gap-4 bg-neutral-50 rounded-xl border-2 border-transparent hover:border-brand-500 transition-colors">
      <img src="/google.svg" class="w-6 h-6" />
      <span class="font-medium">Continue with Google</span>
    </button>
  </div>

  <!-- Privacy note -->
  <p class="text-xs text-neutral-500 text-center">
    We only read job-related emails. Your data stays private.
  </p>
</div>
```

---

## 8. Design Tokens (CSS Variables)

Add these to your `globals.css`:

```css
:root {
  /* Landing page specific tokens */
  --landing-hero-padding: 8rem;
  --landing-section-padding: 6rem;
  --landing-container-max: 1280px;

  /* Animation tokens */
  --animation-stagger-delay: 100ms;
  --animation-entrance-duration: 400ms;

  /* Z-index for landing page */
  --z-hero-bg: 0;
  --z-hero-content: 10;
  --z-hero-visual: 5;
  --z-nav: 50;
}

@media (max-width: 768px) {
  :root {
    --landing-hero-padding: 4rem;
    --landing-section-padding: 4rem;
  }
}
```

---

## 9. Quick Reference: Tailwind Class Combinations

### Common Patterns

```html
<!-- Page section -->
class="py-16 md:py-24 lg:py-32"

<!-- Section title -->
class="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900"

<!-- Lead paragraph -->
class="text-lg text-neutral-600 max-w-2xl"

<!-- Card grid -->
class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"

<!-- Interactive card -->
class="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-brand-200 transition-all duration-200"

<!-- Primary CTA -->
class="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all"

<!-- Ghost link -->
class="text-neutral-600 hover:text-neutral-900 transition-colors"

<!-- Badge -->
class="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-700"
```

---

## 10. Accessibility Checklist

- [ ] Color contrast ratio >= 4.5:1 for body text
- [ ] Color contrast ratio >= 3:1 for large text and UI components
- [ ] Focus states visible on all interactive elements
- [ ] Skip link at the top of the page
- [ ] Semantic HTML structure (proper heading hierarchy)
- [ ] Alt text on all images
- [ ] Reduced motion support for users who prefer it
- [ ] Touch targets >= 44x44px on mobile

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Sources & Inspiration

- [Attio Design on Figma Community](https://www.figma.com/community/file/1413637875520151701/landing-page-design-attio-ui-components-ui-kit)
- [Linear Design System (Figma)](https://www.figma.com/community/file/1222872653732371433/linear-design-system)
- [Linear Style Design Trends](https://medium.com/design-bootcamp/the-rise-of-linear-style-design-origins-trends-and-techniques-4fd96aab7646)
- [Linear Landing Page Analysis](https://saaslandingpage.com/linear/)
