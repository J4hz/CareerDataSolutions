import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { posts } from '../data/blog';
import CTASection from '../components/CTASection';
import '../styles/blog.css';
import '../styles/button.css';

function renderBody(body) {
  return body.split('\n\n').map((block, i) => {
    if (block.startsWith('**') && block.endsWith('**')) {
      return <h3 key={i}>{block.slice(2, -2)}</h3>;
    }

    const parts = block.split(/(\*\*[^*]+\*\*)/g);
    const content = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    return <p key={i}>{content}</p>;
  });
}

// Where an in-article CTA sends the reader, per track.
const TRACK_CTA = {
  data:   { to: '/data/contact',   className: 'btn--cta', landing: '/data/services' },
  career: { to: '/career/contact', className: 'btn--gold', landing: '/career/services' },
};

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.id === slug);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('.blog-post__body');
      if (!article) return;
      const { top, height } = article.getBoundingClientRect();
      const windowH = window.innerHeight;
      const scrolled = Math.max(0, -top);
      const total = height - windowH;
      const pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
      setProgress(pct);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) return <Navigate to="/blog" replace />;

  const cta = TRACK_CTA[post.track] ?? TRACK_CTA.data;

  return (
    <main>
      {/* scaleX rather than width, so the scroll handler updates a
          compositor property instead of forcing layout — see blog.css. */}
      <div
        className="blog-post__progress"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden="true"
      />

      <section
        className="blog-post__hero"
        style={{ background: post.headerBg }}
        aria-labelledby="post-heading"
      >
        <div className="blog-post__hero-inner">
          <span className={`blog-post__category blog-post__category--${post.categoryColor}`}>
            {post.category}
          </span>
          <h1 id="post-heading">{post.title}</h1>
          <div className="blog-post__meta">
            <span>{post.author}</span>
            <span className="blog-post__meta-sep" aria-hidden="true" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      <article className="blog-post__body">
        <div className="blog-post__body-inner">
          {renderBody(post.body)}

          <div className="blog-post__inline-cta">
            <p>{post.inlineCta}</p>
            <Link to={cta.to} className={`btn ${cta.className}`}>
              {post.inlineCtaLabel}
            </Link>
            <Link to={cta.landing} className="blog-post__inline-cta-link">
              Or read more about this service first →
            </Link>
          </div>
        </div>
      </article>

      <CTASection />
    </main>
  );
}
