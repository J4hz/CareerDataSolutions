import { Link } from 'react-router-dom';
import { dataFaqs, careerFaqs } from '../data/faqs';
import { useInView } from '../hooks/useInView';
import TestimonialsMarquee from '../components/TestimonialsMarquee';
import FaqAccordion from '../components/FaqAccordion';
import CTASection from '../components/CTASection';
import '../styles/home.css';
import '../styles/button.css';

const trustItems = [
  'Excel and Power BI visualization expert',
  'ATS-optimized CV writing',
  'LinkedIn profile optimization',
  'Local KES & international USD pricing',
  'M-Pesa · Payoneer · Bank transfer',
];

const statsBar = [
  { num: '12', label: 'Years of operational data experience in EMS', color: 'var(--teal)' },
  { num: '7', label: 'Departments dashboarded\nHR & Workforce · Finance · Operations & Logistics · Supply Chain · Sales & Marketing · Public Relations · Executive', color: 'var(--teal)' },
  { num: '2', label: 'Service specialities, one trusted consultancy', color: 'var(--gold)' },
];

export default function Home() {
  const [trustRef, trustInView] = useInView();
  const [servicesRef, servicesInView] = useInView();
  const [statsRef, statsInView] = useInView();
  const [testimonialsRef, testimonialsInView] = useInView();
  const [faqRef, faqInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  return (
    <main>
      {/* HERO
          Two-track thesis made spatial: the headline colours its own key words
          (data teal, careers gold), then the two advantages sit side by side —
          data left, career right — each a bulleted pitch with its own accent
          glow and track-coloured CTA. Teal glow anchors the left, gold the
          right, so the split reads before a single word is. */}
      <section className="hero" aria-labelledby="hero-heading">
        <span className="hero__wm" aria-hidden="true">12</span>
        <div className="hero__inner">
          <div className="hero__head">
            <p className="hero__kicker">
              <span className="hero__kicker--data">Precision for your data.</span>{' '}
              <span className="hero__kicker--career">Clarity for your career.</span>
            </p>

            <h1 id="hero-heading" className="hero__title">
              We turn <span className="hero__hl hero__hl--data">data</span> into decisions,
              and <span className="hero__hl hero__hl--career">careers</span> into direction.
            </h1>
          </div>

          <div className="hero__tracks">
            <article className="hero__track hero__track--data">
              <div className="hero__track-head">
                <span className="hero__track-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                    <rect x="1"  y="10" width="4" height="7"  rx="1" fill="currentColor" />
                    <rect x="7"  y="6"  width="4" height="11" rx="1" fill="currentColor" />
                    <rect x="13" y="2"  width="4" height="15" rx="1" fill="currentColor" />
                  </svg>
                </span>
                <p className="hero__track-label">Data advantage</p>
              </div>
              <ul className="hero__track-list">
                <li>Dashboards and reporting</li>
                <li>Business performance analysis</li>
                <li>Data-driven forecasting and planning</li>
              </ul>
              <Link to="/data/services" className="btn btn--teal btn--lg hero__track-cta">
                Explore data services →
              </Link>
            </article>

            <div className="hero__track-divider" aria-hidden="true" />

            <article className="hero__track hero__track--career">
              <div className="hero__track-head">
                <span className="hero__track-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                    <path d="M2 12.5 7 7.5l3 3 5.5-5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11.5 5h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="hero__track-label">Career advantage</p>
              </div>
              <ul className="hero__track-list">
                <li>CV and LinkedIn optimisation</li>
                <li>Cover letter/Resume tailored for specific roles</li>
                <li>Interview coaching</li>
                <li>Job search strategy</li>
              </ul>
              <Link to="/career/services" className="btn btn--gold btn--lg hero__track-cta">
                Advance my career →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div
        ref={trustRef}
        className={`trust-bar fade-up${trustInView ? ' is-visible' : ''}`}
        role="list"
        aria-label="Service highlights"
      >
        <div className="trust-bar__inner">
          {trustItems.map((item) => (
            <div key={item} className="trust-bar__item" role="listitem">
              <span className="trust-bar__check" aria-hidden="true">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* PATH SELECTOR — the two cards that hand the visitor into the
          gold career shell or the teal data shell. Adapted from the
          reference file's .path-card pattern. This is the one place the
          two accents appear side by side, so they are named explicitly
          rather than themed via --accent. */}
      <section
        ref={servicesRef}
        className={`section paths fade-up${servicesInView ? ' is-visible' : ''}`}
        aria-labelledby="paths-heading"
      >
        <div className="container">
          <div className="paths__header">
            <span className="eyebrow" style={{ color: 'var(--ink-soft)' }}>Two paths, one method</span>
            <h2 id="paths-heading">Tell us which problem you have</h2>
            <p className="paths__subtext">
              Everything on this site splits based on your needs — pick your lane
              and skip straight to what matters to you.
            </p>
          </div>

          <div className="paths__grid">
            <article className="path-card path-card--data">
              <span className="path-card__eyebrow">For Businesses</span>
              <h3 className="path-card__title">Turn scattered data into a dashboard you actually check</h3>
              <ul className="path-card__list">
                <li>Custom Power BI and Excel dashboards built from your existing sales, operations, HR, or finance data</li>
                <li>We clean and structure messy or scattered data as part of the engagement — you don't need it "ready" first</li>
                <li>Single-department builds in 5–10 business days; multi-source builds in 2–4 weeks</li>
                <li>Live, visual reporting that replaces "we think" with "we know"</li>
              </ul>
              <Link to="/data/services" className="btn btn--teal">
                Explore Data Services →
              </Link>
            </article>

            <article className="path-card path-card--career">
              <span className="path-card__eyebrow">For Professionals</span>
              <h3 className="path-card__title">Get your experience past the ATS software and propel your career</h3>
              <ul className="path-card__list">
                <li>ATS-optimized CVs built to parse cleanly and read well — for the system and the recruiter</li>
                <li>Cover letters and resumes tailored to the specific roles you're targeting, not generic templates</li>
                <li>LinkedIn optimization available bundled or standalone, written for discoverability, not duplication</li>
                <li>Positioning and interview coaching, not just documents</li>
              </ul>
              <Link to="/career/services" className="btn btn--gold">
                Explore Career Services →
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div
        ref={statsRef}
        className={`stats-bar fade-up${statsInView ? ' is-visible' : ''}`}
        role="list"
        aria-label="Key statistics"
      >
        <div className="stats-bar__inner">
          {statsBar.map((s) => (
            <div key={s.num} className="stats-bar__item" role="listitem">
              <span className="stats-bar__num" style={{ color: s.color }}>{s.num}</span>
              <span className="stats-bar__label" style={{ whiteSpace: 'pre-line' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS — an auto-scrolling wall of client results, in the slot
          the old "why us" block used to hold. */}
      <section
        ref={testimonialsRef}
        className={`section testimonials-auto fade-up${testimonialsInView ? ' is-visible' : ''}`}
        id="testimonials"
        aria-labelledby="testimonials-heading"
      >
        <div className="container">
          <div className="testimonials__header">
            <span className="eyebrow">Client results</span>
            <h2 id="testimonials-heading">What clients say</h2>
            <p>
              Real results from professionals and organizations who trusted
              CareerDataSolutions with what matters most.
            </p>
          </div>
        </div>
        <TestimonialsMarquee />
      </section>

      {/* FAQ — two questions from each track, side by side. Each column is
          wrapped in its track theme, so the accordion accent reads teal for
          data and gold for career. */}
      <section
        ref={faqRef}
        className={`section home-faq fade-up${faqInView ? ' is-visible' : ''}`}
        aria-labelledby="home-faq-heading"
      >
        <div className="container">
          <div className="home-faq__header">
            <span className="eyebrow">Questions</span>
            <h2 id="home-faq-heading">Frequently asked questions</h2>
            <p>
              A quick answer from each side of the business. Find the rest on the
              data and career services pages.
            </p>
          </div>

          <div className="home-faq__grid">
            <div className="home-faq__col theme-data">
              <p className="home-faq__col-label home-faq__col-label--data">Data services</p>
              <FaqAccordion items={dataFaqs.slice(0, 2)} />
            </div>
            <div className="home-faq__col theme-career">
              <p className="home-faq__col-label home-faq__col-label--career">Career services</p>
              <FaqAccordion items={careerFaqs.slice(0, 2)} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div
        ref={ctaRef}
        className={`fade-up${ctaInView ? ' is-visible' : ''}`}
      >
        <CTASection />
      </div>
    </main>
  );
}
