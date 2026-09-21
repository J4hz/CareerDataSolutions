import { memo } from 'react';

const SectionHeader = memo(function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
}) {
  return (
    <header style={{ textAlign: align, marginBottom: '56px' }}>
      {eyebrow && (
        <span
          className="eyebrow"
          style={light ? { color: 'rgba(255,255,255,0.65)' } : undefined}
        >
          {eyebrow}
        </span>
      )}
      <h2
        style={{
          fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          /* light = on a navy band. Otherwise this is page text, so --ink
             (which IS navy in light mode) rather than the fill colour. */
          color: light ? 'var(--white)' : 'var(--ink)',
          marginBottom: subtitle ? '16px' : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            maxWidth: 560,
            margin: align === 'center' ? '0 auto' : 0,
            color: light ? 'rgba(255,255,255,0.65)' : 'var(--gm)',
            fontSize: '1.05rem',
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
});

export default SectionHeader;
