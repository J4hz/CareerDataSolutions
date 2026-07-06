import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import Cal, { getCalApi } from '@calcom/embed-react';
import { CAL_NAMESPACE, CAL_LINK, WHATSAPP_URL } from '../config';
import '../styles/contact.css';

const expectItems = [
  'Tell us about your organization and what data you are working with.',
  'Pick a time that works for you.',
  'We will come prepared with dashboard ideas and an honest scope assessment.',
];

export default function ContactData() {
  const [bookingDone, setBookingDone] = useState(false);

  const handleBookingSuccess = useCallback(async (e) => {
    setBookingDone(true);
    const booking = e?.data?.booking || {};
    const attendee = booking?.attendees?.[0] || {};
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    attendee.name    || 'Not provided',
          email:   attendee.email   || 'Not provided',
          phone:   booking?.responses?.phone || 'Not provided',
          reason:  booking?.responses?.reason || 'Not provided',
        }),
      });
    } catch (err) {
      console.error('Notify error:', err);
    }
  }, []);

  useEffect(() => {
    getCalApi({ namespace: CAL_NAMESPACE }).then((cal) => {
      cal('preload', { calLink: CAL_LINK });
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
  }, [handleBookingSuccess]);

  return (
    <main className="contact-page">
      <div className="container">

        {/* Switcher */}
        <div className="contact-switcher">
          <span className="contact-switcher__label">
            I need help with:
          </span>
          <div className="contact-switcher__tabs">
            <button className="contact-switcher__tab
                               contact-switcher__tab--teal
                               contact-switcher__tab--active">
              Data Analytics
            </button>
            <NavLink
              to="/contact/career"
              className="contact-switcher__tab
                         contact-switcher__tab--gold">
              Career Services
            </NavLink>
          </div>
        </div>

        <div className="contact-page__inner">

          {/* LEFT — context */}
          <div className="contact-page__left">
            <span className="eyebrow" style={{ color: 'var(--teal)' }}>Data Analytics</span>

            <h1 className="contact-page__h1">Let's talk about your data.</h1>

            <p className="contact-page__sub">
              Free. 30 minutes. No commitment. Walk away with clarity on what your
              dashboards could look like and what it would cost.
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
                href="mailto:kabiru@careerdatasolutions.com"
                className="contact-alt-card"
              >
                <div className="contact-alt-icon" style={{ background: 'var(--navy)' }}>@</div>
                <div>
                  <div className="contact-alt-card__label">kabiru@careerdatasolutions.com</div>
                  <div className="contact-alt-card__sub">Usually responds within a few hours</div>
                </div>
              </a>
            </div>
          </div>

          {/* RIGHT — calendar */}
          <div className="contact-page__right">
            {bookingDone && (
              <div className="contact-booking-success">
                You're booked. Check your email for the confirmation and calendar link.
              </div>
            )}

            <Cal
              namespace={CAL_NAMESPACE}
              calLink={CAL_LINK}
              style={{ width: '100%', height: '100%', overflow: 'scroll' }}
            />
          </div>

        </div>
      </div>
    </main>
  );
}
