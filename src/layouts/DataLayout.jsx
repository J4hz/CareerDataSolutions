import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Shell for every /data/* route.
 *
 * .theme-data on the wrapper swaps --accent (and friends) to teal — see
 * src/styles/theme.css. Mirrors CareerLayout exactly; only the theme class
 * and the track passed to the chrome differ.
 */
export default function DataLayout() {
  return (
    <div className="theme-data">
      <Navbar track="data" />
      <Outlet />
      <Footer track="data" />
    </div>
  );
}
