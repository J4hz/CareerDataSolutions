import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alaCarteServices,
  alaCartePackage,
  A_LA_CARTE_ID,
  A_LA_CARTE_PRICE_KES,
  A_LA_CARTE_PRICE_USD,
} from '../../data/packages';
import { packagePricing, formatKES, formatUSD } from '../../data/pricing';

/**
 * À la carte career services: pick any mix at one flat price each and see the
 * running total. Rendered under the career package cards on /career/services
 * and /career/packages.
 *
 * The total comes out of packagePricing(), the same function the cards and
 * api/order.js price from, so it shows the founding rate exactly when the
 * cards do. Checkout receives only the chosen ids; the server rebuilds the
 * price from them.
 */
export default function AlaCarte() {
  const [chosen, setChosen] = useState([]);
  const navigate = useNavigate();

  const pkg = alaCartePackage(chosen);
  const price = pkg ? packagePricing(pkg) : null;
  const count = pkg ? pkg.services.length : 0;

  const toggle = (id) =>
    setChosen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const checkout = () => {
    if (!pkg) return;
    navigate(`/career/order?pkg=${A_LA_CARTE_ID}&services=${pkg.services.join(',')}`);
  };

  return (
    <section className="alacarte" aria-labelledby="alacarte-heading">
      <div className="alacarte__head">
        <h3 id="alacarte-heading" className="alacarte__title">À la carte</h3>
        <p className="alacarte__intro">
          Need one or two things rather than a package? Choose the services you want,{' '}
          {formatKES(A_LA_CARTE_PRICE_KES)} / {formatUSD(A_LA_CARTE_PRICE_USD)} each.
        </p>
      </div>

      <fieldset className="alacarte__options">
        <legend className="sr-only">Choose your services</legend>
        {alaCarteServices.map((s) => (
          <label key={s.id} className="alacarte__option">
            <input
              type="checkbox"
              className="alacarte__checkbox"
              checked={chosen.includes(s.id)}
              onChange={() => toggle(s.id)}
            />
            <span>{s.name}</span>
          </label>
        ))}
      </fieldset>

      <div className="alacarte__footer">
        {/* Announced on every change, so a screen reader hears the new total
            straight after ticking a box. */}
        <p className="alacarte__total" aria-live="polite" aria-atomic="true">
          {count === 0 ? (
            'No services selected yet.'
          ) : (
            <>
              {count} service{count === 1 ? '' : 's'} selected. Total:{' '}
              {price.discounted && (
                <>
                  <span className="sr-only">regular price </span>
                  <s className="alacarte__was">
                    {price.wasKESLabel} / {price.wasUSDLabel}
                  </s>{' '}
                  <span className="sr-only">, now </span>
                </>
              )}
              <strong className="alacarte__amount">
                {price.kesLabel} / {price.usdLabel}
              </strong>
            </>
          )}
        </p>
        <button
          type="button"
          className="pkg-card__cta pkg-card__cta--career alacarte__cta"
          onClick={checkout}
          disabled={count === 0}
        >
          Continue to checkout
        </button>
      </div>
    </section>
  );
}
