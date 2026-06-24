import { memo } from 'react';
import { Link } from 'react-router-dom';

const BlogCard = memo(function BlogCard({ post }) {
  const catStyle = {
    display: 'inline-block',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '16px',
    background: 'rgba(107,114,128,0.08)',
    color: 'var(--gd)',
  };

  return (
    <article
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--gl)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow var(--transition), transform var(--transition)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div
        style={{
          height: 140,
          background: post.headerBg,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '20px 24px',
        }}
        aria-hidden="true"
      />

      <div style={{ padding: '28px 28px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={catStyle}>{post.category}</span>

        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: 'var(--navy)',
            letterSpacing: '-0.015em',
            lineHeight: 1.3,
            marginBottom: '12px',
            flex: 1,
          }}
        >
          {post.title}
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--gm)',
            lineHeight: 1.65,
            marginBottom: '20px',
          }}
        >
          {post.excerpt}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--gm)' }}>
            {post.author} · {post.readTime}
          </span>
          <Link
            to={post.slug}
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--navy)',
              textDecoration: 'none',
            }}
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
});

export default BlogCard;
