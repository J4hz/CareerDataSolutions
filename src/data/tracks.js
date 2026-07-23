// ─────────────────────────────────────────────────────────────
// Copy for the two dedicated landing pages, /data/services and
// /career/services.
//
// The pages render from one shared component (components/ServiceLanding.jsx),
// so the layout grammar, spacing and type scale stay identical between the
// two tracks and only the accent colour and the words change. If you find
// yourself wanting a structural difference between them, add it here as data
// rather than forking the component — two half-diverged page layouts is how a
// design system dies.
// ─────────────────────────────────────────────────────────────

import { dataProcess, careerProcess } from './process.js';
import { dataFaqs, careerFaqs } from './faqs.js';

export const dataTrack = {
  id: 'data',
  // Resolved by the .theme-data class on <DataLayout>; the page itself
  // never names a colour, so the theme swap stays a one-line CSS change.
  accent: 'var(--accent)',
  accentSoft: 'var(--accent-soft)',
  accentGlow: 'var(--accent-glow)',
  // primaryCta is a booking, so it takes the orange booking colour rather
  // than the track accent — same button as the navbar.
  buttonClass: 'btn--cta',

  eyebrow: 'Data Services',
  title: 'We turn your scattered data',
  titleAccent: 'into decisions you can act on.',
  intro:
    'Power BI dashboards, Excel automation and reporting systems built from the data you already have. It does not need to be "ready" first, and it does not need to live in one place. Built by someone who spent 12 years inside operations, so the dashboard speaks your team\'s language on day one and actually gets opened on a Monday morning.',

  primaryCta: { label: 'Book a free discovery call', to: '/data/contact' },
  secondaryCta: { label: 'See scope tiers & pricing', to: '/data/packages' },

  /* Two stats, not three: the hero runs beside the source-data visual on this
     track (showHeroViz below), so the row has half the width it does on the
     career page. */
  stats: [
    { num: '5–10 days', label: 'Turnaround on a single-department dashboard' },
    { num: 'Free', label: 'Discovery call before you commit to anything' },
  ],

  /* HIDDEN FOR NOW. Set back to true to bring back the animated "scattered
     points to ordered bars" panel that sits below the hero copy. The
     component (components/ui/DataFlowViz.jsx) and its styles (.lp-viz* in
     src/styles/landing.css) are untouched, so this flag is the only switch.
     Data track only either way: it is a literal picture of what the service
     does, and would mean nothing on the career page. */
  showHeroViz: false,

  deliverablesTitle: 'What you get',
  deliverablesIntro:
    'Four things every engagement is built around, whichever tier fits your situation.',
  deliverables: [
    {
      title: 'Custom Power BI dashboards',
      body: 'Built from your existing data (e.g. sales, operations, HR or finance). Live and interactive, not a static export you have to re-request every week.',
    },
    {
      title: 'Excel automation & reporting',
      body: 'The manual weekly report, rebuilt so it updates itself. Less time copying and pasting, more time using the numbers.',
    },
    {
      title: 'Data cleaning & structuring',
      body: 'Messy, scattered or multi-source data sorted, standardized and connected as part of the engagement. You do not need clean data to start.',
    },
    {
      title: 'Forecasting & performance analysis',
      body: 'Historical data turned into forward-looking input for budgeting, staffing or planning decisions.',
    },
  ],

  /* Cards come from src/data/packages.js and are shared with /data/packages,
     so a price is never maintained in two places. The note and fine print are
     the whole point of this block on the data side: these are scope tiers a
     visitor self-selects into, not a menu they buy from. */
  showPackages: true,
  packagesEyebrow: 'Scope tiers',
  packagesTitle: 'How the quoting actually works',
  packagesIntro:
    'Every engagement starts with a free discovery call, where we look at your real data before anything is quoted.',
  packagesNote: {
    lead: 'These are starting points, not fixed packages.',
    body: 'Dashboard and automation work varies too much by data complexity to price sight-unseen. The tiers below help you self-select. You get an exact quote and timeline after the discovery call, before any work begins.',
  },
  packagesFine:
    'After the discovery call you receive a written scope and fixed price for the agreed deliverables before work starts, so there are no surprise costs mid-project. If requirements expand after that point (new data sources, additional views), that is scoped and quoted separately rather than folded into the original price.',

  audienceTitle: 'This is for you if',
  audience: [
    'Your reporting is a spreadsheet three people rebuild by hand every week',
    'Decisions are being made on gut feel because the numbers arrive too late',
    'You have data across billing, HR, procurement and ops that has never been joined up',
    'A previous dashboard was built, delivered, and never opened again',
  ],

  /* Process block is hidden on /data/services too, matching the career page.
     Set showProcess back to true to restore it; the five steps are untouched
     in src/data/process.js. */
  showProcess: false,
  processTitle: 'Five steps, start to finish',
  process: dataProcess,

  faqTitle: 'Data services, answered',
  faqs: dataFaqs,

  closingTitle: 'Stop reporting from memory. See it live.',
  closingBody:
    'Book a free 30-minute discovery call. No commitment: we map out exactly what is possible with your data and what it would cost. If a dashboard is not the right answer, we will tell you that.',
};

