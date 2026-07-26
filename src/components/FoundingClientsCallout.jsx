import {
  foundingClientsCopy,
  isFoundingClientsActive,
} from '../content/foundingClients';
import '../styles/founding-clients.css';

/**
 * The founding-clients statement, shared by the homepage and the About page.
 *
 * One component, two call sites — the copy and the expiry rule live in
 * content/foundingClients.js, so neither page owns them and the two can't
 * drift apart. If the offer has lapsed (window closed or engagement cap
 * reached) this renders nothing at all rather than stale copy.
 *
 * COLOUR: takes var(--accent) from the surrounding shell, so it is gold
 * inside /career/* and teal inside /data/* and on the neutral homepage.
 * Note that on the About page this is the one element that breaks that
 * section's monochrome rule (see styles/about-section.css) — deliberate,
 * because the callout is meant to read as a distinct statement rather
 * than as part of the founder copy around it.
 *
 * TONE: `light` for the white sections of the homepage, `dark` for the
 * navy About section. Structure and spacing are identical either way;
 * only the surface and text tokens change, since a paper panel dropped on
 * --navy-950 would read as a rendering fault rather than a callout.
 */
export default function FoundingClientsCallout({ tone = 'light', className = '' }) {
  if (!isFoundingClientsActive()) return null;

  const { title, body } = foundingClientsCopy;

  return (
    <aside
      className={`founding-callout founding-callout--${tone}${className ? ` ${className}` : ''}`}
      aria-label={title}
    >
      <p className="founding-callout__badge">
        <span className="founding-callout__mark" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1.5l1.9 4.35 4.6.42-3.47 3.1 1.02 4.63L9 11.6l-4.05 2.4L5.97 9.37 2.5 6.27l4.6-.42L9 1.5z"
              fill="currentColor"
            />
          </svg>
        </span>
        {title}
      </p>

      <p className="founding-callout__copy">{body}</p>
    </aside>
  );
}
