import { Link } from 'react-router-dom';
import '../styles/button.css';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
      }}
    >
      <div>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(5rem, 16vw, 10rem)',
            color: 'rgba(255,255,255,0.2)',
            lineHeight: 1,
            marginBottom: '16px',
          }}
          aria-hidden="true"
        >
          404
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: 'var(--white)',
            marginBottom: '16px',
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            marginBottom: '36px',
            maxWidth: '360px',
            margin: '0 auto 36px',
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn--primary btn--lg">
          Back to home
        </Link>
      </div>
    </main>
  );
}
