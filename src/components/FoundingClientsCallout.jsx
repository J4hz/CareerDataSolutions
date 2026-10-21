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
 * COLOUR: on the light tone the lead-in takes --accent-ink, so it is gold
 * inside /career/* and teal inside /data/* and on the homepage. On the dark
 * About section it stays white, keeping that section monochrome.
 *
 * TONE: `light` for the white sections of the homepage, `dark` for the
 * navy About section. Structure and spacing are identical either way;
 * only the text and rule colours change.
 */
export default function FoundingClientsCallout({
  tone = 'light',
  className = '',
}) {
  if (!isFoundingClientsActive()) return null;

  const { title, body } = foundingClientsCopy;

  /* One paragraph, the title run in as its opening words. No icon, no pill,
     no tinted panel: it should read like a line the business wrote, not a
     promo widget. */
  return (
    <aside
      className={`founding-callout founding-callout--${tone}${className ? ` ${className}` : ''}`}
      aria-label={title}
    >
      <p className="founding-callout__copy">
        <strong className="founding-callout__lead">{title}.</strong> {body}
      </p>
    </aside>
  );
}
