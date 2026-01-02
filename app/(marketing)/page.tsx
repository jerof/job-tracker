'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

// ============================================
// NAVIGATION (Light)
// ============================================
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-1.5">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M3 18C3 10 7 4 12 4C17 4 21 10 21 18" stroke="url(#logo-gradient-nav)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M6 17C6 11 8.5 6.5 12 6.5C15.5 6.5 18 11 18 17" stroke="url(#logo-gradient-nav)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M9 16C9 12 10.5 9 12 9C13.5 9 15 12 15 16" stroke="url(#logo-gradient-nav)" strokeWidth="1.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="logo-gradient-nav" x1="3" y1="4" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#059669"/>
                <stop offset="1" stopColor="#0F766E"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="font-semibold text-gray-900">Canopy</span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            How It Works
          </a>
          <a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
          >
            Sign In
          </a>
          <a
            href="/cv-input"
            className="px-4 py-2 bg-black text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            style={{ color: '#ffffff' }}
          >
            Get Started Free
          </a>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// HERO SECTION (Light)
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-gray-50 via-white to-white pt-20">
      {/* Subtle decorative elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-gray-200/50 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-100/60 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gray-100 border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Track • Research • Apply • Land</span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6"
          >
            Your Job Search{' '}
            <span className="underline decoration-4 underline-offset-4 decoration-gray-300">
              OS
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Track applications, auto-sync emails, research companies, and generate tailored CVs — all in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <a
              href="/cv-input"
              className="px-8 py-4 bg-black font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-400/50 text-center"
              style={{ color: '#ffffff' }}
            >
              Get Started Free
            </a>
            <a
              href="#features"
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              See How It Works
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-8"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free forever plan
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Chrome extension included
            </div>
          </motion.div>

          {/* Chrome Extension CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm text-gray-600"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#4285F4"/>
                <path d="M21.17 8H12v4h5.24c-.72 2.53-3.02 4.39-5.74 4.39-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L18 3.79C16.12 2.07 13.68 1 11 1 5.48 1 1 5.48 1 11s4.48 10 10 10c5.52 0 10-4.48 10-10 0-.67-.07-1.32-.17-1.95-.05-.35-.35-.05-.66-.05z" fill="#EA4335"/>
                <path d="M3.15 7.34L6.44 9.7c.84-2.47 3.14-4.24 5.86-4.24 1.66 0 3.14.69 4.22 1.78L18 5.28C16.12 3.35 13.56 2 10.7 2 7.14 2 4.1 4.18 3.15 7.34z" fill="#FBBC05"/>
                <path d="M12 22c2.9 0 5.36-1 7.18-2.76l-3.32-2.72c-1.01.67-2.3 1.07-3.86 1.07-2.72 0-5.02-1.86-5.74-4.39H3.08c1.05 3.22 4.07 5.8 7.92 5.8z" fill="#34A853"/>
              </svg>
              Get the Chrome Extension
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.div>
        </div>

      </div>
    </section>
  );
}


// ============================================
// LOGO BAR
// ============================================
function LogoBar() {
  const logos = ['Google', 'Stripe', 'Notion', 'Linear', 'Figma', 'Vercel', 'Spotify'];

  return (
    <section className="py-16 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm text-gray-500 mb-8">
          Where our users landed their dream jobs
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {logos.map((logo, idx) => (
            <span
              key={idx}
              className="text-gray-400 font-semibold text-lg hover:text-gray-600 transition-colors"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURE SECTIONS (with screenshots)
// ============================================
function FeatureSections() {
  return (
    <section id="features" className="py-24 lg:py-32">
      {/* Feature 1: AI Tailored CVs */}
      <FeatureBlock
        badge="The Magic"
        title="AI-Tailored CVs in 30 Seconds"
        description="Stop spending hours rewriting your CV for each job. Our AI reads the job description, understands what they're looking for, and rewrites your experience to match. Same facts, better framing."
        features={[
          'Analyzes job description for key requirements',
          'Highlights your most relevant experience',
          'Adjusts language to match company tone',
          'Generates downloadable PDF instantly'
        ]}
        screenshotAlt="CV generation interface"
        imagePosition="right"
        accentColor="violet"
      >
        <CVGeneratorPreview />
      </FeatureBlock>

      {/* Feature 2: Visual Pipeline */}
      <FeatureBlock
        badge="Stay Organized"
        title="See Every Application at a Glance"
        description="No more spreadsheet chaos. Drag and drop your applications through stages - from saved to offer. Never lose track of where you stand with any company."
        features={[
          'Kanban board with customizable columns',
          'Drag and drop to update status',
          'Filter by company, role, or date',
          'Never miss a follow-up deadline'
        ]}
        screenshotAlt="Kanban board interface"
        imagePosition="left"
        accentColor="blue"
      >
        <KanbanPreview />
      </FeatureBlock>

      {/* Feature 3: Company Research */}
      <FeatureBlock
        badge="Be Prepared"
        title="Know Everything Before the Interview"
        description="Get instant intel on any company. Funding history, company culture, recent news, Glassdoor reviews, and AI-generated interview questions. Walk in confident."
        features={[
          'Company overview and funding data',
          'Culture insights from employee reviews',
          'Recent news and press mentions',
          'AI-suggested interview questions'
        ]}
        screenshotAlt="Company research interface"
        imagePosition="right"
        accentColor="emerald"
      >
        <ResearchPreview />
      </FeatureBlock>

      {/* Feature 4: Gmail Sync */}
      <FeatureBlock
        badge="Automated"
        title="Applications Track Themselves"
        description="Connect your Gmail and watch the magic happen. Application confirmations, interview invites, rejections - everything gets logged automatically. You focus on applying."
        features={[
          'One-click Gmail connection',
          'Auto-detects job-related emails',
          'Updates application status automatically',
          'Your personal data stays private'
        ]}
        screenshotAlt="Gmail sync interface"
        imagePosition="left"
        accentColor="rose"
      >
        <GmailSyncPreview />
      </FeatureBlock>

      {/* Feature 5: Chrome Extension */}
      <FeatureBlock
        badge="One Click"
        title="Save Jobs From Anywhere"
        description="Found a job on LinkedIn, Indeed, or Glassdoor? One click saves it to your tracker with all the details auto-filled. No more copy-pasting job descriptions."
        features={[
          'Works on LinkedIn, Indeed, Glassdoor, and more',
          'Auto-extracts company, role, and location',
          'Detects duplicates before saving',
          'Instantly appears in your Kanban board'
        ]}
        screenshotAlt="Chrome extension interface"
        imagePosition="right"
        accentColor="violet"
      >
        <ExtensionPreview />
      </FeatureBlock>
    </section>
  );
}

