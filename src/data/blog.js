export const posts = [
  {
    id: "healthcare-power-bi-kenya",
    slug: "/blog/healthcare-power-bi-kenya",
    category: "Data analytics",
    categoryColor: "teal",
    headerBg: "linear-gradient(135deg, #0B1F3A 0%, #1a3a6b 100%)",
    title:
      "Why Healthcare Organizations in Kenya Are Leaving Money on the Table — And How a Power BI Dashboard Fixes It",
    excerpt:
      "Most healthcare teams in Kenya are sitting on goldmines of operational data with no way to read it. Here's the five-step framework I use to turn that data into decisions.",
    author: "Kabiru Nyabwengi",
    readTime: "8 min read",
    body: `
Most healthcare organizations in Kenya generate enormous volumes of data every single day — patient records, billing cycles, claims submissions, procurement logs, staff attendance, bed occupancy rates. And most of it sits in spreadsheets nobody reads, or systems nobody built reports from.

I've seen this pattern repeatedly across my years in EMS operations. The data exists. The decision-makers exist. The gap is the bridge between them.

**Why the data goes unused**

The first reason is structural: data collection and decision-making are handled by different people with different priorities. The clinician documents the patient. The administrator approves the budget. Nobody is explicitly responsible for connecting those two streams into something actionable.

The second reason is technical: most organizations rely on Excel workbooks that were built for reporting, not for analysis. They capture what happened. They don't help you understand why, or what to do about it.

**The five-step framework**

1. **Audit what data you actually have.** Before building anything, I map every data source — billing systems, HR records, procurement spreadsheets, ERP exports. Most organizations discover they have more structured data than they thought.

2. **Identify the three decisions that matter most.** Every executive has three or four decisions they make repeatedly that would benefit from better information. We build for those first, not for comprehensive coverage.

3. **Clean and model the data.** Raw operational data is messy. Patient IDs don't match across systems. Dates are inconsistent. This step takes the longest, but it's what makes everything downstream reliable.

4. **Build the dashboard for the person who will use it.** A finance director needs margin visibility. An operations head needs throughput metrics. The dashboard should answer their questions without requiring them to learn Power BI.

5. **Embed the dashboard into the weekly workflow.** A dashboard nobody opens is a dashboard that doesn't exist. We design for adoption from day one — the right metrics, the right view, available before the Monday meeting starts.

**What changes when this works**

A healthcare NGO I worked with went from weekly Excel-based reporting — which took three people two days to compile — to a live Power BI dashboard their regional directors could open from any device. Claims backlogs became visible in real time. Procurement bottlenecks surfaced before they caused stockouts.

The data was always there. The decisions just had nowhere to land.

If your organization is sitting on operational data that isn't driving decisions yet, that's a solvable problem — and it doesn't require a six-month IT project to fix it.
    `.trim(),
    inlineCta:
      "Need a dashboard like this for your organization? Book a free discovery call.",
  },
  {
    id: "cv-not-getting-responses",
    slug: "/blog/cv-not-getting-responses",
    category: "Career strategy",
    categoryColor: "gold",
    headerBg: "linear-gradient(135deg, #0B1F3A 0%, #1a3460 100%)",
    title:
      "The 5 Reasons Your CV Isn't Getting Responses — And What to Do About Each One",
    excerpt:
      "After reviewing hundreds of CVs from Kenyan professionals, I keep seeing the same five mistakes. None are about qualifications. All are fixable in under an hour.",
    author: "Kabiru Nyabwengi",
    readTime: "6 min read",
    body: `
After reviewing hundreds of CVs from Kenyan professionals targeting local and international roles, I keep seeing the same five mistakes. None of them are about qualifications. All of them are fixable.

**1. The CV isn't passing the ATS filter**

Most employers — especially UK, US, and UAE organizations — use applicant tracking systems to screen CVs before a human ever reads them. If your CV isn't formatted correctly, or doesn't contain the right keywords, it gets filtered out automatically.

The fix: strip out tables, text boxes, headers, and footers. Use a single-column layout. Mirror the exact language from the job description — if they say "stakeholder management," don't write "client relationship management."

**2. The summary section does nothing**

"Results-driven professional with excellent communication skills and a passion for excellence." This line appears, word for word, on more CVs than I can count. It tells a hiring manager nothing.

The fix: write a summary that names your field, your years of experience, your specialist area, and one measurable result. Three sentences maximum. Make it specific enough that it could only be written by you.

**3. Job descriptions list duties, not achievements**

"Responsible for managing the finance team." That tells me what your job description said. It doesn't tell me what happened because you were in the role.

The fix: rewrite every bullet point as an achievement. Use the formula: action verb + what you did + measurable result. "Led a four-person finance team, reducing month-end close time from 8 days to 3 days through process standardization."

**4. The CV is trying to be everything to everyone**

A CV that lists every job and every responsibility across a 15-year career is not a CV — it's a job history. Recruiters spend an average of 7 seconds on initial screening. You need to make the relevant parts unmissable.

The fix: tailor your CV to each role. Identify the three most relevant experiences and push them to the top. Cut anything that doesn't support your case for this specific role.

**5. The formatting makes it hard to read**

Dense paragraphs, inconsistent fonts, no white space, long lines that run edge to edge. A CV that's hard to scan gets skipped.

The fix: use a clean, one-column layout. Short bullet points. Consistent font (one for headings, one for body). Margins that give the text room to breathe. One or two pages maximum — never three.

**The underlying pattern**

Every one of these mistakes has the same root cause: the CV is written from the applicant's perspective rather than the recruiter's. The question to ask with every line is not "what do I want to say?" but "what does a recruiter need to see in 7 seconds to put this in the yes pile?"

That shift in perspective is what separates a CV that gets ignored from one that gets responses.
    `.trim(),
    inlineCta:
      "Want your CV reviewed for free? Book a call and we'll tell you exactly what's holding it back.",
  },
];
