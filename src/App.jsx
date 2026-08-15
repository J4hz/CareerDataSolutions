import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import CareerLayout from './layouts/CareerLayout';
import DataLayout from './layouts/DataLayout';
import Seo from './components/Seo';
import PageSkeleton from './components/PageSkeleton';

const Home           = lazy(() => import('./pages/Home'));
const CareerServices = lazy(() => import('./pages/CareerServices'));
const DataServices   = lazy(() => import('./pages/DataServices'));
const Packages      = lazy(() => import('./pages/Packages'));
const About         = lazy(() => import('./pages/About'));
// Restore alongside the /blog routes below to bring the blog back.
// const Blog       = lazy(() => import('./pages/Blog'));
// const BlogPost   = lazy(() => import('./pages/BlogPost'));
const ContactCareer = lazy(() => import('./pages/ContactCareer'));
const ContactData   = lazy(() => import('./pages/ContactData'));
const CareerOrder   = lazy(() => import('./pages/CareerOrder'));
// HIDDEN FROM THE LIVE SITE, like the blog above. Both were scaffolds
// carrying a "what this page will cover" placeholder, and a published
// placeholder reads as an unfinished site rather than a considered one.
// pages/Privacy.jsx, pages/Terms.jsx and components/LegalPage.jsx are all
// untouched on disk; restore alongside the routes below.
// const Privacy    = lazy(() => import('./pages/Privacy'));
// const Terms      = lazy(() => import('./pages/Terms'));
const NotFound      = lazy(() => import('./pages/NotFound'));

/**
 * Scroll behaviour on navigation.
 *
 * Plain route change: back to the top, as before.
 *
 * With a hash (the footer's service links point at #deliverables): scroll to
 * that element instead. React Router does not do this itself, and the browser
 * cannot — the target does not exist yet at navigation time, because the
 * route it lives on is lazy() and still loading. So this retries on the next
 * frame until the element appears, giving up after a few attempts rather
 * than spinning if the id is wrong.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }

    let frame;
    let attempts = 0;
    const seek = () => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
      if (attempts++ < 60) frame = requestAnimationFrame(seek);
    };
    frame = requestAnimationFrame(seek);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

// Was a centred "Loading…". A shell in roughly the shape of the incoming
// page reads as arriving rather than empty, and holds the layout still.
// components/PageSkeleton.jsx.

/**
 * Route tree for the career/data split.
 *
 *   /                    neutral landing — two cards into the tracks
 *   /career/*            gold shell   (CareerLayout → .theme-career)
 *   /data/*              teal shell   (DataLayout   → .theme-data)
 *   /blog, /blog/:slug   neutral shell
 *
 * The two tracks are mirrors: services / packages / about / contact.
 * About renders the same shared component on both sides — only the accent
 * shifts. There is deliberately no steps/process route on either side.
 *
 * Legacy paths get client-side redirects below; vercel.json carries the
 * matching server-side 308s so direct loads survive (the prerenderer only
 * writes files for routes in src/seo/meta.js).
 */
export default function App() {
  return (
    <>
      <Seo />
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/"           element={<Home />} />
            {/* Neutral About. The homepage links here rather than into one of
                the two tracks: a visitor reading about Kabiru has not chosen a
                lane yet, and sending them into the gold or teal shell picks one
                for them. Same page as /career/about and /data/about; passing a
                null track gives the closing CTA its two-way booking menu. */}
            <Route path="/about"      element={<About track={null} />} />
            {/* Blog ("Insights") is hidden from the live site. The pages and
                posts still exist (pages/Blog.jsx, pages/BlogPost.jsx,
                data/blog.js); uncomment these two routes, restore the nav
                entries in components/Navbar.jsx and the Footer link, and
                re-add the seo/meta.js + seo/schema.js entries to bring it
                back.
            <Route path="/blog"       element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            */}
            {/* LEGAL PAGES — HIDDEN FROM THE LIVE SITE.
                Neutral shell when they return: the legal pages belong to the
                company, not to either track, so they pick no lane. Restore
                these two routes, the lazy() imports at the top of this file,
                the two Footer links, and the seo/meta.js entries — all four,
                or the page is unreachable, unlinked, or hard-404s on a
                direct load.
            <Route path="/privacy"    element={<Privacy />} />
            <Route path="/terms"      element={<Terms />} />
            */}
            <Route path="*"           element={<NotFound />} />
          </Route>

          <Route path="/career" element={<CareerLayout />}>
            <Route index            element={<Navigate to="/career/services" replace />} />
            <Route path="services"  element={<CareerServices />} />
            <Route path="packages"  element={<Packages track="career" />} />
            <Route path="about"     element={<About track="career" />} />
            <Route path="contact"   element={<ContactCareer />} />
            {/* Paid checkout. /career/contact stays the free CV review; this is
                where "Get this package" lands, with ?pkg=<id> naming the
                package. Registered in seo/meta.js as noindex. */}
            <Route path="order"     element={<CareerOrder />} />
          </Route>

          {/* Data track, mirroring the career routes above. It spent a while
              behind a single "coming soon" placeholder; pages/ComingSoon.jsx
              is still on disk if a section ever needs to go back behind one. */}
          <Route path="/data" element={<DataLayout />}>
            <Route index            element={<Navigate to="/data/services" replace />} />
            <Route path="services"  element={<DataServices />} />
            <Route path="packages"  element={<Packages track="data" />} />
            <Route path="about"     element={<About track="data" />} />
            <Route path="contact"   element={<ContactData />} />
          </Route>

          {/* Legacy routes from before the split */}
          <Route path="/services"        element={<Navigate to="/" replace />} />
          <Route path="/data-services"   element={<Navigate to="/data/services" replace />} />
          <Route path="/career-services" element={<Navigate to="/career/services" replace />} />
          <Route path="/packages"        element={<Navigate to="/" replace />} />
          <Route path="/contact"         element={<Navigate to="/data/contact" replace />} />
          <Route path="/contact/data"    element={<Navigate to="/data/contact" replace />} />
          <Route path="/contact/career"  element={<Navigate to="/career/contact" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
