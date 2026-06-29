import { memo } from 'react';

const avatarBg = {
  teal: 'var(--teal)',
  gold: 'var(--navy2)',
  navy: 'var(--navy)',
};

const TestimonialCard = memo(function TestimonialCard({ testimonial }) {
  return (
    <article
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--gl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ color: 'var(--navy)', fontSize: '1rem', letterSpacing: '2px' }}>
        {'★'.repeat(testimonial.stars)}
      </div>

      <blockquote
        style={{
          fontSize: '0.95rem',
          color: 'var(--gd)',
          lineHeight: 1.75,
          fontStyle: 'italic',
          margin: 0,
          flex: 1,
        }}
      >
        "{testimonial.quote}"
      </blockquote>

      <footer style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: avatarBg[testimonial.avatarColor] || 'var(--navy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--white)',
            fontWeight: 700,
            fontSize: '0.85rem',
            flexShrink: 0,
          }}
        >
          {testimonial.initials}
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'var(--dark)',
            }}
          >
            {testimonial.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gm)' }}>
            {testimonial.role}
          </div>
        </div>
      </footer>
    </article>
  );
});

export default TestimonialCard;
