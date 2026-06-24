import { memo } from 'react';

const Button = memo(function Button({
  children,
  variant = 'primary',
  href,
  to,
  external,
  onClick,
  type = 'button',
  style,
  className = '',
}) {
  const base = `btn btn--${variant} ${className}`;

  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  if (href) {
    return (
      <a href={href} className={base} style={style} {...externalProps}>
        {children}
      </a>
    );
  }

  if (to) {
    // Use regular anchor for internal nav (works with react-router Link via parent)
    return (
      <a href={to} className={base} style={style}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={base} style={style} onClick={onClick}>
      {children}
    </button>
  );
});

export default Button;
