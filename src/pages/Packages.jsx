import { dataPackages, careerPackages } from '../data/packages';
import PackageCardHorizontal from '../components/ui/PackageCardHorizontal';
import CTASection from '../components/CTASection';
import '../styles/packages.css';

export default function Packages() {
  return (
    <main>
      <section className="packages-page__hero" aria-labelledby="packages-page-heading">
        <div className="container">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>Pricing</span>
          <h1 id="packages-page-heading">Packages built for every stage</h1>
          <p>
            Local KES pricing for Kenya. USD rates for international and Upwork
            projects. All packages include clear timelines and revision rounds.
          </p>
        </div>
      </section>

      <section className="section packages-page__main" aria-label="Package options">
        <div className="container">

          <div className="packages-page__group">
            <p className="packages-page__track-label" style={{ color: 'var(--teal)' }}>Data Analytics</p>
            <h3 className="packages-page__section-title">Dashboard and automation packages</h3>
            {dataPackages.map((pkg) => (
              <PackageCardHorizontal key={pkg.id} pkg={pkg} />
            ))}
          </div>

          <div className="packages-page__group">
            <p className="packages-page__track-label" style={{ color: 'var(--gold)' }}>Career Services</p>
            <h3 className="packages-page__section-title">CV, LinkedIn, and coaching packages</h3>
            {careerPackages.map((pkg) => (
              <PackageCardHorizontal key={pkg.id} pkg={pkg} />
            ))}
          </div>

          <p className="packages-page__note">
            All packages include clear timelines, defined revision rounds, and delivery
            via email. Payment accepted via M-Pesa, Payoneer, and bank transfer.
          </p>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
