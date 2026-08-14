import '../../styles/skeleton.css';

/**
 * One placeholder shape.
 *
 * Always aria-hidden. A screen reader gains nothing from being told there
 * are four grey rectangles — the surrounding region announces the loading
 * state once, in words (see PageSkeleton), and these are scenery.
 *
 * `variant` picks a shape from skeleton.css: text | title | eyebrow | card.
 * `width` is passed through for the cases where a one-off width reads more
 * naturally than a class, such as staggering the lengths of stacked lines
 * so they look like a paragraph rather than a block.
 */
export default function Skeleton({ variant = 'text', width, className = '', style }) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton skeleton--${variant}${className ? ` ${className}` : ''}`}
      style={{ display: 'block', ...(width ? { width } : null), ...style }}
    />
  );
}
