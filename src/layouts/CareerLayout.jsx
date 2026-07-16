import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Shell for every /career/* route.
 *
 * .theme-career on the wrapper swaps --accent (and friends) to gold — see
 * src/styles/theme.css. The layout owns its own Navbar and Footer instance,
 * so the chrome inside the career shell links to career routes and picks up
 * the gold accent, while staying the same structural components as the data
 * shell. Color only: no font, spacing or layout fork.
 */
export default function CareerLayout() {
  return (
    <div className="theme-career">
      <Navbar track="career" />
      <Outlet />
      <Footer track="career" />
    </div>
  );
}
