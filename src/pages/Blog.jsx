import { useState } from 'react';
import { posts } from '../data/blog';
import BlogCard from '../components/ui/BlogCard';
import CTASection from '../components/CTASection';
import '../styles/blog.css';

const filters = ['All', 'Data Analytics', 'Career Strategy'];

const categoryMap = {
  'Data Analytics': 'Data analytics',
  'Career Strategy': 'Career strategy',
};

export default function Blog() {
  const [active, setActive] = useState('All');

  const visible =
    active === 'All'
      ? posts
      : posts.filter((p) => p.category === categoryMap[active]);

  return (
    <main>
      <section className="blog-page__header" aria-labelledby="blog-page-heading">
        <div className="container">
          <span className="eyebrow">Insights from the field</span>
          <h1 id="blog-page-heading">Knowledge that moves you forward</h1>
        </div>
      </section>

      <section className="section blog-page__main" aria-label="Blog articles">
        <div className="container">
          <div className="blog-page__filters" role="group" aria-label="Filter articles">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`blog-page__filter${active === f ? ' blog-page__filter--active' : ''}`}
                aria-pressed={active === f}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="blog-page__grid">
            {visible.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
