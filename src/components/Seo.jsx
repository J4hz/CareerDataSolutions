import { useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { metaForPath } from '../seo/meta.js';
import { schemaForPath } from '../seo/schema.js';
import { SITE_NAME } from '../config.js';

/**
 * Renders the head tags for the current route.
 *
 * Mounted once in App, driven by the router — so every route gets its
 * own canonical automatically and a new page can't forget to set one.
 *
 * React 19 hoists title/meta/link rendered here into <head> natively;
 * no head-management library is needed (react-helmet-async is
 * unmaintained and does not support React 19).
 *
 * On a first load these tags are already in the HTML, baked in by
 * scripts/prerender.js. main.jsx strips those prerendered tags just
 * before hydration so React re-renders them here without duplicating.
 */
/** Never notifies: the "is this hydrated yet" answer only changes once. */
const subscribe = () => () => {};

export default function Seo() {
  const { pathname } = useLocation();
  const meta = metaForPath(pathname);
  const schema = schemaForPath(pathname);

  // The JSON-LD waits for hydration to finish. useSyncExternalStore is the
  // primitive for exactly this: React takes the server snapshot (false)
  // during SSR and during the hydration pass, then the client one (true)
  // once hydration is done — no setState in an effect, and no extra render
  // for React to warn about.
  //
  // This component renders nothing during the
  // prerender (below), so on a first load the server HTML has none of these
  // tags — and React 19 does not mind that for title/meta/link, because it
  // hoists those into <head> itself rather than matching them by position.
  // A <script> is the one tag here it does NOT hoist, so it stays in the
  // tree, and rendering it during hydration means the client has an element
  // where the server had none. That is the whole of React error #418 on
  // this site. Rendering it one tick later keeps the hydration pass
  // identical to the server and puts the script in exactly the same place
  // it ended up before.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  // During the build-time prerender the script writes the head itself,
  // straight from the same registry. Staying quiet here keeps React from
  // hoisting a second copy of every tag into the prerendered body.
  if (import.meta.env.SSR) return null;

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.noindex && <meta name="robots" content="noindex, follow" />}
      {meta.canonical && <link rel="canonical" href={meta.canonical} />}

      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      {meta.canonical && <meta property="og:url" content={meta.canonical} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />

      {/* JSON-LD. The content is ours, not user input, so there is nothing
          to inject here — but `<` is still escaped as a matter of course,
          since a stray `</script>` in any future copy would break the page. */}
      {mounted &&
        schema.map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(block).replace(/</g, '\\u003c'),
            }}
          />
        ))}
    </>
  );
}
