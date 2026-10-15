/**
 * Monochrome 24x24 marks for the footer's social links, keyed by the `id` in
 * SOCIAL_LINKS (src/config.js). Inline rather than an icon library: eight
 * small paths are cheaper than a dependency.
 *
 * Every mark paints in currentColor, so it takes the link's text colour and
 * its hover state with no per-icon rules. Marks are either all fill or all
 * stroke, set on the wrapping <svg>, never mixed inside one path.
 */
const MARKS = {
  facebook: {
    fill: true,
    d: 'M13.5 21.5v-8h2.7l.4-3.2h-3.1V8.3c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.5v3.2h2.7v8z',
  },
  linkedin: {
    fill: true,
    d: 'M5 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zM3.2 9.3h3.6V21H3.2zM9.2 9.3h3.5v1.6h.05c.5-.9 1.7-1.9 3.4-1.9 3.7 0 4.4 2.4 4.4 5.6V21h-3.6v-5.6c0-1.3 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21H9.2z',
  },
  instagram: {
    stroke: true,
    children: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
      </>
    ),
  },
  tiktok: {
    fill: true,
    d: 'M16.4 3c.3 2.2 1.8 3.7 4.1 3.9v3.2a7.4 7.4 0 0 1-4.1-1.3v6.4c0 3.3-2.6 5.8-5.8 5.8S4.8 18.5 4.8 15.3c0-3.4 2.9-6 6.4-5.6v3.3c-1.5-.4-3.1.6-3.1 2.3 0 1.4 1.1 2.5 2.5 2.5s2.5-1 2.5-2.7V3z',
  },
  x: {
    fill: true,
    d: 'M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.2h1.7L7.4 4.73H5.58z',
  },
  github: {
    fill: true,
    d: 'M12 2.5a9.5 9.5 0 0 0-3 18.52c.47.09.65-.2.65-.46v-1.6c-2.64.57-3.2-1.27-3.2-1.27-.43-1.1-1.05-1.4-1.05-1.4-.86-.59.07-.58.07-.58.95.07 1.45.98 1.45.98.85 1.45 2.22 1.03 2.76.79.09-.62.33-1.03.6-1.27-2.1-.24-4.32-1.05-4.32-4.7 0-1.03.37-1.88.98-2.55-.1-.24-.43-1.2.09-2.5 0 0 .8-.26 2.6.97a9 9 0 0 1 4.74 0c1.8-1.23 2.6-.97 2.6-.97.52 1.3.19 2.26.09 2.5.61.67.98 1.52.98 2.55 0 3.66-2.23 4.46-4.35 4.7.34.29.65.87.65 1.76v2.6c0 .26.17.56.66.46A9.5 9.5 0 0 0 12 2.5z',
  },
  upwork: {
    fill: true,
    d: 'M18.56 13.16c-1.1 0-2.13-.47-3.07-1.23l.23-1.08c.2-1.14.85-3.06 2.84-3.06a2.7 2.7 0 0 1 0 5.4zm0-8.14c-2.54 0-4.51 1.65-5.31 4.37-1.22-1.84-2.15-4.04-2.69-5.9H7.83v7.11a2.55 2.55 0 0 1-5.09 0V3.49H0v7.11a5.28 5.28 0 0 0 10.56 0V9.42c.53 1.1 1.18 2.23 1.98 3.22l-1.68 7.87h2.8l1.21-5.71c1.06.68 2.29 1.11 3.69 1.11a5.45 5.45 0 0 0 0-10.9z',
  },
  /* Solid disc with "fi" knocked out (evenodd), like the real mark. */
  fiverr: {
    fill: true,
    evenodd: true,
    d: 'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 1 0 0-19zM9.3 17v-5.2H8v-1.6h1.3v-.8C9.3 7.8 10.2 7 11.7 7h1.2v1.6H12c-.6 0-.8.3-.8.8v.8h1.6v1.6h-1.6V17zM13.9 10.2h1.9V17h-1.9zM14.85 6.9a1.05 1.05 0 1 0 0 2.1 1.05 1.05 0 1 0 0-2.1z',
  },
};

export default function SocialIcon({ id, size = 18 }) {
  const mark = MARKS[id];
  if (!mark) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill={mark.fill ? 'currentColor' : 'none'}
      stroke={mark.stroke ? 'currentColor' : undefined}
      strokeWidth={mark.stroke ? 1.8 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {mark.d ? (
        <path d={mark.d} fillRule={mark.evenodd ? 'evenodd' : undefined} />
      ) : (
        mark.children
      )}
    </svg>
  );
}
