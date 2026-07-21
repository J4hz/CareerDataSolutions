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
  title: 'Your data already knows.',
  titleAccent: 'Make it say it out loud.',
  intro:
    'Power BI dashboards, Excel automation and operational reporting for organizations that are collecting plenty of data and deciding on none of it. Built by someone who spent 12 years inside operations, so the dashboard speaks your team\'s language on day one, and actually gets opened on a Monday morning.',

  primaryCta: { label: 'Book a free discovery call', to: '/data/contact' },
  secondaryCta: { label: 'See packages & pricing', to: '/data/packages' },

  stats: [
    { num: '7', label: 'Departments dashboarded' },
    { num: '12', label: 'Years of operational data experience' },
    { num: '30 min', label: 'Free discovery call, no obligation' },
  ],

  deliverablesTitle: 'What you get',
  deliverables: [
    {
      title: 'Power BI dashboard design & build',
      body: 'Multi-department dashboards designed around the three or four decisions you actually make every week, not around everything the data could theoretically show.',
    },
    {
      title: 'Excel workflow automation',
      body: 'The recurring workbook that eats two days of someone\'s week, rebuilt to run itself. Data digitization for anything still living on paper.',
    },
    {
      title: 'Healthcare & operations reporting',
      body: 'Claims backlogs, procurement bottlenecks, bed occupancy, throughput. Domain-specific reporting from someone who has worked the operational side of it.',
    },
    {
      title: 'KPI tracking & executive dashboards',
      body: 'A single view a director can open on any device and immediately know whether this week is on track.',
    },
  ],

  audienceTitle: 'This is for you if',
  audience: [
    'Your reporting is a spreadsheet three people rebuild by hand every week',
    'Decisions are being made on gut feel because the numbers arrive too late',
    'You have data across billing, HR, procurement and ops that has never been joined up',
    'A previous dashboard was built, delivered, and never opened again',
  ],

  processTitle: 'How a data engagement runs',
  process: dataProcess,

  faqTitle: 'Data analytics, answered',
  faqs: dataFaqs,

  closingTitle: 'Start with a conversation, not a contract.',
  closingBody:
    'A free 30-minute discovery call to map what data you already have and what decisions it should be driving. If a dashboard is not the right answer, we will tell you that.',
};

export const careerTrack = {
  id: 'career',
  // Resolved by the .theme-career class on <CareerLayout>.
  accent: 'var(--accent)',
  accentSoft: 'var(--accent-soft)',
  accentGlow: 'var(--accent-glow)',
  buttonClass: 'btn--accent',

  eyebrow: 'Career advancement services',
  title: 'We turn your job search',
  titleAccent: 'into a job offer.',
  intro:
    'CV and LinkedIn optimisation, interview coaching, and job search strategy, every step, covered.',

  primaryCta: { label: 'View packages', to: '/career/packages' },
  secondaryCta: { label: 'Book a consultation', to: '/career/contact' },

  stats: [
    { num: '1 day', label: 'Turnaround on your free CV assessment' },
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

  processTitle: 'How a career engagement runs',
  process: careerProcess,

  faqTitle: 'CVs and careers, answered',
  faqs: careerFaqs,

  closingTitle: 'Send the CV you have, not the one you think we want.',
  closingBody:
    'The review is free and the feedback is honest, including telling you if your CV is already fine and the problem is somewhere else. No obligation to buy anything.',
};
