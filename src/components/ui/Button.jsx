import { memo } from 'react';
import { Link } from 'react-router-dom';

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
    return (
      <Link to={to} className={base} style={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={base} style={style} onClick={onClick}>
      {children}
    </button>
  );
});

export default Button;
