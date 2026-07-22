import { memo, useEffect, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BOOK_OPTIONS } from '../data/booking';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';

/* "clear" stays white in every variant; the track noun carries the colour —
   data teal, career gold. Inside a themed shell var(--accent) already
   resolves to the right one, so the split reads the same everywhere. */
const HEADLINES = {
  neutral: (
    <>
      Ready to get <span style={{ color: 'var(--white)' }}>clear</span> on your{' '}
      <span style={{ color: 'var(--teal)' }}>data</span>. Or your{' '}
      <span style={{ color: 'var(--gold)' }}>career</span>?
    </>
  ),
  data:    <>Ready to get <span style={{ color: 'var(--white)' }}>clear</span> on your <span style={{ color: 'var(--accent)' }}>data</span>?</>,
  career:  <>Ready to get <span style={{ color: 'var(--white)' }}>clear</span> on your <span style={{ color: 'var(--accent)' }}>career</span>?</>,
};

/**
 * Closing CTA band.
 *
 * Outside the career shell the primary action is a booking, and "Book a
 * discovery call" does not say which kind — so it opens the same two-way
 * dropdown the navbar uses, sharing its options from src/data/booking.js.
 * That replaced the "Submitting a CV for career services?" link that used to
 * sit under the buttons: the menu now offers the career route directly, so
 * the footnote was saying the same thing twice.
 *
 * Inside the career shell the action is a free CV review rather than a
 * booking, so it stays a single link on the track accent.
 */
const CTASection = memo(function CTASection({ track = null }) {
  const key = track ?? 'neutral';
  const isBooking = track !== 'career';

  const [bookOpen, setBookOpen] = useState(false);
  const bookRef = useRef(null);

  // Close on outside click or Escape, matching the navbar dropdown.
  useEffect(() => {
    if (!bookOpen) return undefined;
    const onDown = (e) => {
      if (bookRef.current && !bookRef.current.contains(e.target)) setBookOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setBookOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [bookOpen]);

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
          {isBooking ? (
            <div className="cta-section__book" ref={bookRef}>
              <button
                type="button"
                className="btn btn--cta btn--lg btn--pulse cta-section__book-btn"
                aria-haspopup="menu"
                aria-expanded={bookOpen}
                onClick={() => setBookOpen((v) => !v)}
              >
                Book a discovery call
                <svg
                  className={`cta-section__caret${bookOpen ? ' is-open' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 4.5 6 8l3.5-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {bookOpen && (
                <div className="cta-section__book-menu" role="menu">
                  <span className="cta-section__book-title">Book a call for</span>
                  {BOOK_OPTIONS.map((o) => (
                    <Link
                      key={o.to}
                      to={o.to}
                      role="menuitem"
                      className={`cta-section__book-item cta-section__book-item--${o.track}`}
                      onClick={() => setBookOpen(false)}
                    >
                      {o.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/career/contact" className="btn btn--accent btn--lg btn--pulse">
              Get a free CV review
            </NavLink>
          )}

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
      </div>
    </section>
  );
});

export default CTASection;
