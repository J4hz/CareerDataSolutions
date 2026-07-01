import { memo } from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_URL } from '../config';

const CTASection = memo(function CTASection() {
  return (
    <section className="cta-section" aria-labelledby="cta-heading">
      <div className="cta-section__inner">
        <h2 id="cta-heading">
          Ready to get <span style={{ color: 'var(--teal)' }}>clear</span> on your data. Or your career?
        </h2>
        <p className="cta-section__sub">
          Book a free 30-minute discovery call. No commitment. We'll map out exactly
          what's possible and what it would cost.
        </p>
        <div className="cta-section__actions">
          <Link to="/contact" className="btn btn--teal btn--lg">
            Book a discovery call
          </Link>
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
      </div>
    </section>
  );
});

export default CTASection;
