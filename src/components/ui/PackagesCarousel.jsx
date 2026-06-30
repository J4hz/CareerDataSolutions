import { useState, useEffect, useRef, useCallback } from 'react';
import PackageCard from './PackageCard';

function getItemsVisible() {
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1100) return 2;
  return 3;
}

export default function PackagesCarousel({ packages }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsVisible, setItemsVisible] = useState(getItemsVisible);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    const update = () => setItemsVisible(getItemsVisible());
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  const total = packages.length;
  const maxIndex = Math.max(0, total - itemsVisible);

  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? maxIndex : i - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [isPaused, next]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) next();
    else if (delta < -40) prev();
    touchStartX.current = null;
  };

  const gap = 24;
  const cardWidth = `calc((100% - ${(itemsVisible - 1) * gap}px) / ${itemsVisible})`;
  const translateX = `calc(${-currentIndex} * ((100% + ${gap}px) / ${itemsVisible}))`;

  const currentTrack = packages[currentIndex]?.track;
  const trackLabel = currentTrack === 'data' ? 'Data Analytics' : 'Career Services';
  const trackColor = currentTrack === 'data' ? 'var(--teal)' : 'var(--gold)';

  return (
    <div
      className="packages-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="packages-carousel__track-wrap">
        <div
          className="packages-carousel__track"
          style={{ transform: `translateX(${translateX})` }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              style={{ width: cardWidth, flexShrink: 0, display: 'flex', minHeight: '480px' }}
            >
              <PackageCard pkg={pkg} />
            </div>
          ))}
        </div>
      </div>

      <button
        className="packages-carousel__arrow packages-carousel__arrow--prev"
        onClick={prev}
        aria-label="Previous package"
      >
        ‹
      </button>
      <button
        className="packages-carousel__arrow packages-carousel__arrow--next"
        onClick={next}
        aria-label="Next package"
      >
        ›
      </button>

      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: '10px',
          color: trackColor,
          transition: 'color 0.3s',
        }}
      >
        {trackLabel}
      </div>

      <div className="packages-carousel__dots" role="tablist">
        {packages.map((pkg, i) => (
          <button
            key={pkg.id}
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`Go to ${pkg.name}`}
            className={`packages-carousel__dot${i === currentIndex ? ' packages-carousel__dot--active' : ''}`}
            style={i === currentIndex ? { background: pkg.track === 'data' ? 'var(--teal)' : 'var(--gold)' } : {}}
            onClick={() => setCurrentIndex(Math.min(i, maxIndex))}
          />
        ))}
      </div>
    </div>
  );
}
