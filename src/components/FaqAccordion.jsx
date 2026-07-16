import { useState, useId } from 'react';
import '../styles/faq.css';

/**
 * Single-open FAQ accordion.
 *
 * Reimplements the reference file's vanilla-JS .faq-item pattern (one item
 * open at a time, "+" rotating to "×") as controlled React state. The
 * open/close animation is the CSS grid 0fr→1fr trick, so no height
 * measuring is needed. Accent colours come from var(--accent) via the
 * layout shell.
 */
export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);
  const baseId = useId();

  const toggle = (i) => setOpenIndex((current) => (current === i ? null : i));

  return (
    <div className="faq-acc">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const panelId = `${baseId}-panel-${i}`;

        return (
          <div key={item.q} className={`faq-acc__item${isOpen ? ' is-open' : ''}`}>
            <h3 className="faq-acc__heading">
              <button
                type="button"
                className="faq-acc__q"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
              >
                <span>{item.q}</span>
                <span className="faq-acc__plus" aria-hidden="true">+</span>
              </button>
            </h3>
            <div id={panelId} className="faq-acc__a" role="region">
              <div className="faq-acc__a-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
