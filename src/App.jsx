import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home     = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Packages = lazy(() => import('./pages/Packages'));
const About    = lazy(() => import('./pages/About'));
const Blog     = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Contact  = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

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

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/services"   element={<Services />} />
          <Route path="/packages"   element={<Packages />} />
          <Route path="/about"      element={<About />} />
          <Route path="/blog"       element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contact"    element={<Contact />} />
          <Route path="*"           element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
