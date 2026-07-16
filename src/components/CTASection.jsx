import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';

const HEADLINES = {
  neutral: <>Ready to get <span style={{ color: 'var(--accent)' }}>clear</span> on your data. Or your career?</>,
  data:    <>Ready to get <span style={{ color: 'var(--accent)' }}>clear</span> on your data?</>,
  career:  <>Ready to get <span style={{ color: 'var(--accent)' }}>clear</span> on your career?</>,
};

/**
 * Closing CTA band. Track-aware: inside a themed shell the primary button
 * goes to that track's contact page and takes the shell's accent; the
 * neutral version keeps the old behavior (data call first, career link
 * underneath).
 */
const CTASection = memo(function CTASection({ track = null }) {
  const key = track ?? 'neutral';
  const contactTo = track === 'career' ? '/career/contact' : '/data/contact';
  const primaryLabel = track === 'career' ? 'Get a free CV review' : 'Book a discovery call';

  return (
    <section className="cta-section" aria-labelledby="cta-heading">
      <span className="cta-section__wm" aria-hidden="true">CDS</span>
      <div className="cta-section__inner">
        <h2 id="cta-heading">{HEADLINES[key]}</h2>
        <p className="cta-section__sub">
          Book a free 30-minute discovery call. No commitment. We'll map out exactly
          what's possible and what it would cost.
        </p>
        <div className="cta-section__actions">
          <NavLink to={contactTo} className="btn btn--accent btn--lg btn--pulse">
            {primaryLabel}
          </NavLink>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--whatsapp btn--lg"
          >
            Chat on WhatsApp
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="btn btn--ghost btn--lg"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        {track !== 'career' && (
          <NavLink to="/career/contact" className="cta-sec__career-link">
            Submitting a CV for career services? Start here →
          </NavLink>
        )}
      </div>
    </section>
  );
});

export default CTASection;
