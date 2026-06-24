import { memo } from 'react';
import { Link } from 'react-router-dom';
import { CALENDLY_URL, WHATSAPP_URL } from '../config';
import '../styles/footer.css';

const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <div className="footer__brand-logo">
            Career<span>Data</span>Solutions
          </div>
          <p className="footer__tagline">
            Data-Driven Insights. Career-Defining Results. Based in Nairobi, Kenya.
            Serving clients locally and globally.
          </p>
        </div>

        <div className="footer__col">
          <h3 className="footer__col-title">Services</h3>
          <ul>
            <li><Link to="/services">Power BI dashboards</Link></li>
            <li><Link to="/services">Excel automation</Link></li>
            <li><Link to="/services">CV writing</Link></li>
            <li><Link to="/services">LinkedIn optimization</Link></li>
            <li><Link to="/services">Career coaching</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__col-title">Company</h3>
          <ul>
            <li><Link to="/about">About Kabiru</Link></li>
            <li><Link to="/#testimonials">Testimonials</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/packages">Packages</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__col-title">Contact</h3>
          <ul>
            <li>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                Book a discovery call
              </a>
            </li>
            <li>
              {/* Replace with https://wa.me/2547XXXXXXXX */}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                WhatsApp us
              </a>
            </li>
            <li>
              <a href="mailto:contact@careerdatasolutions.co.ke">
                contact@careerdatasolutions.co.ke
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
          <a href="#fiverr" rel="noopener noreferrer">Fiverr</a>
          <a href="#linkedin" rel="noopener noreferrer">LinkedIn</a>
          <a href="#google" rel="noopener noreferrer">Google Business</a>
        </nav>
      </div>
    </footer>
  );
});

export default Footer;
