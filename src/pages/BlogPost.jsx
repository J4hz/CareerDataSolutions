import { useParams, Link, Navigate } from 'react-router-dom';
import { CALENDLY_URL } from '../config';
import { posts } from '../data/blog';
import CTASection from '../components/CTASection';
import '../styles/blog.css';
import '../styles/button.css';

function renderBody(body) {
  return body.split('\n\n').map((block, i) => {
    if (block.startsWith('**') && block.endsWith('**')) {
      return <h3 key={i} style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark)', margin: '32px 0 12px' }}>{block.slice(2, -2)}</h3>;
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

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.id === slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <main>
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
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Book a free discovery call
            </a>
          </div>
        </div>
      </article>

      <CTASection />
    </main>
  );
}
