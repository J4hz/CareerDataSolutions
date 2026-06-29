import { memo } from 'react';

const ProcessSteps = memo(function ProcessSteps({ steps, accentColor = 'var(--teal)' }) {
  const isTeal = accentColor === 'var(--teal)';
  const connectorBg = isTeal ? 'rgba(29,158,117,0.15)' : 'rgba(244,168,51,0.15)';

  return (
    <ol
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        listStyle: 'none',
        maxWidth: 680,
        margin: '0 auto',
      }}
    >
      {steps.map((step, i) => (
        <li
          key={step.step}
          style={{
            display: 'flex',
            gap: '20px',
            paddingBottom: i < steps.length - 1 ? '28px' : 0,
            position: 'relative',
          }}
        >
          {i < steps.length - 1 && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 19,
                top: 40,
                bottom: 0,
                width: 2,
                background: connectorBg,
              }}
            />
          )}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: accentColor,
              color: 'var(--white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {step.step}
          </div>
          <div style={{ paddingTop: '8px' }}>
            <strong
              style={{
                display: 'block',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--dark)',
                marginBottom: '4px',
              }}
            >
              {step.title}
            </strong>
            <span style={{ fontSize: '0.9rem', color: 'var(--gm)', lineHeight: 1.6 }}>
              {step.description}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
});

export default ProcessSteps;
