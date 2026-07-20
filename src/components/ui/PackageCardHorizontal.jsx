import { Link } from 'react-router-dom';

const DataIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <rect x="0"  y="9" width="3.5" height="5"  rx="0.5" fill="var(--navy)" />
    <rect x="5"  y="5" width="3.5" height="9"  rx="0.5" fill="var(--navy)" />
    <rect x="10" y="1" width="3.5" height="13" rx="0.5" fill="var(--navy)" />
  </svg>
);

const CareerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M1.5 0 L9 0 L13 4 L13 14 L1.5 14 Z" fill="var(--navy)" />
    <path d="M9 0 L9 4 L13 4 Z" fill="rgba(255,255,255,0.25)" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="var(--gm)" strokeWidth="1.5" />
    <line x1="6.5" y1="6.5" x2="6.5" y2="2.5" stroke="var(--gm)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6.5" y1="6.5" x2="10"  y2="6.5" stroke="var(--gm)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function PackageCardHorizontal({ pkg }) {
  const isData     = pkg.track === 'data';
  const contactPath = isData ? '/data/contact' : '/career/contact';
  const accent     = isData ? 'var(--teal)' : 'var(--gold)';
  const badgeBg    = isData ? 'var(--teal)' : 'var(--gold)';
  const badgeColor = isData ? 'var(--white)' : 'var(--navy)';
  const iconBg     = isData ? 'rgba(29,158,117,0.10)' : 'rgba(244,168,51,0.12)';

  const featuredBorderColor = pkg.featured
    ? (isData ? 'var(--teal)' : 'var(--gold)')
    : 'var(--gl)';
  const featuredBg = pkg.featured
    ? (isData ? 'rgba(29,158,117,0.025)' : 'rgba(244,168,51,0.025)')
    : 'var(--white)';

  const isSingleCol = pkg.features.length <= 3;

  return (
    <article
      className={`pkg-h-card pkg-h-card--${pkg.track}${pkg.featured ? ' pkg-h-card--featured' : ''}`}
      style={{ borderColor: featuredBorderColor, background: featuredBg }}
    >
      {pkg.badge && (
        <div style={{
          position: 'absolute',
          top: '-13px',
          left: '28px',
          background: badgeBg,
          color: badgeColor,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          padding: '4px 16px',
          borderRadius: '100px',
          whiteSpace: 'nowrap',
          zIndex: 1,
        }}>
          {pkg.badge}
        </div>
      )}

      {/* ── LEFT PANEL ── */}
      <div className="pkg-h-left">

        {/* Icon + name block */}
        <div className="pkg-h-top">
          <div className="pkg-h-icon" style={{ background: iconBg }}>
            {isData ? <DataIcon /> : <CareerIcon />}
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '20px',
              color: 'var(--dark)',
              letterSpacing: '-0.4px',
              margin: 0,
              lineHeight: 1.2,
            }}>
              {pkg.name}
            </h3>
          </div>
        </div>

        {/* Description: tier · audience */}
        <p style={{
          fontSize: '13px',
          color: 'var(--gm)',
          lineHeight: 1.55,
          margin: '0 0 22px',
        }}>
          {pkg.tier} · {pkg.audience}
        </p>

        {/* Features label */}
        <p style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--dark)',
          marginBottom: '12px',
          margin: '0 0 12px',
        }}>
          What's included:
        </p>

        {/* Features grid */}
        <ul
          className={`pkg-h-features${isSingleCol ? ' pkg-h-features--single' : ''}`}
          style={{ listStyle: 'none', padding: 0, margin: 0 }}
        >
          {pkg.features.map((f) => (
            <li key={f} className="pkg-h-feature">
              <span style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Tier + timeline tags */}
        <div className="pkg-h-tags">
          <span className="pkg-h-tag">{pkg.tier}</span>
          <span className="pkg-h-tag">{pkg.timeline}</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="pkg-h-right">

        {/* Timeline row */}
        <div className="pkg-h-timeline">
          <ClockIcon />
          {pkg.timeline}
        </div>

        {/* KES price */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '32px',
          letterSpacing: '-1.5px',
          color: accent,
          lineHeight: 1,
          marginBottom: '4px',
        }}>
          {pkg.priceKES}
        </div>

        {/* USD price */}
        <div style={{
          fontSize: '13px',
          color: 'var(--gm)',
          marginBottom: '20px',
        }}>
          (~{pkg.priceUSD})
        </div>

        {/* CTA button */}
        <Link
          to={contactPath}
          className={`pkg-h-cta pkg-h-cta--${pkg.track}`}
          style={{
            background: isData ? 'var(--teal)' : 'var(--gold)',
            color: isData ? 'var(--white)' : 'var(--navy)',
          }}
        >
          Get this package →
        </Link>

        {/* Discovery call note */}
        <Link to={contactPath} className="pkg-h-note">
          <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden="true">
            <polygon points="6,0 0,7 5,7 5,13 11,6 6,6" fill={isData ? 'var(--teal)' : 'var(--gold)'} />
          </svg>
          Book a free discovery call first
        </Link>
      </div>
    </article>
  );
}
