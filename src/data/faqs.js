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
// Ported from reference/careerdatasolutions-rebuild.html (#faq-data and
// #faq-career), lightly rewritten, plus one extra question per track
// grounded in the site's real packages and process.
// ─────────────────────────────────────────────────────────────

export const dataFaqs = [
  {
    q: 'What is a Power BI dashboard, and why does my business actually need one?',
    a: 'A Power BI dashboard pulls your existing data — sales, operations, HR, finance — into a single, live, visual report so you can see trends and make decisions without digging through spreadsheets. Businesses need one when they are making decisions based on outdated reports, gut feeling, or data scattered across multiple systems. A well-built dashboard turns "we think" into "we know."',
  },
  {
    q: 'How long does it take to build a custom dashboard?',
    a: 'A standard single-department dashboard (for example, sales or operations) typically takes 5–10 business days from data access to delivery. More complex, multi-source dashboards can take 2–4 weeks. Timelines depend on how clean and accessible your existing data is — which is assessed in the initial discovery call, so you get a realistic date before anything is committed.',
  },
  {
    q: 'Do I need to have clean, organized data before working with you?',
    a: 'No. Most clients come in with messy or scattered data — that is expected. Structuring and cleaning your data is part of the engagement, not a precondition for it. If your data is in a genuinely unusable state (for example, no digital records at all), that gets flagged upfront so expectations on timeline and cost stay realistic.',
  },
  {
    q: 'How does a data engagement start?',
    a: 'With a free 30-minute discovery call — no obligation. We map what data you already have and what decisions it should be driving, and you get an honest read on scope and cost before committing to anything. If a dashboard is not the right answer for your situation, we will tell you that on the call.',
  },
];

export const careerFaqs = [
  {
    q: 'What actually makes a CV "ATS-optimized"?',
    a: 'Applicant Tracking Systems (ATS) scan CVs for relevant keywords, standard formatting, and clear section headers before a human ever sees them. An ATS-optimized CV uses formatting the software can parse correctly — no complex tables, graphics-as-text, or unusual fonts — mirrors language from the job description where genuinely accurate, and is structured so both the software and a recruiter can quickly find what they are looking for.',
  },
  {
    q: 'Do you offer LinkedIn optimization along with CV writing, or are they separate services?',
    a: 'Both. They are offered as a bundle and separately. A CV and a LinkedIn profile should tell a consistent story but are not identical documents — LinkedIn is written for discoverability and networking, while a CV is written for a specific role. Most clients get more value from doing both together, since recruiters typically cross-check one against the other.',
  },
  {
    q: 'How do I know if my current CV is actually the problem?',
    a: 'If you are applying regularly and hearing nothing back — not even a rejection — the CV is often failing at the ATS stage before a human ever opens it. If you are getting interviews but not offers, the document is doing its job and the gap is more likely positioning or interview performance. A free CV review can usually tell you which situation you are in before you commit to a rewrite or a coaching package.',
  },
  {
    q: 'How long does a CV rewrite take?',
    a: 'Most CV packages deliver in 3–7 business days depending on seniority: entry-level documents come back in about 3 days, while mid-level packages that include a modern resume, cover letter, LinkedIn optimization and interview preparation run 5–7. Every package includes at least one defined revision round.',
  },
];
