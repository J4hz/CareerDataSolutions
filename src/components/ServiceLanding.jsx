import { Link } from 'react-router-dom';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';
import ProcessSteps from './ui/ProcessSteps';
import FaqAccordion from './FaqAccordion';
// import TestimonialCard from './ui/TestimonialCard';  — restore with the testimonials section
import PackageCard from './ui/PackageCard';
import DataFlowViz from './ui/DataFlowViz';
// import { testimonials } from '../data/testimonials';  — restore with the testimonials section
import { dataPackages, careerPackages } from '../data/packages';
import '../styles/packages.css';
import '../styles/landing.css';
import '../styles/button.css';

/**
 * The shared body of /data/services and /career/services.
 *
 * Both tracks get the same layout grammar, type scale and section rhythm as
 * the rest of the site — the only thing that differs is the accent colour,
 * piped in as a CSS custom property, and the words. That is deliberate: the
 * two pages should read as two rooms in one building, not two buildings.
 *
 * See src/data/tracks.js for the copy.
 */
export default function ServiceLanding({ track }) {
  const accentVars = {
    '--lp-accent': track.accent,
    '--lp-accent-soft': track.accentSoft,
    '--lp-accent-glow': track.accentGlow,
    // The accent darkened enough to read as text on the white body below the
    // hero; --lp-accent stays the bright one for fills and for the hero,
    // where it sits on navy. See the --accent-ink note in styles/theme.css.
    '--lp-accent-ink': track.accentInk,
  };

  /* Restore with the testimonials section further down. Shows this track's own
     client results; below two, a filtered grid reads as "we have one happy
     client" rather than as focus, so the full set is shown instead — remove
     the fallback once each track has two of its own.

  const ownTestimonials = testimonials.filter((t) => t.track === track.id);
  const shownTestimonials = ownTestimonials.length >= 2 ? ownTestimonials : testimonials;
  */

  return (
    <main className="lp" style={accentVars} data-track={track.id}>
      {/* HERO — one centred column on both tracks. Where the track brings a
          visual (track.showHeroViz) it sits below the copy rather than beside
          it, so the headline is centred the same way on every service page. */}
      <section className="lp-hero" aria-labelledby="lp-heading">
        <div className="container lp-hero__inner">
          <div className="lp-hero__copy">
            <h1 id="lp-heading" className="lp-hero__title">
              {track.title}
              <br />
              <span className="lp-hero__title-accent">{track.titleAccent}</span>
            </h1>
            <p className="lp-hero__intro">{track.intro}</p>

            {/* The one claim that is about the person rather than the work.
                Opt-in per track via track.heroNote. The star is the mark from
                the original data-services mockup, kept as an outline so it
                reads as a hallmark stamped beside the line rather than as a
                rating. It replaced a bar-per-year ramp; see the git history
                for that version. */}
            {track.heroNote && (
              <div className="lp-hero__note">
                <svg
                  className="lp-hero__note-star"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 21 12 17.77 5.8 21 7 14.14l-5-4.87 7.1-1.01z" />
                </svg>
                <p className="lp-hero__note-text">
                  <strong>{track.heroNote.lead}</strong> {track.heroNote.body}
                </p>
              </div>
            )}

            <div className="lp-hero__actions">
              <Link to={track.primaryCta.to} className={`btn btn--lg ${track.buttonClass}`}>
                {track.primaryCta.label} →
              </Link>
              <Link to={track.secondaryCta.to} className="btn btn--lg btn--ghost">
                {track.secondaryCta.label}
              </Link>
            </div>

            <dl className="lp-hero__stats">
              {track.stats.map((stat) => (
                <div key={stat.label} className="lp-hero__stat">
                  <dt className="lp-hero__stat-num">{stat.num}</dt>
                  <dd className="lp-hero__stat-label">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {track.showHeroViz && <DataFlowViz />}
        </div>
      </section>

      {/* DELIVERABLES
          id="deliverables" stays a link target, but nothing in the site
          points at it today: the footer used to, and now sends visitors to
          the top of the page instead of part-way down into this list. Kept
          because it is a stable anchor someone may have linked to, and
          because App.jsx already honours a hash on navigation. */}
      <section
        id="deliverables"
        className="section lp-deliverables"
        aria-labelledby="lp-deliverables-heading"
      >
        <div className="container">
          <span className="eyebrow lp-eyebrow">Scope</span>
          <h2 id="lp-deliverables-heading">{track.deliverablesTitle}</h2>
          {track.deliverablesIntro && (
            <p className="lp-section__intro">{track.deliverablesIntro}</p>
          )}

          <div className="lp-deliverables__grid">
            {track.deliverables.map((item) => (
              <article key={item.title} className="lp-card">
                <h3 className="lp-card__title">{item.title}</h3>
                <p className="lp-card__body">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES — opt-in per track via track.showPackages (see
          src/data/tracks.js). Cards come from the same src/data/packages.js
          the /career/packages page uses, so pricing lives in one place. */}
      {track.showPackages && (
        <section className="section lp-packages" aria-labelledby="lp-packages-heading">
          <div className="container">
            <span className="eyebrow lp-eyebrow">{track.packagesEyebrow ?? 'Pricing'}</span>
            <h2 id="lp-packages-heading">{track.packagesTitle}</h2>
            {track.packagesIntro && (
              <p className="lp-section__intro">{track.packagesIntro}</p>
            )}

            {/* Framing callout: on the data track the numbers below are
                starting points, and saying so before the cards is the
                difference between a quote and a broken promise. */}
            {track.packagesNote && (
              <p className="lp-packages__note">
                <strong>{track.packagesNote.lead}</strong> {track.packagesNote.body}
              </p>
            )}

            <div className="packages-page__grid">
              {(track.id === 'career' ? careerPackages : dataPackages).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>

            {track.packagesFine && (
              <p className="lp-packages__fine">{track.packagesFine}</p>
            )}
          </div>
        </section>
      )}

      {/* AUDIENCE ("Fit") — HIDDEN FROM THE LIVE SITE.
          Kept here rather than deleted so it can be restored: uncomment the
          block below to bring it back. The backing copy is untouched in
          src/data/tracks.js (track.audienceTitle / track.audience) and the
          styles remain in src/styles/landing.css (.lp-audience*).

      <section className="section lp-audience" aria-labelledby="lp-audience-heading">
        <div className="container lp-audience__layout">
          <div className="lp-audience__intro">
            <span className="eyebrow lp-eyebrow">Fit</span>
            <h2 id="lp-audience-heading">{track.audienceTitle}</h2>
          </div>
          <ul className="lp-audience__list">
            {track.audience.map((line) => (
              <li key={line} className="lp-audience__item">
                <span className="lp-audience__check" aria-hidden="true">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
      */}

      {/* TESTIMONIALS — HIDDEN FROM THE LIVE SITE, along with the marquee on
          the homepage (src/pages/Home.jsx). Uncomment to restore; the quotes
          in src/data/testimonials.js, the shared TestimonialCard and the
          .lp-testimonials* styles in src/styles/landing.css are untouched.
          Restore the two imports and the shownTestimonials block at the top
          of this file at the same time.

      <section className="section lp-testimonials" aria-labelledby="lp-testimonials-heading">
        <div className="container">
          <span className="eyebrow lp-eyebrow">Client results</span>
          <h2 id="lp-testimonials-heading">What clients say</h2>
          <div className="lp-testimonials__grid">
            {shownTestimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>
      */}

      {/* PROCESS — opt-in per track via track.showProcess (see
          src/data/tracks.js). Currently on for data and off for career; the
          career copy is left intact there so it can be switched back on. */}
      {track.showProcess && (
        <section className="section lp-process" aria-labelledby="lp-process-heading">
          <div className="container">
            <span className="eyebrow lp-eyebrow">How it works</span>
            <h2 id="lp-process-heading">{track.processTitle}</h2>
            <div className="lp-process__steps">
              <ProcessSteps steps={track.process} accentColor={track.accent} />
            </div>
          </div>
        </section>
      )}

      {/* FAQ — content in data/faqs.js; the matching FAQPage JSON-LD is
          emitted per-route by src/seo/schema.js from the same data. */}
      {track.faqs && (
        <section id="faq" className="section lp-faq" aria-labelledby="lp-faq-heading">
          <div className="container">
            <div className="lp-faq__head">
              <span className="eyebrow lp-eyebrow">Common questions</span>
              <h2 id="lp-faq-heading">{track.faqTitle}</h2>
            </div>
            <FaqAccordion items={track.faqs} />
          </div>
        </section>
      )}

      {/* CLOSING CTA */}
      <section className="lp-cta" aria-labelledby="lp-cta-heading">
        <div className="container lp-cta__inner">
          <h2 id="lp-cta-heading" className="lp-cta__title">{track.closingTitle}</h2>
          <p className="lp-cta__body">{track.closingBody}</p>

          <div className="lp-cta__actions">
            <Link to={track.primaryCta.to} className={`btn btn--lg ${track.buttonClass}`}>
              {track.primaryCta.label} →
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--lg btn--whatsapp"
            >
              Chat on WhatsApp
            </a>
          </div>

          <a href={`mailto:${CONTACT_EMAIL}`} className="lp-cta__email">
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </main>
  );
}
