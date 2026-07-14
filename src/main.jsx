import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import './styles/button.css';
import App from './App.jsx';

// scripts/prerender.js bakes this route's head tags into the static HTML
// so crawlers that don't execute JS still see them. Once React takes over
// it renders those same tags itself (see components/Seo.jsx), so drop the
// baked-in copies first or the page ends up with two of each.
document
  .querySelectorAll('head [data-prerendered]')
  .forEach((tag) => tag.remove());

const root = document.getElementById('root');

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Prerendered pages ship with markup to hydrate; a plain `vite dev`
// server serves an empty root, which needs a fresh render.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
