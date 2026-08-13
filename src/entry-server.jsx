import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
// react-router-dom v7 dropped the /server subpath: its export map is now
// just "." re-exporting react-router, and StaticRouter comes from there.
import { StaticRouter } from 'react-router-dom';
import App from './App.jsx';

/**
 * Render a route to an HTML string at build time. See scripts/prerender.js.
 *
 * Uses react-dom/static rather than renderToString because the routes are
 * lazy(): renderToString cannot resolve a lazy import and would bake the
 * Suspense fallback ("Loading…") into every page. prerenderToNodeStream
 * waits for Suspense boundaries to settle, so the real content lands in
 * the HTML — which is the whole point for crawlers that don't run JS.
 */
export async function render(pathname) {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={pathname}>
        <App />
      </StaticRouter>
    </StrictMode>
  );

  let html = '';
  for await (const chunk of prelude) html += chunk;
  return html;
}
