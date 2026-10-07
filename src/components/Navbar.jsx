import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
/* Shared with the closing CTA band's dropdown — see src/data/booking.js. */
import { BOOK_OPTIONS } from '../data/booking';
import ThemeToggle from './ThemeToggle';
// Built from the vector brand definition in scripts/brand/ by
// scripts/logo-svg.js: transparent background, and a reversed copy for dark
// mode.
import logo from '../assets/generated/logo.svg';
import logoReversed from '../assets/generated/logo-reversed.svg';
import '../styles/navbar.css';

/**
 * One structural navbar for all three shells; the `track` prop only changes
 * which links it carries (and the layout's theme class colours the CTA).
 *
 *  - neutral (no track): both tracks side by side, the visitor picks a lane
 *  - career / data: that track's own pages, plus a quiet link back to the
 *    other track so nobody gets locked into the wrong half of the business
 */
/* The Insights (/blog) entries are intentionally absent from all three
   shells. The blog pages and posts still exist on disk (pages/Blog.jsx,
   pages/BlogPost.jsx, data/blog.js); restore a { to: '/blog', label:
   'Insights' } entry here, plus the routes in App.jsx and the entries in
   seo/meta.js and seo/schema.js, to bring it back.

   About sits on the neutral shell too, pointing at the neutral /about rather
   than into a track: a visitor who has not picked a lane should not be handed
   one by a link about the founder. The page content is identical on all three
   routes; only the accent and the closing CTA differ. */
const LINKS = {
  neutral: [
    { to: '/data/services',   label: 'Data Services' },
    { to: '/career/services', label: 'Career Services' },
    { to: '/about',           label: 'About' },
  ],
  data: [
    { to: '/data/services', label: 'Services' },
    { to: '/data/packages', label: 'Packages' },
    { to: '/data/about',    label: 'About' },
  ],
  career: [
    { to: '/career/services', label: 'Services' },
    { to: '/career/packages', label: 'Packages' },
    { to: '/career/about',    label: 'About' },
  ],
};

/* Cross-shell escape hatch, rendered smaller/quieter than the main links. */
const SWITCH = {
  data:   { to: '/career/services', label: 'Career Services ↗' },
  career: { to: '/data/services',   label: 'Data Services ↗' },
};

const Navbar = memo(function Navbar({ track = null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const bookRef = useRef(null);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close the booking menu on outside click or Escape.
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

  const close = useCallback(() => {
    setOpen(false);
    setBookOpen(false);
  }, []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  const key = track ?? 'neutral';
  const links = LINKS[key];
  const switchLink = SWITCH[key];

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__logo" onClick={close} aria-label="CareerDataSolutions home">
          {/* Both marks ship, and theme-toggle-aware CSS in navbar.css shows
              one. An <img> cannot inherit the page's colour or see
              data-theme, so a single self-theming file is not an option --
              see the note in scripts/logo-svg.js.

              width/height are the asset's own, not the rendered size: the
              CSS pins the height and lets width follow, and these give the
              browser the ratio to reserve the box before the image lands.

              The reversed copy is lazy: a visitor who never uses dark mode
              should not pay for it. The alt text sits on the light one only,
              so the mark is announced once rather than twice. */}
          <img
            src={logo}
            alt="CareerDataSolutions"
            className="navbar__logo-img navbar__logo-img--light"
            width="1609"
            height="270"
          />
          <img
            src={logoReversed}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="navbar__logo-img navbar__logo-img--dark"
            width="1609"
            height="270"
          />
        </NavLink>

        <nav className="navbar__nav" aria-label="Main navigation">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          {switchLink && (
            <NavLink to={switchLink.to} className="navbar__link navbar__link--switch">
              {switchLink.label}
            </NavLink>
          )}
        </nav>

        <div className="navbar__end">
          <div className="navbar__book" ref={bookRef}>
            <button
              type="button"
              className="navbar__cta navbar__cta--book navbar__cta--pulse"
              aria-haspopup="menu"
              aria-expanded={bookOpen}
              onClick={() => setBookOpen((v) => !v)}
            >
              Book a discovery call
              <svg className="navbar__cta-caret" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {bookOpen && (
              <div className="navbar__book-menu" role="menu">
                <span className="navbar__book-title">Book a call for</span>
                {BOOK_OPTIONS.map((o) => (
                  <Link
                    key={o.to}
                    to={o.to}
                    role="menuitem"
                    className={`navbar__book-item navbar__book-item--${o.track}`}
                    onClick={close}
                  >
                    {o.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button
            className={`navbar__burger${open ? ' navbar__burger--open' : ''}`}
            onClick={toggle}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
            <span />
          </button>
          {/* Last element on the bar, so it sits hard against the right
              edge in both layouts: after the CTA on desktop, after the
              burger below 768px. One DOM position serves both, and it
              stays in the bar rather than falling into the drawer.

              It stays visually quiet -- no fill, no border -- so that
              being the rightmost thing does not make it compete with the
              filled, pulsing CTA beside it. */}
          <ThemeToggle />
        </div>
      </div>

      <nav className={`navbar__mobile${open ? ' is-open' : ''}`} aria-label="Mobile navigation">
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} className="navbar__link" onClick={close}>
            {label}
          </NavLink>
        ))}
        {switchLink && (
          <NavLink to={switchLink.to} className="navbar__link navbar__link--switch" onClick={close}>
            {switchLink.label}
          </NavLink>
        )}
        <div className="navbar__mobile-book">
          <span className="navbar__book-title">Book a call for</span>
          {BOOK_OPTIONS.map((o) => (
            <Link
              key={o.to}
              to={o.to}
              className={`navbar__cta navbar__cta--book navbar__cta--book-${o.track}`}
              onClick={close}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
});

export default Navbar;
