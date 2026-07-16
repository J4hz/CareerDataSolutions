import { memo } from 'react';
import { NavLink } from 'react-router-dom';

const Logo = memo(function Logo({ dark = false, size = '1.25rem', as = 'link' }) {
  const leftFill = dark ? 'rgba(255,255,255,0.45)' : 'var(--navy-900)';

  const icon = (
    <svg
      width="33"
      height="28"
      viewBox="0 0 33 28"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="0"  y="16" width="6" height="12" fill={leftFill} />
      <rect x="9"  y="8"  width="6" height="20" fill="var(--teal)" />
      <rect x="18" y="0"  width="6" height="28" fill="var(--gold)" />
    </svg>
  );

  const wordmark = (
    <span
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: size,
        lineHeight: 1,
      }}
    >
      <span style={{ fontWeight: 600, color: dark ? 'var(--white)' : 'var(--navy)' }}>Career</span>
      <span style={{ fontWeight: 800, color: 'var(--teal)' }}>Data</span>
      <span style={{ fontWeight: 600, color: dark ? 'var(--white)' : 'var(--navy)' }}>Solutions</span>
    </span>
  );

  const inner = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      {icon}
      {wordmark}
    </span>
  );

  if (as === 'link') {
    return (
      <NavLink to="/" style={{ textDecoration: 'none' }}>
        {inner}
      </NavLink>
    );
  }

  return <div>{inner}</div>;
});

export default Logo;
