import { memo } from 'react';

const ProcessSteps = memo(function ProcessSteps({ steps, accentColor = 'var(--teal)' }) {
  const isTeal = accentColor === 'var(--teal)';
  const connectorBg = isTeal ? 'rgba(29,158,117,0.2)' : 'rgba(244,168,51,0.2)';

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
