import { useState, useEffect, useCallback, useRef } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { CAL_NAMESPACE, CAL_LINK, WHATSAPP_URL } from '../config';
import '../styles/contact.css';

const expectItems = [
  'Tell us a little about yourself and what you\'re working on.',
  'Pick a time that works for you.',
  'We\'ll come prepared with ideas and an honest assessment.',
];

export default function Contact() {
  const [showCal, setShowCal]         = useState(false);
  const [formData, setFormData]       = useState({ name: '', email: '', phone: '', reason: '', discussion: '' });
  const [submitting, setSubmitting]   = useState(false);
  const [bookingDone, setBookingDone] = useState(false);
  const [errors, setErrors]           = useState({});

  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim())  newErrors.name  = true;
    if (!formData.email.trim()) newErrors.email = true;
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    setShowCal(true);
    setSubmitting(false);
  }, [formData]);

  const handleBookingSuccess = useCallback(async () => {
    setBookingDone(true);
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataRef.current),
      });
    } catch (err) {
      console.error('Notify error:', err);
    }
  }, []);

  useEffect(() => {
    if (!showCal) return;
    getCalApi({ namespace: CAL_NAMESPACE }).then((cal) => {
      cal('ui', {
        theme: 'light',
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
      cal('on', {
        action: 'bookingSuccessful',
        callback: handleBookingSuccess,
      });
    });
  }, [showCal, handleBookingSuccess]);

  if (showCal) {
    return (
      <main className="contact-cal">
        <div className="contact-cal__inner">
          <button className="contact-cal__back" onClick={() => setShowCal(false)}>
            ← Back
          </button>

          <div className="contact-cal__header">
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--dark)', marginBottom: '8px' }}>
              Pick a time, {formData.name}.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--gm)' }}>
              A 30-minute call. Free. No pressure.
            </p>
          </div>

          {bookingDone && (
            <div className="contact-booking-success">
              You're booked. Check your email for the confirmation and calendar link.
            </div>
          )}

          <Cal
            namespace={CAL_NAMESPACE}
            calLink={CAL_LINK}
            style={{ width: '100%', height: '100%', overflow: 'scroll' }}
            config={{
              layout: 'month_view',
              name:   formData.name,
              email:  formData.email,
              notes:  formData.reason,
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="contact-page">
      <div className="contact-page__inner">

        {/* LEFT — context */}
        <div className="contact-page__left">
          <span className="eyebrow" style={{ color: 'var(--teal)' }}>Book a discovery call</span>

          <h1 className="contact-page__h1">Let's talk about what you need.</h1>

          <p className="contact-page__sub">
            Free. 30 minutes. No commitment. Walk away with clarity on exactly
            what's possible and what it would cost.
          </p>

          <div className="contact-expect">
            {expectItems.map((text, i) => (
              <div key={i} className="contact-expect__item">
                <div className="contact-expect__num">{i + 1}</div>
                <p className="contact-expect__text">{text}</p>
              </div>
            ))}
          </div>

          <div className="contact-alts">
            {/* WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-alt-card contact-alt-card--wa"
            >
              <div className="contact-alt-icon" style={{ background: '#25D366' }}>W</div>
              <div>
                <div className="contact-alt-card__label">Chat on WhatsApp</div>
                <div className="contact-alt-card__sub">Quick questions or get started now</div>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:contact@careerdatasolutions.co.ke"
              className="contact-alt-card"
            >
              <div className="contact-alt-icon" style={{ background: 'var(--navy)' }}>@</div>
              <div>
                <div className="contact-alt-card__label">contact@careerdatasolutions.co.ke</div>
                <div className="contact-alt-card__sub">Usually responds within a few hours</div>
              </div>
            </a>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="contact-form-card">
          <p className="contact-form-card__title">A few details first</p>
          <p className="contact-form-card__sub">So we can make the most of our 30 minutes.</p>

          <form className="contact-form" onSubmit={handleSubmit} noValidate>

            <div className="form-field">
              <label htmlFor="name">Your name <span className="form-required">*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="First and last name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'field-error' : ''}
                autoComplete="name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email address <span className="form-required">*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'field-error' : ''}
                autoComplete="email"
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+254 7XX XXX XXX"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className="form-field">
              <label htmlFor="reason">What are you looking for?</label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
              >
                <option value="">Select a service (optional)</option>
                <option value="power-bi">Power BI Dashboard</option>
                <option value="excel">Excel Automation</option>
                <option value="cv">CV Writing</option>
                <option value="linkedin">LinkedIn Optimization</option>
                <option value="coaching">Career Coaching</option>
                <option value="enterprise">Enterprise Data Suite</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="discussion">What would you like to discuss?</label>
              <textarea
                id="discussion"
                name="discussion"
                placeholder="Tell us what's on your mind — what you're working on, what's not working, or what you'd like to achieve."
                value={formData.discussion}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="contact-form__submit-btn"
              disabled={submitting}
            >
              {submitting ? 'One moment…' : 'Choose a time →'}
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}
