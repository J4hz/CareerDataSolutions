import { Link } from 'react-router-dom';
import { CONTACT_EMAIL } from '../config';
import '../styles/coming-soon.css';
import '../styles/button.css';

/**
 * Shared placeholder for the data track while those services are being
 * finished. Every /data/* route renders this (see App.jsx), so all data
 * links across the site land on the same page. It lives inside DataLayout,
 * so it keeps the teal shell, navbar and footer.
 */
export default function ComingSoon() {
  return (
    <main className="coming-soon" aria-labelledby="coming-soon-heading">
      <div className="coming-soon__inner">
        <span className="coming-soon__eyebrow">Data Services</span>
        <h1 id="coming-soon-heading" className="coming-soon__title">
          Coming soon
        </h1>
        <p className="coming-soon__body">
          Our data analytics services — Power BI dashboards, executive reporting,
          and Excel automation — are being finished and will be live shortly.
          Thanks for your patience.
        </p>

        <div className="coming-soon__actions">
          <Link to="/career/services" className="btn btn--gold btn--lg">
            Explore career services →
          </Link>
          <Link to="/" className="btn btn--ghost btn--lg">
            Back to home
          </Link>
        </div>

        <p className="coming-soon__contact">
          Need data work now?{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </main>
  );
}
