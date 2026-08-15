import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { careerPackages } from '../data/packages';
import { useCvUpload, MAX_CV_MB } from '../hooks/useCvUpload';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';
import { packagePricing, formatKES } from '../data/pricing';
import '../styles/contact.css';
import '../styles/order.css';

/* How long to wait for the customer to act on the M-Pesa prompt before giving
   up on the poll. Safaricom expires an unanswered push at about 60s; the extra
   headroom covers a slow callback rather than a slow customer. */
const POLL_TIMEOUT_MS = 120_000;
const POLL_INTERVAL_MS = 3000;

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
  const [status, setStatus] = useState('idle'); // idle | submitting | awaiting | paid | failed
  const [session, setSession] = useState(null); // { orderId, token }
  const [receipt, setReceipt] = useState(null);

  // setErrors is stable, but it is listed so the React Compiler's inferred
  // dependencies match the declared ones and it can still optimize this file.
  const setCvError = useCallback(
    (msg) => setErrors((prev) => ({ ...prev, cv: msg })),
    [setErrors]
  );
  const { cvFile, inputRef, selectFile, handleDrop, openPicker, clearFile, toBase64 } =
    useCvUpload(setCvError);

  useEffect(() => {
    if (status !== 'awaiting' || !session?.token) return undefined;

    let cancelled = false;
    let timer;
    // Set once, when the prompt goes out — the effect only re-runs if the
    // session or status changes, so this is the real start of the wait.
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    const poll = async () => {
      if (cancelled) return;

      if (Date.now() > deadline) {
        setErrors({
          submit:
            'We did not get a confirmation from M-Pesa in time. If you were charged, ' +
            'reply to your order email and we will sort it out.',
        });
        setStatus('failed');
        return;
      }

      try {
        const res = await fetch(`/api/order-status?token=${encodeURIComponent(session.token)}`);
        const body = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (body.status === 'paid') {
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
  }, [status, session]);

  // Same formatter the cards use, so a figure cannot be written one way on the
  // packages page and another here.
  const money = (n) => formatKES(Number(n));

  /* Founding rate, if it is running. `price.kes` is what api/order.js will
     bill — both sides read it out of data/pricing.js — so the total below is
     a statement about the charge rather than a second opinion on it. */
  const price = pkg ? packagePricing(pkg) : null;
  const chargedKES = promo.applied ? promo.amountKES : price?.kes;

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
    if (!form.phone.trim()) e.phone = 'M-Pesa number is required';
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
              <span className="pkg-was__tag">{price.percent}% founding</span>
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
                    <dt>M-Pesa receipt</dt>
                    <dd>{receipt}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : status === 'awaiting' ? (
            <div className="order-result order-result--awaiting">
              <div className="order-result__spinner" aria-hidden="true" />
              <h2 className="order-result__title">Check your phone.</h2>
              <p className="order-result__body">
                We sent an M-Pesa request for{' '}
                <strong>{money(session?.amountKES ?? chargedKES)}</strong> to{' '}
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
                We need your CV to start, and your M-Pesa number to take payment.
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
                <label htmlFor="order-phone">M-Pesa number</label>
                <input id="order-phone" type="tel" placeholder="0712 345 678" {...field('phone')} />
                <span className="order-field-hint">
                  The payment prompt goes to this number.
                </span>
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

              <div className="order-total">
                <span>Total</span>
                <strong>
                  {/* What the total would have been without whichever
                      reduction is in play. A code beats the founding rate
                      rather than stacking with it, so when both are live the
                      struck figure is the founding price — the one the
                      visitor was actually about to pay. */}
                  {(promo.applied || price.discounted) && (
                    <s className="order-total__was">
                      {promo.applied ? money(price.kes) : price.wasKESLabel}
                    </s>
                  )}
                  {money(chargedKES)}
                </strong>
              </div>

              <button
                type="submit"
                className="contact-form-card__submit contact-form-card__submit--gold"
                disabled={status === 'submitting'}
              >
                {status === 'submitting'
                  ? 'Sending...'
                  : `Pay ${money(chargedKES)} via M-Pesa →`}
              </button>

              <p className="contact-form-card__note">
                You will get an M-Pesa prompt on your phone. Your CV is not shared with
                anyone outside CareerDataSolutions.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
