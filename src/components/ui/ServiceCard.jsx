import { memo } from 'react';
import { Link } from 'react-router-dom';

// The homepage cards now hand off to each track's own landing page rather than
// jumping straight into a contact flow — the landing page is where someone
// decides they want the thing they are about to be asked to book.
const LANDING = {
  'data-analytics': { to: '/data-services', label: 'Explore Data Services →' },
  'career-services': { to: '/career-services', label: 'Explore Career Services →' },
};

const ServiceCard = memo(function ServiceCard({ service }) {
  const isTeal = service.id === 'data-analytics';
  const accent = isTeal ? 'var(--teal)' : 'var(--gold)';
  const landing = LANDING[service.id];

  return (
    <article
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--gl)',
      }}
    >
      <div style={{ padding: '32px 32px 28px' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: '14px',
          }}
        >
          {service.track}
        </span>
        <h3
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--navy)',
            marginBottom: '14px',
            letterSpacing: '-0.02em',
          }}
        >
          {service.title}
        </h3>
        <p
          style={{
            fontSize: '0.925rem',
            color: 'var(--gm)',
            lineHeight: 1.7,
            marginBottom: '22px',
          }}
        >
          {service.body}
        </p>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '24px' }}>
          {service.features.map((f) => (
            <li
              key={f}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.875rem',
                color: 'var(--gd)',
                paddingBottom: '9px',
                borderBottom: '1px solid var(--gl)',
              }}
            >
              <span style={{ color: accent, fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <Link
          to={landing.to}
          className={`btn ${isTeal ? 'btn--teal' : 'btn--gold'}`}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {landing.label}
        </Link>
      </div>
    </article>
  );
});

export default ServiceCard;
