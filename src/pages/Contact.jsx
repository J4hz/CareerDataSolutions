import { useState, useCallback } from 'react';
import emailjs from '@emailjs/browser';
import { CALENDLY_URL, WHATSAPP_URL, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../config';
import CTASection from '../components/CTASection';
import '../styles/contact.css';
import '../styles/button.css';

const serviceOptions = [
  'Power BI Dashboard',
  'Excel Automation',
  'CV Writing',
  'LinkedIn Optimization',
  'Career Coaching',
  'Other',
];

const emptyForm = {
  name: '',
  email: '',
  service: '',
  message: '',
};

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setStatus('submitting');

      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            from_name: form.name,
            reply_to: form.email,
            service_interest: form.service,
            message: form.message,
          },
          EMAILJS_PUBLIC_KEY
        );
        setStatus('success');
        setForm(emptyForm);
      } catch {
        setStatus('error');
      }
    },
    [form]
  );

  return (
    <main>
      <section className="section contact-page__main" aria-label="Contact options and form" style={{ paddingTop: '140px' }}>
        <div className="container">
          <h1 className="contact-page__heading">Get in touch</h1>
          <p className="contact-page__subtext">
            Whether you have a project in mind or just want to understand what's possible, start here.
          </p>

          <div className="contact-page__methods">
            <div className="contact-method-card contact-method-card--navy2">
              <h3>Book a Discovery Call</h3>
              <p>
                Free 20-minute call. We'll map out exactly what you need and what
                it would cost.
              </p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-method-card__btn"
              >
                Book on cal.com
              </a>
            </div>

            <div className="contact-method-card contact-method-card--green">
              <h3>Chat on WhatsApp</h3>
              <p>
                Message directly for quick questions or to get started immediately.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-method-card__btn"
              >
                Open WhatsApp
              </a>
            </div>

            <div className="contact-method-card contact-method-card--navy">
              <h3>Send an Email</h3>
              <p>Prefer email? Reach Kabiru directly.</p>
              <a
                href="mailto:contact@careerdatasolutions.co.ke"
                className="contact-method-card__btn"
              >
                contact@careerdatasolutions.co.ke
              </a>
            </div>
          </div>

          <div className="contact-page__form-wrap">
            <h2>Send a message</h2>
            <p>Fill in the form and we'll get back to you within one business day.</p>

            {status === 'success' ? (
              <div className="contact-form__success" role="alert">
                <span aria-hidden="true">✓</span>
                Message sent. We'll be in touch within one business day.
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form__row">
                  <div className="form-field">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="service">Service interest</label>
                  <select
                    id="service"
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select a service</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="What are you trying to fix or build?"
                  />
                </div>

                {status === 'error' && (
                  <div className="contact-form__error" role="alert">
                    Something went wrong. Please try again or email us directly at
                    contact@careerdatasolutions.co.ke
                  </div>
                )}

                <div className="contact-form__submit">
                  <button
                    type="submit"
                    className="btn btn--primary btn--lg"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting' ? 'Sending…' : 'Send it'}
                  </button>
                  <p className="contact-form__note">
                    Usually responds within a few hours during business days.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
