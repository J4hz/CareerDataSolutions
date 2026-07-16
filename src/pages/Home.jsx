import { memo } from 'react';
import { Link } from 'react-router-dom';
import { CALENDLY_URL } from '../config';
import { packages } from '../data/packages';
import { testimonials } from '../data/testimonials';
import { posts } from '../data/blog';
import { whyUs, dataProcess, careerProcess, dashboardStats } from '../data/process';
import { useInView } from '../hooks/useInView';
import PackagesCarousel from '../components/ui/PackagesCarousel';
import TestimonialCard from '../components/ui/TestimonialCard';
import BlogCard from '../components/ui/BlogCard';
import ProcessSteps from '../components/ui/ProcessSteps';
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

const departments = [
  { name: 'HR & Workforce', status: 'Live' },
  { name: 'Finance', status: 'Live' },
  { name: 'Operations & Logistics', status: 'Live' },
  { name: 'Supply Chain', status: 'Live' },
  { name: 'Sales & Marketing', status: 'Live' },
  { name: 'Executive', status: 'Live' },
  { name: 'Public Relations', status: 'Live' },
];

const pillarIcons = {
  chart: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1"  y="10" width="4" height="7" rx="1" fill="currentColor"/>
      <rect x="7"  y="6"  width="4" height="11" rx="1" fill="currentColor"/>
      <rect x="13" y="2"  width="4" height="15" rx="1" fill="currentColor"/>
    </svg>
  ),
  target: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
    </svg>
  ),
  pulse: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <polyline points="16.5 9 13.5 9 11.25 15.75 6.75 2.25 4.5 9 1.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const ProcessSection = memo(function ProcessSection() {
  return (
    <section className="section process" aria-labelledby="process-heading">
      <div className="container">
        <div className="process__header">
          <span className="eyebrow">How it works</span>
          <h2 id="process-heading">A clear process from brief to result</h2>
          <p>
            Both tracks follow the same sequence: understand the goal, build for
            real-world adoption, then measure what changed.
          </p>
        </div>

        <div className="process__track-block">
          <p className="process__track-label process__track-label--data">Data analytics process</p>
          <ProcessSteps steps={dataProcess} accentColor="var(--teal)" />
        </div>

        <div className="process__track-block">
          <p className="process__track-label process__track-label--career">Career services process</p>
          <ProcessSteps steps={careerProcess} accentColor="var(--gold)" />
        </div>
      </div>
    </section>
  );
});

