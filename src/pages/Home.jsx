import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { CALENDLY_URL } from '../config';
import { services } from '../data/services';
import { packages } from '../data/packages';
import { testimonials } from '../data/testimonials';
import { posts } from '../data/blog';
import { whyUs, dataProcess, careerProcess, dashboardStats } from '../data/process';
import ServiceCard from '../components/ui/ServiceCard';
import PackageCard from '../components/ui/PackageCard';
import TestimonialCard from '../components/ui/TestimonialCard';
import BlogCard from '../components/ui/BlogCard';
import ProcessSteps from '../components/ui/ProcessSteps';
import CTASection from '../components/CTASection';
import '../styles/home.css';
import '../styles/button.css';

const trustItems = [
  'Power BI dashboard expert',
  'ATS-optimized CV writing',
  'LinkedIn profile optimization',
  'Local KES & international USD pricing',
  'M-Pesa · PayPal · Bank transfer',
];

const statsBar = [
  { num: '7', label: 'Departments dashboarded\nHR · Finance · Operations · Procurement · BD · Executive · PR' },
  { num: '12', label: 'Years of operational data experience in EMS' },
  { num: '2', label: 'Service specialisms, one trusted consultancy' },
];

const departments = [
  { name: 'HR & Workforce', status: 'Live' },
  { name: 'Finance', status: 'Live' },
  { name: 'Operations & Logistics', status: 'Live' },
  { name: 'Procurement', status: 'Live' },
  { name: 'Business Development', status: 'Live' },
  { name: 'Executive Leadership', status: 'Live' },
  { name: 'PR & Communications', status: 'Live' },
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
  check: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 9.5L7 13.5L15 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const ProcessSection = memo(function ProcessSection() {
  const [tab, setTab] = useState('data');
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

        <div className="process__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'data'}
            className={`process__tab${tab === 'data' ? ' active' : ''}`}
            onClick={() => setTab('data')}
          >
            Data analytics process
          </button>
          <button
            role="tab"
            aria-selected={tab === 'career'}
            className={`process__tab${tab === 'career' ? ' active' : ''}`}
            onClick={() => setTab('career')}
          >
            Career services process
          </button>
        </div>

        <ProcessSteps steps={tab === 'data' ? dataProcess : careerProcess} />
      </div>
    </section>
  );
});

export default function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__inner">
          <h1 id="hero-heading">
            Data that speaks. Careers that land.
          </h1>
          <p className="hero__sub">
            CareerDataSolutions bridges two worlds: turning raw organizational data into
            actionable Power BI dashboards, and professionals into interview-ready
            candidates. Built on 12 years of real operational experience.
          </p>
          <div className="hero__actions">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--lg"
            >
              Book a free discovery call
            </a>
            <Link to="/services" className="btn btn--ghost btn--lg">
              Explore services →
            </Link>
          </div>
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
              <span className="hero__stat-num">2</span>
              <span className="hero__stat-label">Expert service tracks</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="trust-bar" role="list" aria-label="Service highlights">
        <div className="trust-bar__inner">
          {trustItems.map((item) => (
            <div key={item} className="trust-bar__item" role="listitem">
              <span className="trust-bar__check" aria-hidden="true">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES OVERVIEW */}
      <section className="section services-overview" aria-labelledby="services-heading">
        <div className="container">
          <div className="services-overview__header">
            <span className="eyebrow">What we do</span>
            <h2 id="services-heading">Two specialisms. One clear goal.</h2>
            <p className="services-overview__subtext">
              Whether you need your data to work harder or your career to move faster,
              CareerDataSolutions delivers measurable results, not just documents.
            </p>
          </div>
          <div className="services-overview__grid">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar" role="list" aria-label="Key statistics">
        <div className="stats-bar__inner">
          {statsBar.map((s) => (
            <div key={s.num} className="stats-bar__item" role="listitem">
              <span className="stats-bar__num">{s.num}</span>
              <span className="stats-bar__label" style={{ whiteSpace: 'pre-line' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WHY US */}
      <section className="section why-us" aria-labelledby="why-heading">
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
              <blockquote className="why-us__quote">
                "I didn't start as a data analyst behind a desk. I built my career in
                the field — where every data point represented a real decision."
              </blockquote>
              <p className="why-us__attr">
                Kabiru Nyabwengi | Founder · CareerDataSolutions · 12 Yrs EMS
              </p>

              <p className="why-us__chart-label">Power BI — 7-dept dashboard coverage</p>
              <div className="why-us__bars">
                {dashboardStats.map((bar) => (
                  <div key={bar.label} className="why-us__bar-row">
                    <span className="why-us__bar-label">{bar.label}</span>
                    <div className="why-us__bar-track">
                      <div
                        className="why-us__bar-fill"
                        style={{ width: `${bar.value}%` }}
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
      <ProcessSection />

      {/* ABOUT SNIPPET */}
      <section className="section about-snippet" aria-labelledby="about-snippet-heading">
        <div className="container">
          <div className="about-snippet__layout">
            <div className="about-snippet__left">
              <span className="eyebrow">About Kabiru</span>
              <h2 id="about-snippet-heading">12 years in the field.</h2>
              <div className="about-snippet__story">
                <p>
                  I spent over a decade coordinating emergency medical services, managing
                  operations, building teams, and turning messy field data into decisions
                  that mattered under pressure. Not once from behind a desk.
                </p>
                <p>
                  That background shapes everything I build. I designed Power BI dashboards
                  across 7 departments: HR, Finance, Operations, Procurement, Business
                  Development, Executive, and PR. I streamlined claims workflows using
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

      {/* HOME PACKAGES */}
      <section className="section home-packages" aria-labelledby="packages-heading">
        <div className="container">
          <div className="home-packages__header">
            <span className="eyebrow">Pricing</span>
            <h2 id="packages-heading">Packages built for every stage</h2>
            <p className="home-packages__sub">
              Local KES pricing for Kenya. USD rates for international and Upwork
              projects. All packages include clear timelines and revision rounds.
            </p>
          </div>
          <div className="home-packages__grid">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} compact />
            ))}
          </div>
          <div className="home-packages__cta">
            <Link to="/packages" className="btn btn--ghost-dark btn--lg">
              View all packages &amp; book a call →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonials" id="testimonials" aria-labelledby="testimonials-heading">
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
      <section className="section blog-preview" aria-labelledby="blog-preview-heading">
        <div className="container">
          <div className="blog-preview__header">
            <span className="eyebrow">Insights from the field</span>
            <h2 id="blog-preview-heading">Field notes and practical guides</h2>
          </div>
          <div className="blog-preview__grid">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </main>
  );
}
