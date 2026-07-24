import { Link } from 'react-router-dom';

export default function PackageCard({ pkg, variant = 'card' }) {
  const isData = pkg.track === 'data';
  const accent = isData ? 'var(--teal)' : 'var(--gold)';
  const badgeBg = isData ? 'var(--teal)' : 'var(--gold)';
  const badgeColor = isData ? 'var(--white)' : 'var(--navy)';
  // Career packages are purchasable, so the CTA goes to checkout with the
  // package preselected. Data tiers are quoted rather than sold: the price on
  // the card is a starting point, the real one is fixed in writing after the
  // discovery call, so the CTA books the call instead of taking money.
  const contactPath = isData ? '/data/contact' : `/career/order?pkg=${pkg.id}`;
  const ctaLabel = isData ? 'Book a discovery call' : 'Get this package';
  // Both currencies read as one price on a single line, USD first, with the
  // timeline dropped to the line below. Every tier publishes both today; the
  // fallback keeps a card readable if a future one ships without a USD price,
  // by promoting KES to the lead slot with nothing trailing it.
  const priceLead = pkg.priceUSD || pkg.priceKES;
  const priceTrail = pkg.priceUSD ? pkg.priceKES : null;

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
          {pkg.pricePrefix && <div className="pkg-row__price-prefix">{pkg.pricePrefix}</div>}
          <div className="pkg-row__price" style={{ color: accent }}>
            <span className="pkg-row__price-part">{priceLead}</span>
            {priceTrail && (
              <>
                {' / '}
                <span className="pkg-row__price-part">{priceTrail}</span>
              </>
            )}
          </div>
          <div className="pkg-row__timeline">{pkg.timeline}</div>
          <Link
            to={contactPath}
            className="pkg-row__cta"
            style={{ background: isData ? 'var(--teal)' : 'var(--gold)', color: isData ? 'var(--white)' : 'var(--navy)' }}
          >
            {ctaLabel}
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
        {pkg.pricePrefix && (
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gm)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
            {pkg.pricePrefix}
          </div>
        )}
        {/* Both currencies at one size in one colour, so the pair reads as a
            single price rather than a headline with a footnote. Sized in
            packages.css, where a media query can hold the longest string — the
            retainer's two /mo figures — on one line in a third-width card. */}
        <div className="pkg-card__price" style={{ color: accent }}>
          <span className="pkg-card__price-part">{priceLead}</span>
          {priceTrail && (
            <>
              {' / '}
              <span className="pkg-card__price-part">{priceTrail}</span>
            </>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gm)' }}>
          {pkg.timeline}
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
          color: isData ? 'var(--white)' : 'var(--navy)',
        }}
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
