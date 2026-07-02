import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { WHATSAPP_URL } from '../config';

const CTASection = memo(function CTASection() {
  return (
    <section className="cta-section" aria-labelledby="cta-heading">
      <span className="cta-section__wm" aria-hidden="true">CDS</span>
      <div className="cta-section__inner">
        <h2 id="cta-heading">
          Ready to get <span style={{ color: 'var(--teal)' }}>clear</span> on your data. Or your career?
        </h2>
        <p className="cta-section__sub">
          Book a free 30-minute discovery call. No commitment. We'll map out exactly
          what's possible and what it would cost.
        </p>
        <div className="cta-section__actions">
          <NavLink to="/contact/data" className="btn btn--teal btn--lg btn--pulse">
            Book a discovery call
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
            href="mailto:contact@careerdatasolutions.co.ke"
            className="btn btn--ghost btn--lg"
          >
            contact@careerdatasolutions.co.ke
          </a>
        </div>
        <NavLink to="/contact/career" className="cta-sec__career-link">
          Submitting a CV for career services? Start here →
        </NavLink>
      </div>
    </section>
  );
});

export default CTASection;