export const careerTrack = {
  id: 'career',
  // Resolved by the .theme-career class on <CareerLayout>.
  accent: 'var(--accent)',
  accentSoft: 'var(--accent-soft)',
  accentGlow: 'var(--accent-glow)',
  buttonClass: 'btn--accent',

  eyebrow: 'Career advancement services',
  // Split so the payoff lands on its own line in gold — ServiceLanding.jsx
  // renders titleAccent as the coloured second line.
  title: 'We turn your potential',
  titleAccent: 'into real career growth.',
  intro:
    'CV and LinkedIn optimisation, interview coaching, and job search strategy, every step, covered.',

  primaryCta: { label: 'View packages', to: '/career/packages' },
  secondaryCta: { label: 'Book a consultation', to: '/career/contact' },

  stats: [
    { num: '1 day', label: 'Turnaround on your free CV review' },
    { num: 'Free', label: 'Honest review before you pay anything' },
  ],

  deliverablesTitle: 'What you get',
  deliverables: [
    {
      title: 'ATS-optimized CV writing',
      body: 'Keyword-engineered against real postings for your target role, so the screening software passes you through to a human in the first place.',
    },
    {
      title: 'LinkedIn profile optimization',
      body: 'Rebuilt for recruiter search: the headline, the About section and the experience entries that determine whether you surface at all.',
    },
    {
      title: 'Cover letters that are actually read',
      body: 'Tailored to a specific role rather than a template with the company name swapped in.',
    },
    {
      title: 'Interview prep & job search strategy',
      body: 'Where to apply, how to position 12 years of experience for a market that has never heard of your last employer, and how to answer the question you are dreading.',
    },
  ],

  /* Renders the packages block on the services page, straight after the
     deliverables. Opt-in per track: set this on dataTrack to show the data
     packages on /data/services too. Copy for the cards lives in
     src/data/packages.js and is shared with the /career/packages page, so
     prices are never maintained in two places. */
  showPackages: true,
  packagesTitle: 'Packages and pricing',

  audienceTitle: 'This is for you if',
  audience: [
    'You are qualified for the roles you apply to and hearing nothing back',
    'You are moving from the Kenyan market into the UK, US or Gulf and the rules are different',
    'Your CV is a list of duties rather than a record of what changed because you were there',
    'Recruiters are not finding you on LinkedIn and you do not know why',
  ],

  /* Process block is hidden on /career/services — set showProcess back to
     true to restore it. The copy below is kept deliberately. */
  showProcess: false,
  processTitle: 'How a career engagement runs',
  process: careerProcess,

  faqTitle: 'CVs and careers, answered',
  faqs: careerFaqs,

  closingTitle: 'Send the CV you have, not the one you think we want.',
  closingBody:
    'The review is free and the feedback is honest, including telling you if your CV is already fine and the problem is somewhere else. No obligation to buy anything.',
};
