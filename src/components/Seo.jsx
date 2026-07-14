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
export default function Seo() {
  const { pathname } = useLocation();
  const meta = metaForPath(pathname);
  const schema = schemaForPath(pathname);

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
      {schema.map((block, i) => (
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
