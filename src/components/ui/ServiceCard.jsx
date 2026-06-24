import { memo } from 'react';
import { CALENDLY_URL } from '../../config';

const ServiceCard = memo(function ServiceCard({ service }) {
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
            color: 'var(--gm)',
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
              <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--dark)',
            marginBottom: '20px',
          }}
        >
          {service.price}
        </p>

        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {service.cta}
        </a>
      </div>
    </article>
  );
});

export default ServiceCard;
