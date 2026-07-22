import { about } from '../content/about';
import '../styles/about-section.css';

/**
 * The founder section, shared verbatim between /career/about and /data/about.
 *
 * Unlike the rest of the site, this section does NOT take var(--accent) from
 * the surrounding shell. There is one About page and it belongs to both
 * tracks, so it carries teal and gold together and renders identically on
 * either route. The pivot paragraph is where that is most literal: the
 * businesses half is teal, the professionals half is gold.
 *
 * The photo panel is a placeholder monogram. When the real founder photo
 * lands in src/assets/, replace the .about-sec__monogram div with an <img>.
 */
export default function AboutSection() {
  return (
    <section className="about-sec" aria-labelledby="about-heading">
      <div className="container about-sec__grid">
        <div className="about-sec__photo">
          {/* Placeholder for the founder photo — see note above. */}
          <div className="about-sec__monogram" aria-hidden="true">
            {about.monogram}
          </div>
          <div className="about-sec__credentials">
            {about.credentials.map((line, i) => (
              <p
                key={line}
                className={i === 0 ? 'about-sec__credential-name' : undefined}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="about-sec__copy">
          <span className="about-sec__eyebrow">{about.eyebrow}</span>
          <h1 id="about-heading" className="sr-only">
            About Kabiru Nyabwengi, founder of CareerDataSolutions
          </h1>

          <p className="about-sec__pull-quote">{about.pullQuote}</p>

          {about.bioBefore.map((para) => (
            <p key={para.slice(0, 32)} className="about-sec__body">
              {para}
            </p>
          ))}

          {/* The only paragraph naming both tracks, so it is the one that
              shows both colours. */}
          <p className="about-sec__pivot">
            <span className="about-sec__pivot--data">{about.pivot.data}</span>{' '}
            <span className="about-sec__pivot--career">{about.pivot.career}</span>
          </p>

          {about.bioAfter.map((para) => (
            <p key={para.slice(0, 32)} className="about-sec__body">
              {para}
            </p>
          ))}

          <div className="about-sec__stat-box">
            <p className="about-sec__stat-quote">{about.statBox.quote}</p>
            <dl className="about-sec__stat-row">
              {about.statBox.stats.map((stat) => (
                <div key={stat.label} className="about-sec__stat">
                  <dt className="about-sec__stat-num">{stat.num}</dt>
                  <dd className="about-sec__stat-label">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
