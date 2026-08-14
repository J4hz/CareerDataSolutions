import Skeleton from './ui/Skeleton';

/**
 * The Suspense fallback for lazy() routes, replacing a centred "Loading…".
 *
 * Announced once, in words, for anyone who cannot see the shapes: the
 * region carries role="status" and a visually-hidden message, and every
 * shape inside is aria-hidden. aria-busy tells assistive tech the region is
 * mid-update rather than finished and empty.
 *
 * See styles/skeleton.css for why this is generic rather than per-route,
 * and why it is not shown on a first load at all.
 */
export default function PageSkeleton() {
  return (
    <div className="page-skeleton" role="status" aria-busy="true" aria-live="polite">
      <div className="container">
        <div className="page-skeleton__head">
          <Skeleton variant="eyebrow" />
          <Skeleton variant="title" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </div>

        <div className="page-skeleton__grid">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>

      <span className="sr-only">Loading page</span>
    </div>
  );
}
