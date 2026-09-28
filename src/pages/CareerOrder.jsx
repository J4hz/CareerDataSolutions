import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { careerPackages } from '../data/packages';
import { useCvUpload, MAX_CV_MB } from '../hooks/useCvUpload';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';
import {
  packagePricing,
  formatKES,
  withServiceCharge,
  SERVICE_CHARGE_RATES,
} from '../data/pricing';
import '../styles/contact.css';
import '../styles/order.css';

/* How long to wait for the customer to act on the M-Pesa prompt before giving
   up on the poll. Safaricom expires an unanswered push at about 60s; the extra
   headroom covers a slow callback rather than a slow customer. */
const POLL_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 3000;

/* A card payment is already decided by the time Paystack sends the customer
   back here, so the wait only covers Paystack catching up. Anything still
   unsettled after this was abandoned on the card page. */
const CARD_POLL_TIMEOUT_MS = 30_000;

/* The card checkout leaves this page for Paystack's and comes back with a
   fresh load, so the session survives the trip in sessionStorage. Same tab
   only, gone when the tab closes. */
const CARD_SESSION_KEY = 'cds-card-checkout';

/* Read through useSyncExternalStore so the prerender and the hydration pass
   both see null, and the client picks up the saved checkout straight after.
   Nothing else writes the key while this page is open, so there is nothing
   to subscribe to. */
const subscribeNever = () => () => {};
const readCardSessionRaw = () => {
  try {
    return sessionStorage.getItem(CARD_SESSION_KEY);
  } catch {
    return null;
  }
};
const noCardSession = () => null;

function clearCardSession() {
  try {
    sessionStorage.removeItem(CARD_SESSION_KEY);
  } catch {
    // Storage blocked: nothing was saved, so nothing to clear.
  }
}

/**
 * Paid checkout for a career package: /career/order?pkg=<id>
 *
 * The sibling of /career/contact, which stays free — that page takes a CV for
 * review, this one takes a CV plus payment for a specific package.
 *
 * The package is a query param rather than a path segment because the build
 * prerenders one file per route in src/seo/meta.js; a path param would mean
 * listing every package there and hard-404ing on anything else. An absent or
 * unknown ?pkg falls through to the picker below rather than erroring.
 */
