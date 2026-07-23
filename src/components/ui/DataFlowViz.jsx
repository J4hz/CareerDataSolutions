import { memo } from 'react';

/**
 * The data track's hero visual: scattered points resolving into ordered bars,
 * cross-fading on a loop. It is the service in one picture, which is why it
 * sits beside the headline rather than under it.
 *
 * Purely decorative. The stage is hidden from assistive tech and the whole
 * thing freezes on the "ordered" frame under prefers-reduced-motion (see
 * .lp-viz in src/styles/landing.css) — a looping animation next to body copy
 * is exactly what that setting exists to stop.
 */

/* Percentage coordinates, fixed rather than random so the scatter is the same
   on the server-rendered pass and the client one. */
const DOTS = [
  [8, 20], [22, 60], [38, 15], [52, 75], [65, 35],
  [78, 55], [15, 80], [45, 45], [70, 10], [88, 68],
  [30, 90], [58, 20], [10, 40], [85, 30], [25, 65],
  [95, 50], [42, 70], [62, 88], [5, 60], [92, 15],
];

const BARS = [
  { label: 'Sales', height: 38 },
  { label: 'Ops', height: 72 },
  { label: 'HR', height: 55 },
  { label: 'Fin', height: 90 },
  { label: 'Q3', height: 64 },
];

const DataFlowViz = memo(function DataFlowViz() {
  return (
    <figure className="lp-viz">
      <div className="lp-viz__head" aria-hidden="true">
        <span>Source data</span>
        <span>Live dashboard</span>
      </div>

      <div className="lp-viz__stage" aria-hidden="true">
        <div className="lp-viz__dots">
          {DOTS.map(([x, y]) => (
            <span
              key={`${x}-${y}`}
              className="lp-viz__dot"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          ))}
        </div>

        <div className="lp-viz__bars">
          {BARS.map(({ label, height }) => (
            <div key={label} className="lp-viz__bar-col">
              <div className="lp-viz__bar" style={{ height: `${height}%` }} />
              <span className="lp-viz__bar-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="lp-viz__caption">
        Scattered spreadsheets in. One live view out.
      </figcaption>
    </figure>
  );
});

export default DataFlowViz;
