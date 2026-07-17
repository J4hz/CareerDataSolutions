import { memo } from 'react';
import TestimonialCard from './ui/TestimonialCard';
import { testimonials } from '../data/testimonials';
import '../styles/testimonials-marquee.css';

/**
 * Continuously scrolling wall of client testimonials. The list is rendered
 * twice so the track can slide a full copy-width and loop seamlessly; the
 * second copy is aria-hidden so screen readers don't announce it twice.
 * Motion pauses on hover/focus and is disabled under prefers-reduced-motion.
 */
const TestimonialsMarquee = memo(function TestimonialsMarquee() {
  return (
    <div className="tmarquee" role="group" aria-label="Client testimonials">
      <div className="tmarquee__track">
        <div className="tmarquee__group">
          {testimonials.map((t) => (
            <div className="tmarquee__item" key={t.id}>
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
        <div className="tmarquee__group" aria-hidden="true">
          {testimonials.map((t) => (
            <div className="tmarquee__item" key={`dup-${t.id}`}>
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TestimonialsMarquee;
