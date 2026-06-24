import { memo } from 'react';
import { CALENDLY_URL } from '../../config';

const PackageCard = memo(function PackageCard({ pkg, compact = false }) {
  const trackLabel = pkg.track === 'data' ? 'Data analytics' : 'Career services';

  return (
    <article
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: pkg.popular ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        border: pkg.popular ? '2px solid var(--navy)' : '1px solid var(--gl)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {pkg.popular && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'var(--navy)',
            color: 'var(--white)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          Most popular
        </div>
      )}

      <div style={{ padding: compact ? '24px' : '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--gm)',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          {trackLabel}
        </span>

        <h3
          style={{
            fontSize: compact ? '1.15rem' : '1.35rem',
            fontWeight: 800,
            color: 'var(--navy)',
            marginBottom: '6px',
            letterSpacing: '-0.02em',
          }}
        >
          {pkg.name}
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <span
            style={{
              fontSize: compact ? '1.4rem' : '1.7rem',
              fontWeight: 800,
              color: 'var(--dark)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {pkg.kes}
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--gm)',
              marginLeft: '8px',
            }}
          >
            {pkg.usd}
          </span>
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--gm)',
              marginTop: '2px',
            }}
          >
            {pkg.delivery}
          </div>
        </div>

        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '24px',
            flex: 1,
          }}
        >
          {pkg.features.map((f) => (
            <li
              key={f}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '9px',
                fontSize: '0.875rem',
                color: 'var(--gd)',
              }}
            >
              <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {pkg.cta}
        </a>
      </div>
    </article>
  );
});

export default PackageCard;
