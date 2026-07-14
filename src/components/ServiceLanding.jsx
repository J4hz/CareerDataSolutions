import { Link } from 'react-router-dom';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';
import ProcessSteps from './ui/ProcessSteps';
import '../styles/landing.css';
import '../styles/button.css';

/**
 * The shared body of /data-services and /career-services.
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
  };

  return (
    <main className="lp" style={accentVars} data-track={track.id}>
      {/* HERO */}
      <section className="lp-hero" aria-labelledby="lp-heading">
        <div className="container lp-hero__inner">
          <span className="lp-hero__eyebrow">{track.eyebrow}</span>
          <h1 id="lp-heading" className="lp-hero__title">
            {track.title}
            <br />
            <span className="lp-hero__title-accent">{track.titleAccent}</span>
          </h1>
          <p className="lp-hero__intro">{track.intro}</p>

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
      </section>

      {/* DELIVERABLES */}
      <section className="section lp-deliverables" aria-labelledby="lp-deliverables-heading">
        <div className="container">
          <span className="eyebrow lp-eyebrow">Scope</span>
          <h2 id="lp-deliverables-heading">{track.deliverablesTitle}</h2>

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

      {/* AUDIENCE */}
      <section className="section lp-audience" aria-labelledby="lp-audience-heading">
        <div className="container lp-audience__layout">
          <div>
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

      {/* PROCESS */}
      <section className="section lp-process" aria-labelledby="lp-process-heading">
        <div className="container">
          <span className="eyebrow lp-eyebrow">How it works</span>
          <h2 id="lp-process-heading">{track.processTitle}</h2>
          <div className="lp-process__steps">
            <ProcessSteps steps={track.process} accentColor={track.accent} />
          </div>
        </div>
      </section>

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
