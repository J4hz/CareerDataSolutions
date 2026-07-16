import { dataPackages, careerPackages } from '../data/packages';
import PackageCardHorizontal from '../components/ui/PackageCardHorizontal';
import CTASection from '../components/CTASection';
import '../styles/packages.css';

const COPY = {
  data: {
    trackLabel: 'Data Analytics',
    sectionTitle: 'Dashboard and automation packages',
    intro:
      'Local KES pricing for Kenya. USD rates for international and Upwork projects. Every dashboard package includes clear timelines and revision rounds.',
  },
  career: {
    trackLabel: 'Career Services',
    sectionTitle: 'CV, LinkedIn, and coaching packages',
    intro:
      'Local KES pricing for Kenya. USD rates for international clients. Every package includes clear timelines and revision rounds.',
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
          <h1 id="packages-page-heading">Packages built for every stage</h1>
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
            {packages.map((pkg) => (
              <PackageCardHorizontal key={pkg.id} pkg={pkg} />
            ))}
          </div>

          <p className="packages-page__note">
            All packages include clear timelines, defined revision rounds, and delivery
            via email. Payment accepted via M-Pesa, Payoneer, and bank transfer.
          </p>
        </div>
      </section>

      <CTASection track={track} />
    </main>
  );
}
