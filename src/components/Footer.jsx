import { memo } from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_URL, CONTACT_EMAIL, SOCIAL_LINKS } from '../config';
import SocialIcon from './SocialIcons';
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
/* Social and marketplace profiles for the bottom bar come from SOCIAL_LINKS
   in src/config.js, which also feeds `sameAs` in src/seo/schema.js. Add or
   remove a profile there, not here. */

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
            {/* The lockup is 3.5:1 with a two-line wordmark, so at this
                height its type matches the navbar's while taking less width. */}
            <picture>
              <source srcSet={logoWebp} type="image/webp" />
              <img
                src={logo}
                alt="CareerDataSolutions"
                width="490"
                height="139"
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
            {/* LEGAL LINKS — HIDDEN WITH THE PAGES THEMSELVES (App.jsx).
                The footer is the conventional home for these and they should
                come back the moment there is reviewed text to put behind
                them: the site takes CV uploads, phone numbers and payments,
                and publishes no policy about any of it anywhere else.
                Restore alongside the routes.
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            */}
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
        {/* Icon-only links, so each one carries its own aria-label. Renders
            nothing if SOCIAL_LINKS is ever emptied. */}
        {SOCIAL_LINKS.length > 0 && (
          <nav className="footer__platforms" aria-label="Career Data Solutions elsewhere">
            {SOCIAL_LINKS.map(({ id, name, url }) => (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Career Data Solutions on ${name}`}
                title={name}
              >
                <SocialIcon id={id} />
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
});

export default Footer;
