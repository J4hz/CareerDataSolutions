import { memo } from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';
import logoStacked from '../assets/logo-stacked.jpg';
import '../styles/footer.css';

/**
 * One structural footer for all three shells. Both tracks' columns are
 * always present — the footer is the cross-navigation surface of the split,
 * so a visitor deep in /career/* can still find the data side. The `track`
 * prop only decides where track-ambiguous links (About, Book a call) land;
 * the layout's theme class handles the accent colour.
 */
const Footer = memo(function Footer({ track = null }) {
  // Neutral shell has no About of its own; it hands off to the data side,
  // mirroring the /about → /data/about redirect in vercel.json.
  const aboutTo = track === 'career' ? '/career/about' : '/data/about';
  const contactTo = track === 'career' ? '/career/contact' : '/data/contact';

  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <div className="footer__brand-logo">
            <img
              src={logoStacked}
              alt="CareerDataSolutions"
              style={{
                height: '88px',
                width: 'auto',
                display: 'block',
                background: 'var(--white)',
                borderRadius: '10px',
                padding: '6px 10px',
              }}
            />
          </div>
          <p className="footer__tagline">
            Data Driven Impact. Career Defining Results. Based in Nairobi, Kenya.
            Serving clients locally and globally.
          </p>
        </div>

        {/* Each line goes to the track that actually delivers it. */}
        <div className="footer__col">
          <h3 className="footer__col-title">Data Services</h3>
          <ul>
            <li><Link to="/data/services">Power BI dashboards</Link></li>
            <li><Link to="/data/services">Excel automation</Link></li>
            <li><Link to="/data/services">KPI &amp; executive reporting</Link></li>
            <li><Link to="/data/packages">Packages &amp; pricing</Link></li>
          </ul>

          <h3 className="footer__col-title footer__col-title--stacked">Career Services</h3>
          <ul>
            <li><Link to="/career/services">CV writing</Link></li>
            <li><Link to="/career/services">LinkedIn optimization</Link></li>
            <li><Link to="/career/services">Career coaching</Link></li>
            <li><Link to="/career/packages">Packages &amp; pricing</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__col-title">Company</h3>
          <ul>
            <li><Link to={aboutTo}>About Kabiru</Link></li>
            <li><Link to="/#testimonials">Testimonials</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__col-title">Contact</h3>
          <ul>
            <li>
              <Link to={contactTo}>Book a discovery call</Link>
            </li>
            <li>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                WhatsApp us
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              {/* Replace with Instagram or LinkedIn profile URL */}
              <a href="#social" aria-label="CareerDataSolutionsKE social profile">
                @CareerDataSolutionsKE
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © 2026 CareerDataSolutions. All rights reserved. · Nairobi, Kenya
        </p>
        <nav className="footer__platforms" aria-label="External platforms">
          <a href="#upwork" rel="noopener noreferrer">Upwork</a>
          <a href="#linkedin" rel="noopener noreferrer">LinkedIn</a>
          <a href="#google" rel="noopener noreferrer">Google Business</a>
        </nav>
      </div>
    </footer>
  );
});

export default Footer;