// ============================================
// FEATURE BLOCK COMPONENT
// ============================================
function FeatureBlock({
  badge,
  title,
  description,
  features,
  children,
  imagePosition,
  accentColor
}: {
  badge: string;
  title: string;
  description: string;
  features: string[];
  children: React.ReactNode;
  screenshotAlt: string;
  imagePosition: 'left' | 'right';
  accentColor: 'violet' | 'blue' | 'emerald' | 'rose';
}) {
  const colorMap = {
    violet: { badge: 'bg-gray-100 text-gray-700', check: 'text-gray-900' },
    blue: { badge: 'bg-blue-100 text-blue-700', check: 'text-blue-500' },
    emerald: { badge: 'bg-emerald-100 text-emerald-700', check: 'text-emerald-500' },
    rose: { badge: 'bg-rose-100 text-rose-700', check: 'text-rose-500' },
  };
  const colors = colorMap[accentColor];

  const content = (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={imagePosition === 'right' ? fadeInLeft : fadeInRight}
      className="flex flex-col justify-center"
    >
      <span className={`inline-flex self-start px-3 py-1 rounded-full text-sm font-medium mb-4 ${colors.badge}`}>
        {badge}
      </span>
      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h3>
      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>
      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <svg className={`w-5 h-5 mt-0.5 ${colors.check}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );

  const screenshot = (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={imagePosition === 'right' ? fadeInRight : fadeInLeft}
      className="relative"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
      <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${imagePosition === 'left' ? 'lg:grid-flow-dense' : ''}`}>
        {imagePosition === 'left' ? (
          <>
            <div className="lg:col-start-1">{screenshot}</div>
            <div className="lg:col-start-2">{content}</div>
          </>
        ) : (
          <>
            {content}
            {screenshot}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// FEATURE PREVIEWS
// ============================================
function CVGeneratorPreview() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Generate Tailored CV</h4>
        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Ready</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Input side */}
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Job Description</p>
            <p className="text-sm text-gray-700">Senior Product Manager at Stripe - Lead payment infrastructure...</p>
          </div>
          <button className="w-full py-2 bg-black text-white text-sm font-medium rounded-lg">
            Generate Tailored CV
          </button>
        </div>
        {/* Output side */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">Your Tailored CV</p>
            <span className="text-xs text-gray-900 font-medium">Download PDF</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-gray-300 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-full" />
            <div className="h-2 bg-gray-200 rounded w-5/6" />
            <div className="h-2 bg-gray-400 rounded w-2/3" />
            <div className="h-2 bg-gray-200 rounded w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanPreview() {
  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex gap-3 min-w-[500px]">
        {[
          { title: 'Applied', count: 8, color: 'bg-blue-500' },
          { title: 'Interview', count: 3, color: 'bg-amber-500' },
          { title: 'Offer', count: 1, color: 'bg-green-500' },
        ].map((col, idx) => (
          <div key={idx} className="flex-1 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-sm font-medium text-gray-700">{col.title}</span>
              <span className="text-xs text-gray-400">{col.count}</span>
            </div>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-md p-2 shadow-sm border border-gray-100">
                  <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResearchPreview() {
  return (
    <div className="p-6">
      {/* Chat header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Research Chat</h4>
          <p className="text-sm text-gray-500">Ask anything about Stripe</p>
        </div>
      </div>

      {/* Chat messages */}
      <div className="space-y-3 mb-4">
        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-gray-900 text-white rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
            <p className="text-sm">What&apos;s Stripe&apos;s interview process like?</p>
          </div>
        </div>

        {/* AI response */}
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-emerald-100 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-xs text-emerald-600">AI</span>
          </div>
          <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
            <p className="text-sm text-gray-700">
              Stripe&apos;s interview typically includes 4-5 rounds: a recruiter screen, technical phone interview, and 3-4 onsite rounds covering system design, coding, and culture fit...
            </p>
          </div>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="flex flex-wrap gap-2">
        {['Company culture', 'Salary ranges', 'Recent news'].map((q, i) => (
          <span key={i} className="px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors">
            {q}
          </span>
        ))}
      </div>
    </div>
  );
}

function GmailSyncPreview() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Email Activity</h4>
        <span className="flex items-center gap-1 text-xs text-green-600">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Synced
        </span>
      </div>
      <div className="space-y-3">
        {[
          { from: 'Stripe Recruiting', subject: 'Interview Scheduled', status: 'Interview', time: '2h ago' },
          { from: 'Notion Careers', subject: 'Application Received', status: 'Applied', time: '1d ago' },
          { from: 'Linear Team', subject: 'Next Steps', status: 'Interview', time: '3d ago' },
        ].map((email, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
              {email.from[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{email.from}</p>
              <p className="text-xs text-gray-500 truncate">{email.subject}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-0.5 rounded ${email.status === 'Interview' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                {email.status}
              </span>
              <p className="text-xs text-gray-400 mt-1">{email.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExtensionPreview() {
  return (
    <div className="p-6">
      {/* Browser bar mockup */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500">
          linkedin.com/jobs/senior-engineer-stripe
        </div>
        <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      {/* Extension popup */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-[280px] mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Save to Canopy</span>
        </div>

        <div className="space-y-2 mb-4">
          <div>
            <p className="text-xs text-gray-500">Company</p>
            <p className="text-sm font-medium text-gray-900">Stripe</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Role</p>
            <p className="text-sm font-medium text-gray-900">Senior Software Engineer</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-medium text-gray-900">San Francisco, CA</p>
          </div>
        </div>

        <button className="w-full py-2 bg-black text-white text-sm font-medium rounded-lg">
          Save Job
        </button>
      </div>
    </div>
  );
}

// ============================================
// HOW IT WORKS
// ============================================
function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Save jobs instantly',
      description: 'Use our Chrome extension to save jobs from LinkedIn, Indeed, or any job board with one click.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      number: '2',
      title: 'Everything syncs',
      description: 'Connect Gmail and watch your applications update automatically. Interview invites, rejections — all tracked.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      number: '3',
      title: 'Research with AI',
      description: 'Ask anything about the company. Get culture insights, interview tips, and salary data instantly.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      number: '4',
      title: 'Apply with tailored CVs',
      description: 'AI rewrites your CV for each role in 30 seconds. Download the PDF and apply confidently.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Your entire job search, streamlined
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: idx * 0.1 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gray-300" />
              )}

              {/* Step circle */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="text-gray-700">{step.icon}</div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-black text-white text-sm font-bold rounded-full flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// TESTIMONIALS
// ============================================
function Testimonials() {
  const testimonials = [
    {
      quote: "The Chrome extension is a game changer. I save jobs from LinkedIn in one click while browsing, and they're all organized in my board when I'm ready to apply.",
      author: "Sarah Chen",
      role: "Senior Product Manager",
      result: "Hired at Stripe",
      avatar: "S"
    },
    {
      quote: "Gmail sync is magic. Applied to 47 jobs and never lost track of a single one. When Spotify called for an interview, I had all my research notes ready.",
      author: "Marcus Johnson",
      role: "Software Engineer",
      result: "Hired at Spotify",
      avatar: "M"
    },
    {
      quote: "The AI research chat told me exactly what to expect in my Notion interview. I walked in knowing their values, recent news, and the right questions to ask.",
      author: "Priya Patel",
      role: "Marketing Director",
      result: "3 offers in 4 weeks",
      avatar: "P"
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Success Stories
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Join thousands who landed their dream job
          </h2>
        </motion.div>

        {/* Testimonial grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t.author}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                  <p className="text-sm text-green-600 font-medium">{t.result}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// CTA SECTION
// ============================================
function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-gray-900 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gray-800 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-800 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          Your next job is out there. Go get it.
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Track every application, research any company, and generate tailored CVs — all in one place. Free to start.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/cv-input"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            style={{ color: '#000000' }}
          >
            Start Free - No Credit Card
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            View Pricing
          </a>
        </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-1.5 mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M3 18C3 10 7 4 12 4C17 4 21 10 21 18" stroke="url(#logo-gradient-footer)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6 17C6 11 8.5 6.5 12 6.5C15.5 6.5 18 11 18 17" stroke="url(#logo-gradient-footer)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 16C9 12 10.5 9 12 9C13.5 9 15 12 15 16" stroke="url(#logo-gradient-footer)" strokeWidth="1.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="logo-gradient-footer" x1="3" y1="4" x2="21" y2="18" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#059669"/>
                    <stop offset="1" stopColor="#0F766E"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-semibold text-gray-900">Canopy</span>
            </a>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your Job Search OS. Land faster.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
              <li><a href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            {new Date().getFullYear()} Canopy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
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

// ============================================
// MAIN LANDING PAGE
// ============================================
export default function LandingPage() {
  return (
    <main className="scroll-smooth bg-white">
      <Nav />
      <HeroSection />
      <LogoBar />
      <FeatureSections />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
