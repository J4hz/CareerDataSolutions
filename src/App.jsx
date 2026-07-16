import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import CareerLayout from './layouts/CareerLayout';
import DataLayout from './layouts/DataLayout';
import Seo from './components/Seo';

const Home           = lazy(() => import('./pages/Home'));
const DataServices   = lazy(() => import('./pages/DataServices'));
const CareerServices = lazy(() => import('./pages/CareerServices'));
const Packages      = lazy(() => import('./pages/Packages'));
const About         = lazy(() => import('./pages/About'));
const Blog          = lazy(() => import('./pages/Blog'));
const BlogPost      = lazy(() => import('./pages/BlogPost'));
const ContactData   = lazy(() => import('./pages/ContactData'));
const ContactCareer = lazy(() => import('./pages/ContactCareer'));
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
            <Route path="/blog"       element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="*"           element={<NotFound />} />
          </Route>

          <Route path="/career" element={<CareerLayout />}>
            <Route index            element={<Navigate to="/career/services" replace />} />
            <Route path="services"  element={<CareerServices />} />
            <Route path="packages"  element={<Packages track="career" />} />
            <Route path="about"     element={<About track="career" />} />
            <Route path="contact"   element={<ContactCareer />} />
          </Route>

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
          <Route path="/about"           element={<Navigate to="/data/about" replace />} />
          <Route path="/contact"         element={<Navigate to="/data/contact" replace />} />
          <Route path="/contact/data"    element={<Navigate to="/data/contact" replace />} />
          <Route path="/contact/career"  element={<Navigate to="/career/contact" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
