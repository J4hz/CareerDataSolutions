import { memo } from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';
// Same asset as the navbar: one logo file, so a rebrand is a single swap.
// (Was a separate stacked lockup of the old brand, since deleted.)
// The 490x90 derivative covers the navbar's 45px and this 38px at 2x.
import logoWebp from '../assets/generated/logo-490.webp';
import logo from '../assets/generated/logo-490.png';
import '../styles/footer.css';

/**
 * One structural footer for all three shells. Both tracks' columns are
 * always present — the footer is the cross-navigation surface of the split,
 * so a visitor deep in /career/* can still find the data side. The `track`
 * prop only decides where track-ambiguous links (About, Book a call) land;
 * the layout's theme class handles the accent colour.
 */
/**
 * External profile links for the bottom bar.
 *
 * EMPTY ON PURPOSE. This used to hold three hardcoded anchors pointing at
 * "#upwork", "#linkedin" and "#google" — fragment links that went nowhere,
 * which is worse than no link at all: a visitor who clicks one gets nothing
 * and learns the site is unfinished. They are gone rather than hidden.
 *
 * The markup and styles below are untouched and still render this list, so
 * bringing them back is adding a line here, not rebuilding the bar. Fill in
 * a real profile URL and uncomment:
 */
const PLATFORMS = [
  // { label: 'Upwork',          href: 'https://www.upwork.com/agencies/...' },
  // { label: 'LinkedIn',        href: 'https://www.linkedin.com/company/...' },
  // { label: 'Google Business', href: 'https://www.google.com/maps/place/...' },
];

/* When a profile does go live here, add the same URL to SAME_AS in
   src/seo/schema.js. That is the machine-readable half of the same fact,
   and it carries the same "no placeholders" rule. */

const Footer = memo(function Footer({ track = null }) {
  // Inside a track shell About stays in that shell, so the accent does not
  // change under the visitor mid-session. On the neutral shell it goes to the
  // neutral /about, which is where the homepage nav points too.
  const aboutTo = track ? `/${track}/about` : '/about';

  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <div className="footer__brand-logo">
            {/* The horizontal lockup is wide (5.4:1), so it sits shorter here
                than the old stacked mark did while occupying similar width. */}
            <picture>
              <source srcSet={logoWebp} type="image/webp" />
              <img
                src={logo}
                alt="CareerDataSolutions"
                width="490"
                height="90"
                style={{
                  height: '38px',
                  width: 'auto',
                  maxWidth: '100%',
                  display: 'block',
                  background: 'var(--white)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                }}
              />
            </picture>
          </div>
          {/* One line each, taking its own track colour, so the split reads
              here the same way it does in the hero headline and the service
              columns below. Stacked, so no separator is needed. */}
          <p className="footer__tagline">
            <span className="footer__tagline--data">Data-Driven Decisions</span>
            <span className="footer__tagline--career">Career-Defining Growth</span>
          </p>
          {/* Hyphen, not an em dash: the site is deliberately em-dash free. */}
          <p className="footer__location">
            Nairobi, Kenya - working with clients worldwide.
          </p>
        </div>

        {/* Each column is the map of one track: overview, prices, answers,
            and the way in. Four lines, four destinations, no two the same.

            These used to be service names — "Custom Power BI dashboards" and
            so on — deep-linked to the matching card. That is why the cards
            in ServiceLanding.jsx no longer need ids: the footer was the only
            thing pointing at them. It landed a visitor inside the "Scope"
            list, part-way down a page they had not seen the top of, which is
            a worse first impression than the page itself.

            The labels name what is at the other end. "Common questions" is
            the FAQ section's own eyebrow, and "Pricing" rather than
            "Packages" on the data side because /data/packages leads with
            "Scope tiers built for every stage" — that track quotes, it does
            not sell packages. */}
        <div className="footer__col">
          <h3 className="footer__col-title">Data Services</h3>
          <ul className="footer__list footer__list--data">
            <li><Link to="/data/services">Data services overview</Link></li>
            <li><Link to="/data/packages">Pricing</Link></li>
            <li><Link to="/data/services#faq">Common questions</Link></li>
            <li><Link to="/data/contact">Book a discovery call</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__col-title">Career Services</h3>
          <ul className="footer__list footer__list--career">
            <li><Link to="/career/services">Career services overview</Link></li>
            <li><Link to="/career/packages">Packages and pricing</Link></li>
            <li><Link to="/career/services#faq">Common questions</Link></li>
            {/* The career contact page is the free CV review, not a booking
                form. Naming it that is both more accurate and the stronger
                offer of the two. */}
            <li><Link to="/career/contact">Get a free CV review</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__col-title">Company</h3>
          <ul>
            <li><Link to={aboutTo}>About Kabiru</Link></li>
            {/* Testimonials link removed with the testimonials sections; the
                #testimonials anchor it pointed at no longer exists. Restore
                alongside the block in src/pages/Home.jsx.
            <li><Link to="/#testimonials">Testimonials</Link></li>
            */}
            {/* Blog link removed with the Insights nav entries; restore
                alongside the routes in App.jsx to bring the blog back. */}
            {/* The footer is the conventional home for these, and the site
                takes CV uploads and phone numbers with no policy published
                anywhere else. Both pages are scaffolds today — see
                pages/Privacy.jsx. */}
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__col-title">Contact</h3>
          {/* Both ways in now live in the track columns above, where they say
              which track they lead to. A third, track-guessing "Book a
              discovery call" here pointed at the same two pages under a
              vaguer label, so this column is the direct channels only. */}
          <ul>
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
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © 2026 CareerDataSolutions. All rights reserved. · Nairobi, Kenya
        </p>
        {/* Renders nothing while PLATFORMS is empty, so the copyright line
            keeps the bar to itself rather than sitting opposite a gap. */}
        {PLATFORMS.length > 0 && (
          <nav className="footer__platforms" aria-label="External platforms">
            {PLATFORMS.map(({ label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
});

export default Footer;
