import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Neutral shell: the main landing page, the blog, and the 404.
 *
 * No theme class — --accent stays at its :root default. The nav here shows
 * both tracks side by side; inside a track shell it collapses to that
 * track's own pages.
 */
export default function SiteLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
