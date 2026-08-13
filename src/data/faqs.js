// ─────────────────────────────────────────────────────────────
// FAQ content for the two service pages.
//
// Read by TWO consumers, which must stay in sync:
//   • components/ServiceLanding.jsx (via data/tracks.js) — the visible
//     accordion on /data/services and /career/services
//   • src/seo/schema.js — the FAQPage JSON-LD emitted on those routes
//
// Keep this file free of React/browser code: schema.js runs in Node at
// build time (scripts/prerender.js).
//
// Originally ported from the old reference/careerdatasolutions-rebuild.html
// mockup (#faq-data and #faq-career), lightly rewritten, plus one extra
// question per track grounded in the site's real packages and process. That
// mockup has since been deleted — it was never imported or served, and this
// file is now the source of truth for the FAQs.
// ─────────────────────────────────────────────────────────────

export const dataFaqs = [
  {
    q: 'What is a Power BI dashboard, and why does my business actually need one?',
    a: 'A Power BI dashboard pulls your existing data (sales, operations, HR, finance) into a single, live, visual report so you can see trends and make decisions without digging through spreadsheets. Businesses need one when they are making decisions based on outdated reports, gut feeling, or data scattered across multiple systems. A well-built dashboard turns "we think" into "we know."',
  },
  {
    q: 'How long does it take to build a custom dashboard?',
    a: 'A standard single-department dashboard (for example, sales or operations) typically takes 5–10 business days from data access to delivery. More complex, multi-source dashboards can take 2–4 weeks. Timelines depend on how clean and accessible your existing data is, which is assessed on the discovery call, so you get a realistic date before anything is committed.',
  },
  {
    q: 'What if our data is messy or spread across multiple systems?',
    a: 'That is normal, and it is part of the job. Cleaning and structuring scattered or inconsistent data is built into every engagement rather than treated as a prerequisite you need to solve first. The discovery call is where we map out what sources exist and how they will be brought together. If your data is in a genuinely unusable state (for example, no digital records at all), that gets flagged upfront so expectations on timeline and cost stay realistic.',
  },
  {
    q: 'How is the work priced, and when do I know what it will cost?',
    a: 'The tiers on this page are starting points rather than fixed packages, because dashboard and automation work varies too much by data complexity to price sight-unseen. After the free discovery call you get a written scope and a fixed price for the agreed deliverables, before any work begins. If requirements expand later (new data sources, additional views), that is scoped and quoted separately rather than folded into the original price.',
  },
  {
    q: 'Do you offer ongoing support after the dashboard is delivered?',
    a: 'Yes. Every engagement includes a defined support window after delivery, and the Automation Partner tier includes ongoing monthly maintenance for teams whose data or reporting needs keep evolving.',
  },
  {
    q: 'Can you work with the tools we already use (Excel, Google Sheets, existing databases)?',
    a: 'Yes. Dashboards and automations are built around your existing systems rather than requiring you to migrate to new software. Power BI, Excel, and most common business data sources are supported; anything unusual gets confirmed on the discovery call.',
  },
];

export const careerFaqs = [
  {
    q: 'What actually makes a CV "ATS-optimized"?',
    a: 'Applicant Tracking Systems (ATS) scan CVs for relevant keywords, standard formatting, and clear section headers before a human ever sees them. An ATS-optimized CV uses formatting the software can parse correctly (no complex tables, graphics-as-text, or unusual fonts), mirrors language from the job description where genuinely accurate, and is structured so both the software and a recruiter can quickly find what they are looking for.',
  },
  {
    q: 'Do you offer LinkedIn optimization along with CV writing, or are they separate services?',
    a: 'Both. They are offered as a bundle and separately. A CV and a LinkedIn profile should tell a consistent story but are not identical documents. LinkedIn is written for discoverability and networking, while a CV is written for a specific role. Most clients get more value from doing both together, since recruiters typically cross-check one against the other.',
  },
  {
    q: 'How do I know if my current CV is actually the problem?',
    a: 'If you are applying regularly and hearing nothing back, not even a rejection, the CV is often failing at the ATS stage before a human ever opens it. If you are getting interviews but not offers, the document is doing its job and the gap is more likely positioning or interview performance. A free CV review can usually tell you which situation you are in before you commit to a rewrite or a coaching package.',
  },
  {
    q: 'How long does a CV rewrite take?',
    a: 'Most CV packages deliver in 3–7 business days depending on seniority: entry-level documents come back in about 3 days, while mid-level packages that include a modern resume, cover letter, LinkedIn optimization and interview preparation run 5–7. Every package includes at least one defined revision round.',
  },
];
