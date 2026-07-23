import { dataPackages, careerPackages } from '../data/packages';
import PackageCard from '../components/ui/PackageCard';
import CTASection from '../components/CTASection';
import '../styles/packages.css';

const COPY = {
  data: {
    trackLabel: 'Data Analytics',
    heading: 'Scope tiers built for every stage',
    sectionTitle: 'Dashboard and automation scope tiers',
    intro:
      'Local KES pricing for Kenya. USD rates for international and Upwork projects. These are starting points rather than fixed packages: dashboard work varies too much by data complexity to price sight-unseen.',
    // Data work is quoted, not bought off the page, so the closing line talks
    // about how the number gets fixed rather than how it gets paid.
    note:
      'Every engagement starts with a free discovery call. After it you receive a written scope and a fixed price for the agreed deliverables, before any work begins. If requirements expand later, that is scoped and quoted separately rather than folded into the original price.',
  },
  career: {
    trackLabel: 'Career Services',
    heading: 'Packages built for every stage',
    sectionTitle: 'CV, LinkedIn, and coaching packages',
    intro:
      'Local KES pricing for Kenya. USD rates for international clients. Every package includes clear timelines and revision rounds.',
    note:
      'All packages include clear timelines, defined revision rounds, and delivery via email. Payment accepted via M-Pesa, Payoneer, and bank transfer.',
  },
};

/**
 * Packages for one track: /data/packages and /career/packages.
 * Same page grammar on both sides; the track prop picks the package list
 * and copy, the layout's theme class supplies the accent.
 */
export default function Packages({ track = 'data' }) {
  const packages = track === 'career' ? careerPackages : dataPackages;
  const copy = COPY[track];

  return (
    <main>
      <section className="packages-page__hero" aria-labelledby="packages-page-heading">
        <div className="container">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>Pricing</span>
          <h1 id="packages-page-heading">{copy.heading}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>

      <section className="section packages-page__main" aria-label="Package options">
        <div className="container">
          <div className="packages-page__group">
            <p className="packages-page__track-label" style={{ color: 'var(--accent)' }}>
              {copy.trackLabel}
            </p>
            <h3 className="packages-page__section-title">{copy.sectionTitle}</h3>
            <div className="packages-page__grid">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </div>

          <p className="packages-page__note">{copy.note}</p>
        </div>
      </section>

      <CTASection track={track} />
    </main>
  );
}
