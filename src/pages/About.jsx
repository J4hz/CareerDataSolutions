import { Link } from 'react-router-dom';
import { credentials, departments } from '../data/services';
import CTASection from '../components/CTASection';
import '../styles/about.css';
import '../styles/button.css';

export default function About() {
  return (
    <main>
      {/* Opening: two-column, white background */}
      <section className="about-page__opening" aria-labelledby="about-page-heading">
        <div className="container">
          <div className="about-page__opening-grid">
            <div className="about-page__opening-left">
              <span className="eyebrow">About Kabiru</span>
              <h1 id="about-page-heading">12 years in the field. Now at your service.</h1>
              <p>
                CareerDataSolutions was built on a simple idea: the same discipline
                that keeps emergency operations running can make organizational data and
                professional careers perform better.
              </p>
              <div className="about-page__tags">
                {credentials.map((c) => (
                  <span key={c} className="about-page__tag">{c}</span>
                ))}
              </div>
              <Link
                to="/contact"
                className="btn btn--teal btn--lg"
                style={{ marginTop: '28px', display: 'inline-flex' }}
              >
                Book a free discovery call
              </Link>
            </div>

            <aside className="about-page__card" aria-label="Dashboard departments">
              <p className="about-page__card-title">Power BI dashboards built across</p>
              <ul className="about-page__dept-list">
                {departments.map((d) => (
                  <li key={d.name} className="about-page__dept-item">
                    <span className="about-page__dept-name">{d.name}</span>
                    <span className="about-page__dept-status">{d.status}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Story section */}
      <section className="section about-page__story" aria-label="Kabiru's story">
        <div className="container">
          <div className="about-page__story-text">
            <h2>From the field to your organization</h2>
            <p>
              I spent over a decade coordinating emergency medical services, managing
              operations, building teams, and turning messy field data into decisions
              that mattered under pressure. Not once from behind a desk.
            </p>
            <p>
              That background shapes everything I build. I designed Power BI dashboards
              across 7 departments: HR, Finance, Operations, Procurement, Business
              Development, Executive, and PR. I streamlined claims workflows using
              Excel automation that gave teams back hours of manual processing time
              every week.
            </p>
            <p>
              Now I channel that experience through CareerDataSolutions, helping
              organizations make their data work harder and professionals make their
              careers move faster.
            </p>
          </div>
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="about-page__mid-cta" aria-label="Work with Kabiru">
        <div className="container">
          <h2>Want to work with Kabiru?</h2>
          <Link to="/contact" className="btn btn--teal btn--lg">
            Book a free discovery call
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="about-page__stats" aria-label="Key statistics">
        <div className="container">
          <div className="about-page__stats-grid">
            <div>
              <div className="about-page__stat-num" style={{ color: 'var(--teal)' }}>7</div>
              <div className="about-page__stat-label">Departments dashboarded</div>
            </div>
            <div>
              <div className="about-page__stat-num" style={{ color: 'var(--gold)' }}>12</div>
              <div className="about-page__stat-label">Years of operational data experience in EMS</div>
            </div>
            <div>
              <div className="about-page__stat-num" style={{ color: 'var(--white)' }}>2</div>
              <div className="about-page__stat-label">Service specialties, one trusted consultancy</div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
