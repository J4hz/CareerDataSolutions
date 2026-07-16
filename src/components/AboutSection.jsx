import { about } from '../content/about';
import '../styles/about-section.css';

/**
 * The founder section, shared verbatim between /career/about and
 * /data/about. Everything accent-coloured below (eyebrow, pull-quote rule,
 * credentials rule, mission tint) reads var(--accent) from the surrounding
 * layout shell, so it renders gold inside CareerLayout and teal inside
 * DataLayout with zero per-track code here.
 *
 * The photo panel is a placeholder — the reference file only carries a
 * base64 dummy image. When the real founder photo lands in src/assets/,
 * replace the .about-sec__monogram div with an <img>.
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
            {about.credentials.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </div>
        </div>

        <div className="about-sec__copy">
          <span className="eyebrow">{about.eyebrow}</span>
          <h1 id="about-heading" className="sr-only">
            About Kabiru Nyabwengi, founder of CareerDataSolutions
          </h1>
          <p className="about-sec__pull-quote">{about.pullQuote}</p>
          {about.bio.map((para) => (
            <p key={para.slice(0, 32)} className="about-sec__body">
              {para}
            </p>
          ))}
          <div className="about-sec__mission">{about.mission}</div>
        </div>
      </div>
    </section>
  );
}
