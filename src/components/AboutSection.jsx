import { about } from '../content/about';
import FoundingClientsCallout from './FoundingClientsCallout';
// Responsive derivatives of assets/kabiru.jpg (1047x1502). See scripts/images.js.
import portrait400Webp from '../assets/generated/kabiru-400.webp';
import portrait640Webp from '../assets/generated/kabiru-640.webp';
import portrait900Webp from '../assets/generated/kabiru-900.webp';
import portrait400 from '../assets/generated/kabiru-400.jpg';
import portrait640 from '../assets/generated/kabiru-640.jpg';
import portrait900 from '../assets/generated/kabiru-900.jpg';
import '../styles/about-section.css';

/**
 * The founder section, shared verbatim between /career/about and /data/about.
 *
 * Unlike the rest of the site, this section does NOT take var(--accent) from
 * the surrounding shell. There is one About page and it belongs to both
 * tracks, so tinting it teal or gold would make it look like it belonged to
 * whichever track you arrived from. It is monochrome instead, with the stat
 * numbers in the booking orange as the single point of colour.
 *
 * The photo is shot against black, which sits almost exactly on --navy-950
 * behind it, so the panel needs no frame beyond the existing hairline.
 */
export default function AboutSection() {
  return (
    <section className="about-sec" aria-labelledby="about-heading">
      <div className="container about-sec__grid">
        <div className="about-sec__photo">
          {/* sizes tracks the CSS: the portrait fills its grid column up to
              about 450px, and is capped at 320px below 900px viewports. */}
          <picture>
            <source
              type="image/webp"
              srcSet={`${portrait400Webp} 400w, ${portrait640Webp} 640w, ${portrait900Webp} 900w`}
              sizes="(max-width: 900px) 320px, 450px"
            />
            <img
              src={portrait640}
              srcSet={`${portrait400} 400w, ${portrait640} 640w, ${portrait900} 900w`}
              sizes="(max-width: 900px) 320px, 450px"
              alt="Kabiru Nyabwengi, founder of CareerDataSolutions"
              className="about-sec__portrait"
              width="1047"
              height="1502"
              loading="lazy"
              decoding="async"
            />
          </picture>
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

          {/* Names both tracks. Carried by weight and brightness rather than
              colour, so neither track appears to own the page. */}
          <p className="about-sec__pivot">{about.pivot}</p>

          {about.bioAfter.map((para) => (
            <p key={para.slice(0, 32)} className="about-sec__body">
              {para}
            </p>
          ))}

          {/* FOUNDING CLIENTS. Sits between the founder copy and the proof
              block on purpose: it says where the business is today, right
              before the numbers say where Kabiru has already been. This is
              the one element on this page that takes var(--accent) and so
              shifts gold/teal with the shell — see the colour note at the
              top of styles/about-section.css. */}
          <FoundingClientsCallout tone="dark" className="about-sec__founding" />

          <div className="about-sec__stat-box">
            <p className="about-sec__stat-quote">{about.statBox.quote}</p>

            {/* Says whose numbers these are. Sits on the numbers rather than
                on the whole box, so it reads as their attribution and not as
                a second heading over the quote above. */}
            <p className="about-sec__stat-label-lead" id="about-stats-source">
              {about.statBox.statsLabel}
            </p>

            <dl className="about-sec__stat-row" aria-labelledby="about-stats-source">
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
