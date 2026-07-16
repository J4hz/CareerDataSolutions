import { memo } from 'react';

const ProcessSteps = memo(function ProcessSteps({ steps, accentColor = 'var(--accent)' }) {
  // Faded connector line between steps. Derived from the accent so it holds
  // for the theme-driven var(--accent) as well as an explicit track colour.
  const connectorBg =
    accentColor === 'var(--gold)' ? 'rgba(200,154,68,0.2)'
    : accentColor === 'var(--teal)' ? 'rgba(31,138,130,0.2)'
    : 'var(--accent-glow)';

  return (
    <ol className="process-steps" style={{ listStyle: 'none' }}>
      {steps.map((step, i) => (
        <li key={step.step} className="process-steps__item">
          {i < steps.length - 1 && (
            <div aria-hidden="true" className="process-steps__connector" style={{ background: connectorBg }} />
          )}

          <div className="process-steps__visual">
            <div className="process-steps__label" style={{ color: accentColor }}>
              Step {step.step}
            </div>
            <div className="process-steps__circle" style={{ background: accentColor }}>
              {step.step}
            </div>
          </div>

          <div className="process-steps__content">
            <strong className="process-steps__title">{step.title}</strong>
            <span className="process-steps__desc">{step.description}</span>
          </div>
        </li>
      ))}
    </ol>
  );
});

export default ProcessSteps;
