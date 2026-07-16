import { memo, useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import logoPng from '../assets/logo.png';
import '../styles/navbar.css';

/**
 * One structural navbar for all three shells; the `track` prop only changes
 * which links it carries (and the layout's theme class colours the CTA).
 *
 *  - neutral (no track): both tracks side by side, the visitor picks a lane
 *  - career / data: that track's own pages, plus a quiet link back to the
 *    other track so nobody gets locked into the wrong half of the business
 */
const LINKS = {
  neutral: [
    { to: '/data/services',   label: 'Data Services' },
    { to: '/career/services', label: 'Career Services' },
    { to: '/blog',            label: 'Insights' },
  ],
  data: [
    { to: '/data/services', label: 'Services' },
    { to: '/data/packages', label: 'Packages' },
    { to: '/data/about',    label: 'About' },
    { to: '/blog',          label: 'Insights' },
  ],
  career: [
    { to: '/career/services', label: 'Services' },
    { to: '/career/packages', label: 'Packages' },
    { to: '/career/about',    label: 'About' },
    { to: '/blog',            label: 'Insights' },
  ],
};

/* Cross-shell escape hatch, rendered smaller/quieter than the main links. */
const SWITCH = {
  data:   { to: '/career/services', label: 'Career Services ↗' },
  career: { to: '/data/services',   label: 'Data Services ↗' },
};

const CTA_TO = {
  neutral: '/data/contact',
  data:    '/data/contact',
  career:  '/career/contact',
};

const Navbar = memo(function Navbar({ track = null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  const key = track ?? 'neutral';
  const links = LINKS[key];
  const switchLink = SWITCH[key];
  const ctaTo = CTA_TO[key];

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__logo" onClick={close} aria-label="CareerDataSolutions home">
          <img src={logoPng} alt="CareerDataSolutions" className="navbar__logo-img" />
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
          <Link to={ctaTo} className="navbar__cta navbar__cta--pulse">
            Book a call
          </Link>
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
        <Link to={ctaTo} className="navbar__cta navbar__cta--pulse" onClick={close}>
          Book a call
        </Link>
      </nav>
    </header>
  );
});

export default Navbar;