export default function Home() {
  const [trustRef, trustInView] = useInView();
  const [servicesRef, servicesInView] = useInView();
  const [statsRef, statsInView] = useInView();
  const [whyRef, whyInView] = useInView();
  const [processRef, processInView] = useInView();
  const [aboutRef, aboutInView] = useInView();
  const [packagesRef, packagesInView] = useInView();
  const [testimonialsRef, testimonialsInView] = useInView();
  const [blogRef, blogInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  return (
    <main>
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-heading">
        <span className="hero__wm" aria-hidden="true">12</span>
        <div className="hero__inner">
          <h1 id="hero-heading">
            Data Driven <span style={{ color: 'var(--teal)' }}>Impact.</span>
            <br />
            Career Defining <span style={{ color: 'var(--gold)' }}>Results.</span>
          </h1>
          <p className="hero__sub">
            CareerDataSolutions bridges two worlds; transforming raw organizational data
            into actionable insights and propelling professionals towards thriving careers.
            Built on 12 years of real operational experience.
          </p>
          {/* Both tracks are above the fold and equal weight. A visitor should
              never have to guess which half of the business they are in — the
              old single "Explore services" link made them find out by clicking. */}
          <div className="hero__actions">
            <Link to="/data/services" className="btn btn--teal btn--lg">
              Data Services →
            </Link>
            <Link to="/career/services" className="btn btn--gold btn--lg">
              Career Services →
            </Link>
          </div>
          <p className="hero__secondary">
            Not sure which you need?{' '}
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
              Book a free discovery call
            </a>{' '}
            and we will point you at the right one.
          </p>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-num">12+</span>
              <span className="hero__stat-label">Years EMS operations</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-num">7</span>
              <span className="hero__stat-label">Departments dashboarded</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-num" style={{ color: 'var(--gold)' }}>2</span>
              <span className="hero__stat-label">Expert service tracks</span>
            </div>
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

      {/* WHY US */}
      <section
        ref={whyRef}
        className={`section why-us fade-up${whyInView ? ' is-visible' : ''}`}
        aria-labelledby="why-heading"
      >
        <div className="container">
          <div className="why-us__header">
            <span className="eyebrow">Why CareerDataSolutions</span>
            <h2 id="why-heading">What sets us apart</h2>
            <p>
              Most consultants learn their field from textbooks. Kabiru Nyabwengi
              learned it from 12 years of emergency operations where every data point
              had real consequences.
            </p>
          </div>

          <div className="why-us__layout">
            <div className="why-us__pillars">
              {whyUs.map((p) => (
                <div key={p.id} className="why-us__pillar">
                  <div className="why-us__pillar-icon">
                    {pillarIcons[p.icon]}
                  </div>
                  <div>
                    <h3>{p.title}</h3>
                    <p>{p.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <aside className="why-us__panel" aria-label="Founder quote and dashboard stats">
              <span className="why-us__initials" aria-hidden="true">KN</span>
              <blockquote className="why-us__quote">
                "I didn't start as a data analyst behind a desk. I built my career in
                the field, where every data point represented a real decision."
              </blockquote>
              <p className="why-us__attr">
                Kabiru Nyabwengi | Founder · CareerDataSolutions · 12 Yrs EMS
              </p>

              <p className="why-us__chart-label">Data Analytics — 7-department dashboard coverage</p>
              <div className="why-us__bars">
                {dashboardStats.map((bar) => (
                  <div key={bar.label} className="why-us__bar-row">
                    <span className="why-us__bar-label">{bar.label}</span>
                    <div className="why-us__bar-track">
                      <div
                        className="why-us__bar-fill"
                        style={{ width: `${bar.value}%`, background: bar.color || 'var(--teal)' }}
                      />
                    </div>
                    <span className="why-us__bar-pct">{bar.value}%</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <div
        ref={processRef}
        className={`fade-up${processInView ? ' is-visible' : ''}`}
      >
        <ProcessSection />
      </div>

      {/* HOME PACKAGES */}
      <section
        ref={packagesRef}
        className={`section home-packages fade-up${packagesInView ? ' is-visible' : ''}`}
        aria-labelledby="packages-heading"
        style={{ overflow: 'hidden' }}
      >
        <div className="container">
          <div className="home-packages__header">
            <span className="eyebrow">Pricing</span>
            <h2 id="packages-heading">Packages built for every stage</h2>
            <p className="home-packages__sub">
              Local KES pricing for Kenya. USD rates for international and Upwork
              projects. All packages include clear timelines and revision rounds.
            </p>
          </div>
          <PackagesCarousel packages={packages} />
        </div>
      </section>

      {/* ABOUT SNIPPET */}
      <section
        ref={aboutRef}
        className={`section about-snippet fade-up${aboutInView ? ' is-visible' : ''}`}
        aria-labelledby="about-snippet-heading"
      >
        <div className="container">
          <div className="about-snippet__layout">
            <div className="about-snippet__left">
              <span className="eyebrow">About Kabiru</span>
              <h2 id="about-snippet-heading">12 years in the field.</h2>
              <div className="about-snippet__story">
                <p>
                  CareerDataSolutions was built on a simple idea: the same discipline
                  that keeps emergency operations running can make organizational data
                  and professional careers perform better.
                </p>
                <p>
                  I spent over a decade coordinating emergency medical services, managing
                  operations, building teams, and turning messy field data into decisions
                  that mattered under pressure. Not once from behind a desk.
                </p>
                <p>
                  That background shapes everything I build. I designed Power BI dashboards
                  across 7 departments: HR & Workforce, Finance, Operations & Logistics,
                  Supply Chain, Sales & Marketing, Executive, and Public Relations.
                  I streamlined claims workflows using
                  Excel automation that gave teams back hours of manual processing time
                  every week.
                </p>
                <p>
                  Now I channel that experience through CareerDataSolutions, helping
                  organizations make their data work harder and professionals make their
                  careers move faster.
                </p>
              </div>
              <div className="about-snippet__tags">
                {['Microsoft Power BI', 'Advanced Excel', 'SQL', 'ATS Optimization', 'LinkedIn Strategy', 'EMS Operations', 'Data Storytelling'].map((tag) => (
                  <span key={tag} className="about-snippet__tag">{tag}</span>
                ))}
              </div>
            </div>

            <aside className="about-snippet__card" aria-label="Dashboard departments">
              <p className="about-snippet__card-title">Power BI dashboards built across</p>
              <ul className="about-snippet__dept-list">
                {departments.map((d) => (
                  <li key={d.name} className="about-snippet__dept-item">
                    <span className="about-snippet__dept-name">{d.name}</span>
                    <span className="about-snippet__dept-status">{d.status}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        ref={testimonialsRef}
        className={`section testimonials fade-up${testimonialsInView ? ' is-visible' : ''}`}
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
          <div className="testimonials__grid">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section
        ref={blogRef}
        className={`section blog-preview fade-up${blogInView ? ' is-visible' : ''}`}
        aria-labelledby="blog-preview-heading"
      >
        <div className="container">
          <div className="blog-preview__header">
            <span className="eyebrow">Insights from the field</span>
            <h2 id="blog-preview-heading">Knowledge that moves you forward</h2>
          </div>
          <div className="blog-preview__grid">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
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
