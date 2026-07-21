import { Link } from 'react-router-dom';

export default function PackageCard({ pkg, variant = 'card' }) {
  const isData = pkg.track === 'data';
  const accent = isData ? 'var(--teal)' : 'var(--gold)';
  const badgeBg = isData ? 'var(--teal)' : 'var(--gold)';
  const badgeColor = isData ? 'var(--white)' : 'var(--navy)';
  // Career packages are purchasable, so the CTA goes to checkout with the
  // package preselected. The data track has no checkout yet — every /data/*
  // route still renders ComingSoon (see src/App.jsx).
  const contactPath = isData ? '/data/contact' : `/career/order?pkg=${pkg.id}`;

  if (variant === 'list') {
    const trackPillBg = isData ? 'rgba(29,158,117,0.10)' : 'rgba(244,168,51,0.12)';
    const trackPillColor = isData ? 'var(--teal)' : 'var(--gold-dark)';

    return (
      <article
        className={`pkg-row${pkg.featured ? ' pkg-row--featured' : ''}`}
        style={{ borderLeftColor: accent }}
      >
        {/* Name + meta */}
        <div className="pkg-row__main">
          <h3 className="pkg-row__name">{pkg.name}</h3>
          <div className="pkg-row__pills">
            <span className="pkg-row__track-pill" style={{ background: trackPillBg, color: trackPillColor }}>
              {pkg.trackLabel}
            </span>
            {pkg.badge && (
              <span className="pkg-row__badge" style={{ background: badgeBg, color: badgeColor }}>
                {pkg.badge}
              </span>
            )}
          </div>
          <p className="pkg-row__audience">{pkg.audience}</p>
        </div>

        {/* Features */}
        <ul className="pkg-row__features">
          {pkg.features.map((f) => (
            <li key={f} className="pkg-row__feature">
              <span className="pkg-row__check" style={{ color: accent }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="pkg-row__side">
          <div className="pkg-row__kes" style={{ color: accent }}>{pkg.priceKES}</div>
          <div className="pkg-row__usd">{pkg.priceUSD} · {pkg.timeline}</div>
          <Link
            to={contactPath}
            className="pkg-row__cta"
            style={{ background: isData ? 'var(--teal)' : 'var(--gold)', color: isData ? '#fff' : 'var(--navy)' }}
          >
            Get this package
          </Link>
        </div>
      </article>
    );
  }

  const featuredStyle = pkg.featured ? {
    borderColor: isData ? 'var(--teal)' : 'var(--gold)',
    background: isData ? 'rgba(29,158,117,0.04)' : 'rgba(244,168,51,0.04)',
    boxShadow: isData
      ? '0 12px 40px rgba(29,158,117,0.14)'
      : '0 8px 32px rgba(244,168,51,0.10)',
  } : {};

  return (
    <article
      className={`pkg-card pkg-card--${pkg.track}${pkg.featured ? ' pkg-card--featured' : ''}`}
      style={featuredStyle}
    >
      {pkg.badge && (
        <div
          style={{
            position: 'absolute',
            top: '-13px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: badgeBg,
            color: badgeColor,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            padding: '4px 14px',
            borderRadius: '100px',
            whiteSpace: 'nowrap',
          }}
        >
          {pkg.badge}
        </div>
      )}

      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--dark)', letterSpacing: '-0.4px', marginBottom: '4px' }}>
        {pkg.name}
      </h3>

      <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--gm)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '4px' }}>
        {pkg.tier}
      </div>

      <p style={{ fontSize: '11px', color: 'var(--gm)', fontStyle: 'italic', lineHeight: 1.4, marginBottom: '14px' }}>
        {pkg.audience}
      </p>

      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', letterSpacing: '-1px', color: accent, marginBottom: '2px' }}>
          {pkg.priceKES}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gm)' }}>
          {pkg.priceUSD} · {pkg.timeline}
        </div>
      </div>

      <hr className="pkg-card__divider" />

      <ul className="pkg-card__features">
        {pkg.features.map((f) => (
          <li key={f} className="pkg-card__feature">
            <span className="pkg-card__check">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        to={contactPath}
        className={`pkg-card__cta pkg-card__cta--${pkg.track}`}
        style={{
          background: isData ? 'var(--teal)' : 'var(--gold)',
          color: isData ? '#fff' : 'var(--navy)',
        }}
      >
        Get this package
      </Link>
    </article>
  );
}
