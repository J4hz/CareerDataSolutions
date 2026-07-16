import AboutSection from '../components/AboutSection';
import CTASection from '../components/CTASection';

/**
 * /career/about and /data/about — one page, two routes.
 *
 * The content is identical on both sides (see content/about.js); the only
 * thing that changes is the accent colour supplied by the layout shell.
 * The track prop exists solely so the closing CTA points at the right
 * contact flow.
 */
export default function About({ track = 'data' }) {
  return (
    <main>
      <AboutSection />
      <CTASection track={track} />
    </main>
  );
}