export default function CareerOrder() {
  const [searchParams] = useSearchParams();
  const pkg = careerPackages.find((p) => p.id === searchParams.get('pkg'));

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});

  /* Promo code. The code itself lives only on the server (TEST_PROMO_CODE);
     this just sends what was typed and shows the answer. api/order.js prices
     the charge independently, so `amountKES` here is display only. */
  const [promo, setPromo] = useState({ code: '', applied: false, amountKES: null, checking: false });
  const [method, setMethod] = useState('mpesa'); // mpesa | card
  const [status, setStatus] = useState('idle'); // idle | submitting | awaiting | paid | failed
  const [session, setSession] = useState(null); // { orderId, token }
  const [receipt, setReceipt] = useState(null);

  /* Back from Paystack's card page. Until this page's own state moves off
     'idle', the saved checkout drives it: straight into the wait, where the
     poll below settles it and adopts it into state. */
  const savedRaw = useSyncExternalStore(subscribeNever, readCardSessionRaw, noCardSession);
  const resumed = useMemo(() => {
    try {
      const saved = JSON.parse(savedRaw || 'null');
      return saved?.pkgId === pkg?.id && saved.session?.token ? saved : null;
    } catch {
      return null;
    }
  }, [savedRaw, pkg?.id]);
  const resuming = resumed !== null && status === 'idle';
  const activeStatus = resuming ? 'awaiting' : status;
  const activeSession = resuming ? resumed.session : session;
  const card = resuming || method === 'card';

  // setErrors is stable, but it is listed so the React Compiler's inferred
  // dependencies match the declared ones and it can still optimize this file.
  const setCvError = useCallback(
    (msg) => setErrors((prev) => ({ ...prev, cv: msg })),
    [setErrors]
  );
  const { cvFile, inputRef, selectFile, handleDrop, openPicker, clearFile, toBase64 } =
    useCvUpload(setCvError);

  useEffect(() => {
    if (activeStatus !== 'awaiting' || !activeSession?.token) return undefined;

    let cancelled = false;
    let timer;
    // Set once, when the prompt goes out — the effect only re-runs if the
    // session or status changes, so this is the real start of the wait.
    const deadline = Date.now() + (card ? CARD_POLL_TIMEOUT_MS : POLL_TIMEOUT_MS);

    /* The wait is over either way: forget the saved card checkout, and if this
       load was resumed from it, move what it carried into state, which is what
       the result screens read. */
    const settle = () => {
      clearCardSession();
      if (!resuming) return;
      setMethod('card');
      setSession(resumed.session);
      setForm((f) => ({ ...f, email: resumed.email }));
    };

    const poll = async () => {
      if (cancelled) return;

      if (Date.now() > deadline) {
        settle();
        setErrors({
          submit: card
            ? 'The card payment was not completed. If you were charged, reply to your ' +
              'order email and we will sort it out.'
            : 'We did not get a confirmation from M-Pesa in time. If you were charged, ' +
              'reply to your order email and we will sort it out.',
        });
        setStatus('failed');
        return;
      }

      try {
        const res = await fetch(
          `/api/order-status?token=${encodeURIComponent(activeSession.token)}`
        );
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (body.status === 'paid') {
          settle();
          setReceipt(body.receipt ?? null);
          setStatus('paid');
          return;
        }
        // A rail that says "failed" is final, and so is a 4xx: the token is
        // tampered, malformed or expired, and polling again cannot fix any of
        // those. Everything else is this endpoint having a bad moment rather
        // than the customer's payment going wrong — a 429 from the poll limit,
        // a 5xx from a Daraja blip — while the prompt is still live on their
        // phone. Those keep polling, exactly like the dropped request in the
        // catch below, and POLL_TIMEOUT_MS is what ends the wait.
        const fatal =
          body.status === 'failed' || (!res.ok && res.status < 500 && res.status !== 429);

        if (fatal) {
          settle();
          setErrors({ submit: body.error || 'The payment was not completed.' });
          setStatus('failed');
          return;
        }
      } catch {
        // A dropped poll is not a failed payment — the phone prompt is still
        // live, so keep trying until the timeout above decides otherwise.
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeStatus, activeSession, card, resuming, resumed]);

  // Same formatter the cards use, so a figure cannot be written one way on the
  // packages page and another here.
  const money = (n) => formatKES(Number(n));

  /* Founding rate, if it is running. `price.kes` is what api/order.js will
     bill — both sides read it out of data/pricing.js — so the total below is
     a statement about the charge rather than a second opinion on it. */
  const price = pkg ? packagePricing(pkg) : null;
  const chargedKES = promo.applied ? promo.amountKES : price?.kes;
  // Same function api/order.js bills with, so the total shown is the charge.
  const { totalKES, serviceChargeKES } = withServiceCharge(chargedKES, card ? 'card' : 'mpesa');
  const serviceRatePct = +(SERVICE_CHARGE_RATES[card ? 'card' : 'mpesa'] * 100).toFixed(1);

  /* What the package would have cost without whichever reduction is in play.
     A code beats the founding rate rather than stacking with it, so when both
     are live the struck figure is the founding price — the one the visitor
     was actually about to pay. */
  const wasLabel = !price
    ? null
    : promo.applied
      ? money(price.kes)
      : price.discounted
        ? price.wasKESLabel
        : null;

  const applyPromo = async () => {
    const code = promo.code.trim();
    if (!code) return;
    setPromo((p) => ({ ...p, checking: true }));
    setErrors((e) => ({ ...e, promo: null }));
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, packageId: pkg.id }),
      });
      // A transport failure must not read as "wrong code". /api/* does not
      // exist under `npm run dev` (Vite alone serves no functions), so without
      // this an unreachable endpoint looks exactly like a rejected code.
      if (!res.ok) {
        console.error(`/api/promo returned ${res.status}. Functions do not run under 'npm run dev'.`);
        setPromo((p) => ({ ...p, checking: false }));
        setErrors((e) => ({
          ...e,
          promo: 'Could not check that code right now. Please try again.',
        }));
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (body.valid) {
        setPromo((p) => ({ ...p, applied: true, amountKES: body.amountKES, checking: false }));
      } else {
        setPromo((p) => ({ ...p, applied: false, amountKES: null, checking: false }));
        setErrors((e) => ({ ...e, promo: 'That code is not valid.' }));
      }
    } catch {
      setPromo((p) => ({ ...p, checking: false }));
      setErrors((e) => ({ ...e, promo: 'Could not check that code. Please try again.' }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!card && !form.phone.trim()) e.phone = 'M-Pesa number is required';
    if (!cvFile) e.cv = 'Please upload your CV';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const cvBase64 = await toBase64();
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // No amount is sent: api/order.js prices the order from the package id
        // so the total cannot be edited on the way through.
        body: JSON.stringify({
          packageId: pkg.id,
          ...form,
          method,
          // Sent as typed. The server re-checks it and decides the price.
          promoCode: promo.applied ? promo.code.trim() : undefined,
          cvBase64,
          cvName: cvFile.name,
          cvType: cvFile.type,
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ submit: body.error || 'Something went wrong. Please try again.' });
        setStatus('failed');
        return;
      }

      if (card) {
        if (!body.authorizationUrl) {
          setErrors({ submit: 'We could not start the card payment. Please try again.' });
          setStatus('failed');
          return;
        }
        // Off to Paystack's page. Without storage the return trip cannot find
        // the order, so a blocked sessionStorage is a stop, not a warning.
        try {
          sessionStorage.setItem(
            CARD_SESSION_KEY,
            JSON.stringify({
              pkgId: pkg.id,
              email: form.email,
              session: { orderId: body.orderId, token: body.token, amountKES: body.amountKES },
            })
          );
        } catch {
          setErrors({
            submit:
              'Your browser is blocking the storage card checkout needs. Please pay by ' +
              'M-Pesa, or message us on WhatsApp.',
          });
          setStatus('failed');
          return;
        }
        window.location.assign(body.authorizationUrl);
        return; // status stays 'submitting' while the browser navigates away
      }

      // The server's amount is authoritative; show what was actually charged.
      setSession({ orderId: body.orderId, token: body.token, amountKES: body.amountKES });
      setStatus('awaiting');
    } catch (err) {
      console.error('Order error:', err);
      setErrors({ submit: 'Something went wrong. Please try again or message us on WhatsApp.' });
      setStatus('failed');
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
    className: errors[key] ? 'field-error' : '',
  });

  // ── No package chosen: pick one ──
  if (!pkg) {
    return (
      <main className="contact-page">
        <div className="order-picker">
          <div className="contact-eyebrow contact-eyebrow--gold">Career Services</div>
          <h1 className="contact-page__h1">Choose your package</h1>
          <p className="contact-page__sub">
            Pick the package you want and we will take your details on the next step.
          </p>
          <div className="order-picker__grid">
            {careerPackages.map((p) => {
              const pPrice = packagePricing(p);
              return (
                <Link key={p.id} to={`/career/order?pkg=${p.id}`} className="order-picker__card">
                  <span className="order-picker__name">{p.name}</span>
                  <span className="order-picker__tier">{p.tier}</span>
                  <span className="order-picker__price">
                    {pPrice.discounted && (
                      <>
                        <span className="sr-only">Regular price </span>
                        <s className="order-picker__was">{pPrice.wasKESLabel}</s>{' '}
                        <span className="sr-only">, now</span>
                      </>
                    )}
                    {pPrice.kesLabel}
                  </span>
                  <span className="order-picker__timeline">{p.timeline}</span>
                </Link>
              );
            })}
          </div>
          <p className="order-picker__alt">
            Not ready to buy? <Link to="/career/contact">Get a free CV review first →</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="contact-page">
      <div className="order-layout">
        {/* ── Order summary ── */}
        <aside className="order-summary">
          <div className="contact-eyebrow contact-eyebrow--gold">Your order</div>
          <h1 className="order-summary__name">{pkg.name}</h1>
          <p className="order-summary__tier">
            {pkg.tier} · {pkg.audience}
          </p>

          {price.discounted && (
            <div className="pkg-was order-summary__was">
              <span className="sr-only">Regular price </span>
              <s className="pkg-was__price">
                {price.wasKESLabel} / {price.wasUSDLabel}
              </s>
              <span className="pkg-was__tag">{price.percent}% discount</span>
              <span className="sr-only">, now</span>
            </div>
          )}
          <div className="order-summary__price">
            <span className="order-summary__kes">{price.kesLabel}</span>
            <span className="order-summary__usd">{price.usdLabel}</span>
          </div>
          <p className="order-summary__timeline">Delivered in {pkg.timeline}</p>

          <ul className="order-summary__features">
            {pkg.features.map((f) => (
              <li key={f}>
                <span className="order-summary__check">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <Link to="/career/packages" className="order-summary__change">
            ← Change package
          </Link>

          <div className="order-summary__help">
            <p>Questions before you pay?</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
        </aside>

        {/* ── Form / payment states ── */}
        <div className="order-main">
          {status === 'paid' ? (
            <div className="order-result order-result--paid">
              <div className="order-result__icon">✓</div>
              <h2 className="order-result__title">Payment received.</h2>
              <p className="order-result__body">
                Your {pkg.name} order is confirmed and your CV is with us. A receipt is on
                its way to {form.email}. We will come back to you within {pkg.timeline}.
              </p>
              <dl className="order-result__meta">
                <div>
                  <dt>Order ref</dt>
                  <dd>{session?.orderId}</dd>
                </div>
                {receipt && (
                  <div>
                    <dt>{card ? 'Payment ref' : 'M-Pesa receipt'}</dt>
                    <dd>{receipt}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : activeStatus === 'awaiting' && card ? (
            <div className="order-result order-result--awaiting">
              <div className="order-result__spinner" aria-hidden="true" />
              <h2 className="order-result__title">Confirming your payment.</h2>
              <p className="order-result__body">
                Checking your card payment of{' '}
                <strong>{money(activeSession?.amountKES ?? totalKES)}</strong> with Paystack.
              </p>
              <p className="order-result__hint" role="status" aria-live="polite">
                This takes a few seconds… keep this page open.
              </p>
              <p className="order-result__ref">Order ref: {activeSession?.orderId}</p>
            </div>
          ) : status === 'awaiting' ? (
            <div className="order-result order-result--awaiting">
              <div className="order-result__spinner" aria-hidden="true" />
              <h2 className="order-result__title">Check your phone.</h2>
              <p className="order-result__body">
                We sent an M-Pesa request for{' '}
                <strong>{money(session?.amountKES ?? totalKES)}</strong> to{' '}
                <strong>{form.phone}</strong>. Enter your PIN to complete the order.
              </p>
              <p className="order-result__hint" role="status" aria-live="polite">
                Waiting for confirmation… keep this page open.
              </p>
              <p className="order-result__ref">Order ref: {session?.orderId}</p>
            </div>
          ) : (
            <form className="contact-form-card" onSubmit={handleSubmit} noValidate>
              <p className="contact-form-card__title">Your details</p>
              <p className="contact-form-card__subtitle">
                We need your CV to start. Pay by M-Pesa or card.
              </p>

              {errors.submit && (
                <div className="contact-form-card__error-banner">{errors.submit}</div>
              )}

              <div className="contact-form-card__field">
                <label htmlFor="order-name">Your name</label>
                <input id="order-name" type="text" placeholder="First and last name" {...field('name')} />
                {errors.name && <span className="field-error-msg">{errors.name}</span>}
              </div>

              <div className="contact-form-card__field">
                <label htmlFor="order-email">Email address</label>
                <input id="order-email" type="email" placeholder="your@email.com" {...field('email')} />
                {errors.email && <span className="field-error-msg">{errors.email}</span>}
              </div>

              <div className="contact-form-card__field">
                <fieldset className="order-method">
                  <legend>Pay with</legend>
                  {[
                    ['mpesa', 'M-Pesa'],
                    ['card', 'Card'],
                  ].map(([value, label]) => (
                    <label key={value} className="order-method__option">
                      <input
                        type="radio"
                        name="order-method"
                        value={value}
                        checked={method === value}
                        onChange={() => {
                          setMethod(value);
                          setErrors((e) => ({ ...e, phone: null }));
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
              </div>

              <div className="contact-form-card__field">
                <label htmlFor="order-phone">
                  {card ? (
                    <>
                      Phone number <span className="field-optional">Optional</span>
                    </>
                  ) : (
                    'M-Pesa number'
                  )}
                </label>
                <input
                  id="order-phone"
                  type="tel"
                  placeholder={card ? 'In case we need to reach you' : '0712 345 678'}
                  {...field('phone')}
                />
                {!card && (
                  <span className="order-field-hint">
                    The payment prompt goes to this number.
                  </span>
                )}
                {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
              </div>

              <div className="contact-form-card__field">
                <label>Upload your CV</label>
                <div
                  className={[
                    'cv-dropzone',
                    cvFile ? 'cv-dropzone--has-file' : '',
                    errors.cv ? 'cv-dropzone--error' : '',
                  ].join(' ')}
                  onClick={openPicker}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {cvFile ? (
                    <div className="cv-dropzone__file">
                      <span className="cv-dropzone__filename">{cvFile.name}</span>
                      <span className="cv-dropzone__size">
                        {(cvFile.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        type="button"
                        className="cv-dropzone__remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="cv-dropzone__prompt">
                      <span className="cv-dropzone__icon">↑</span>
                      <span className="cv-dropzone__text">
                        Drop your CV here or click to browse
                      </span>
                      <span className="cv-dropzone__hint">
                        PDF or Word · Max {MAX_CV_MB}MB
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => selectFile(e.target.files[0])}
                />
                {errors.cv && <span className="field-error-msg">{errors.cv}</span>}
              </div>

              <div className="contact-form-card__field">
                <label htmlFor="order-notes">
                  Anything we should know? <span className="field-optional">Optional</span>
                </label>
                <textarea
                  id="order-notes"
                  rows={3}
                  placeholder="Target role, deadline, specific concerns..."
                  {...field('message')}
                />
              </div>

              {/* Promo code. Validated server-side; the code is never in this
                  bundle. See api/_lib/promo.js. */}
              <div className="contact-form-card__field">
                <label htmlFor="order-promo">
                  Promo code <span className="field-optional">Optional</span>
                </label>
                <div className="order-promo">
                  <input
                    id="order-promo"
                    type="text"
                    placeholder="Enter code"
                    value={promo.code}
                    disabled={promo.applied}
                    onChange={(e) => setPromo((p) => ({ ...p, code: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyPromo();
                      }
                    }}
                    className={errors.promo ? 'field-error' : ''}
                  />
                  {promo.applied ? (
                    <button
                      type="button"
                      className="order-promo__btn"
                      onClick={() => {
                        setPromo({ code: '', applied: false, amountKES: null, checking: false });
                        setErrors((e) => ({ ...e, promo: null }));
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="order-promo__btn"
                      onClick={applyPromo}
                      disabled={promo.checking || !promo.code.trim()}
                    >
                      {promo.checking ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {errors.promo && <span className="field-error-msg">{errors.promo}</span>}
                {promo.applied && (
                  <span className="order-promo__ok">Code applied.</span>
                )}
              </div>

              {/* The service charge is itemised rather than folded in, so the
                  package keeps its advertised price and the extra is visibly
                  the payment fee — and changes as the method is switched. */}
              {serviceChargeKES > 0 && (
                <dl className="order-breakdown">
                  <div>
                    <dt>{pkg.name}</dt>
                    <dd>
                      {wasLabel && <s className="order-total__was">{wasLabel}</s>}
                      {money(chargedKES)}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      Service charge{' '}
                      <span className="order-breakdown__note">
                        ({serviceRatePct}% {card ? 'card' : 'M-Pesa'} processing fee)
                      </span>
                    </dt>
                    <dd>{money(serviceChargeKES)}</dd>
                  </div>
                </dl>
              )}

              <div className="order-total">
                <span>Total</span>
                <strong>
                  {/* With a breakdown above, the struck price sits on the
                      package line instead: here, beside a total that includes
                      the service charge, it would read as a comparison it is
                      not. */}
                  {serviceChargeKES === 0 && wasLabel && (
                    <s className="order-total__was">{wasLabel}</s>
                  )}
                  {money(totalKES)}
                </strong>
              </div>

              <button
                type="submit"
                className="contact-form-card__submit contact-form-card__submit--gold"
                disabled={status === 'submitting'}
              >
                {status === 'submitting'
                  ? 'Sending...'
                  : `Pay ${money(totalKES)} ${card ? 'by card' : 'via M-Pesa'} →`}
              </button>

              <p className="contact-form-card__note">
                {card
                  ? 'You will enter your card details on Paystack’s secure page; they never reach us.'
                  : 'You will get an M-Pesa prompt on your phone.'}{' '}
                Your CV is not shared with anyone outside CareerDataSolutions.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
