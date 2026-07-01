import { memo, useState, useEffect, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import logoPng from '../assets/logo.png';
import '../styles/navbar.css';

const Navbar = memo(function Navbar() {
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

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__logo" onClick={close} aria-label="CareerDataSolutions home">
          <img src={logoPng} alt="CareerDataSolutions" className="navbar__logo-img" />
        </NavLink>

        <nav className="navbar__nav" aria-label="Main navigation">
          <NavLink to="/services" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
            Services
          </NavLink>
          <NavLink to="/packages" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
            Packages
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
            About
          </NavLink>
          <NavLink to="/blog" className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}>
            Insights
          </NavLink>
        </nav>

        <div className="navbar__end">
          <Link to="/contact" className="navbar__cta">
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
        <NavLink to="/services" className="navbar__link" onClick={close}>Services</NavLink>
        <NavLink to="/packages" className="navbar__link" onClick={close}>Packages</NavLink>
        <NavLink to="/about" className="navbar__link" onClick={close}>About</NavLink>
        <NavLink to="/blog" className="navbar__link" onClick={close}>Insights</NavLink>
        <Link to="/contact" className="navbar__cta" onClick={close}>
          Book a call
        </Link>
      </nav>
    </header>
  );
});

export default Navbar;
