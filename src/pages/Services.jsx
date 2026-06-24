import { CALENDLY_URL } from '../config';
import { services, whoWeWorkWith } from '../data/services';
import { dataProcess, careerProcess } from '../data/process';
import CTASection from '../components/CTASection';
import '../styles/services.css';
import '../styles/button.css';

const processMap = {
  'data-analytics': dataProcess,
  'career-services': careerProcess,
};

export default function Services() {
  return (
    <main>
      <section className="services-page__hero" aria-labelledby="services-page-heading">
        <div className="container">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>What we do</span>
          <h1 id="services-page-heading">Two specialisms. One clear goal.</h1>
          <p>
            Every service is built on 12 years of real operational experience,
            not theory, not templates.
          </p>
        </div>
      </section>

      <section className="section services-page__cards" aria-label="Service details">
        <div className="container">
          <div className="services-page__cards-grid">
            {services.map((s) => {
              const steps = processMap[s.id];

              return (
                <article key={s.id} className="services-page__card-expanded">
                  <div className="services-page__card-header">
                    {s.track}
                  </div>
                  <div className="services-page__card-body">
                    <div>
                      <h2>{s.title}</h2>
                      <p>{s.body}</p>

                      <div className="services-page__features">
                        {s.features.map((f) => (
                          <div key={f} className="services-page__feature">
                            <span className="services-page__feature-check">✓</span>
                            {f}
                          </div>
                        ))}
                      </div>

                      <p className="services-page__price">{s.price}</p>

                      <a
                        href={CALENDLY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary"
                      >
                        {s.cta}
                      </a>
                    </div>

                    <aside className="services-page__right-panel" aria-label={`${s.track} process`}>
                      <h3>How it works</h3>
                      {steps.map((step) => (
                        <div key={step.step} className="services-page__process-step">
                          <div className="services-page__step-num">
                            {step.step}
                          </div>
                          <div className="services-page__step-content">
                            <strong>{step.title}</strong>
                            <span>{step.description}</span>
                          </div>
                        </div>
                      ))}
                    </aside>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who we work with */}
      <section className="section services-page__who" aria-labelledby="who-heading">
        <div className="container">
          <span className="eyebrow">Our clients</span>
          <h2 id="who-heading">Who we work with</h2>
          <div className="services-page__who-grid">
            {whoWeWorkWith.map((w) => (
              <div key={w} className="services-page__who-item">{w}</div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
