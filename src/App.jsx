import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import CareerLayout from './layouts/CareerLayout';
import DataLayout from './layouts/DataLayout';
import Seo from './components/Seo';

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
const NotFound      = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageFallback() {
  return <div className="page-loading" role="status" aria-live="polite">Loading…</div>;
}

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
      <Suspense fallback={<PageFallback />}>
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
