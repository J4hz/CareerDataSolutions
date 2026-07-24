import { useState } from 'react';
import { WHATSAPP_URL, CONTACT_EMAIL, CALENDLY_URL } from '../config';
import '../styles/contact.css';

/**
 * /data/contact — the data track's own intake, mirroring ContactCareer.jsx.
 *
 * This used to be a bare Cal.com embed, which asked a visitor to pick a time
 * before anyone knew what their data looked like. The career side solves the
 * same problem by collecting the material first and sending a booking link
 * after; this does the same with the questions that actually shape a dashboard
 * quote: what you want to see, where the data lives, what state it is in.
 *
 * The booking link is not lost — it is handed over on the success panel, so
 * anyone who wants to book immediately still can.
 */

const EXPECT_ITEMS = [
  'Tell us what you want to see that you cannot see today.',
  'Mention where the data lives and roughly what state it is in.',
  'We send you a link to book your free 30-minute discovery call.',
];

// The "what happens after you submit" list that used to sit here now lives in
// the confirmation email instead — see the welcome send in api/notify-data.js.
// It answers a question the visitor only has once they have submitted, so the
// email is where it actually gets read.

export default function ContactData() {
  const [formData, setFormData] = useState({
    name:           '',
    company:        '',
    email:          '',
    phone:          '',
    goal:           '',
    dataLocation:   '',
    dataState:      '',
    existingReport: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [errors,     setErrors]     = useState({});

  const setField = (key) => (e) =>
    setFormData((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!formData.name.trim())     e.name = 'Name is required';
    if (!formData.email.trim())    e.email = 'Email is required';
    if (!formData.phone.trim())    e.phone = 'Phone number is required';
    if (!formData.goal.trim())     e.goal = 'Tell us what you are trying to see';
    if (!formData.dataLocation)    e.dataLocation = 'Please pick one';
    if (!formData.dataState)       e.dataState = 'Please pick one';
    if (!formData.existingReport)  e.existingReport = 'Please pick one';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/notify-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrors({
          submit: body.error || 'Something went wrong. Please try again or email us directly.',
        });
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ submit: 'Something went wrong. Please try again or email us directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="contact-page">
      <div className="container">
        <div className="contact-page__inner">

          {/* LEFT COLUMN */}
          <div className="contact-page__left">

            <div className="contact-eyebrow contact-eyebrow--teal">
              Data Services
            </div>

            <h1 className="contact-page__h1">
              Let's look at your data before we quote anything.
            </h1>

            {/* The free step is the CALL. Nothing is priced here, deliberately:
                a number given before anyone has seen the data is either padded
                or wrong, and both cost trust. */}
            <p className="contact-page__sub">
              Tell us what you are trying to see and where the data sits today.
              We come to the call already understanding your setup, so the time
              goes on what is possible rather than on basic fact-finding.
            </p>

            <div className="contact-expect">
              {EXPECT_ITEMS.map((text, i) => (
                <div key={text} className="contact-expect__item">
                  <div className="contact-expect__num">{i + 1}</div>
                  <p className="contact-expect__text">{text}</p>
                </div>
              ))}
            </div>

            {/* Direct channels at the foot of the copy column, the way the
                order summary carries its help block. When the columns stack on
                mobile, the whole copy column (this included) sits above the
                form, matching /career/order. */}
            <div className="contact-alts">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-alt-card contact-alt-card--wa"
              >
                <div className="contact-alt-icon" style={{ background: 'var(--whatsapp)' }}>W</div>
                <div>
                  <div className="contact-alt-card__label">Chat on WhatsApp</div>
                  <div className="contact-alt-card__sub">Quick questions or get started now</div>
                </div>
              </a>

              <a href={`mailto:${CONTACT_EMAIL}`} className="contact-alt-card">
                <div className="contact-alt-icon" style={{ background: 'var(--navy)' }}>@</div>
                <div>
                  <div className="contact-alt-card__label">{CONTACT_EMAIL}</div>
                  <div className="contact-alt-card__sub">Usually responds within a few hours</div>
                </div>
              </a>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="contact-page__right">

            {submitted ? (

              <div className="contact-career-success">
                <div className="contact-career-success__icon">✓</div>
                <h2 className="contact-career-success__title">
                  Request received.
                </h2>
                <p className="contact-career-success__body">
                  We have your setup and what you are trying to see. Within one
                  business day you will get a link to book your free 30-minute
                  discovery call. Check your spam folder if you do not hear from us.
                </p>
                {/* Anyone who would rather not wait for the email can still pick
                    a slot now: this is the same calendar the link points to. */}
                <p className="contact-career-success__body">
                  In a hurry?{' '}
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    Book a time now
                  </a>{' '}
                  and we will come to it with your answers in hand.
                </p>
                <p className="contact-career-success__email">
                  Sent to: {formData.email}
                </p>
              </div>

            ) : (

              <form className="contact-form-card" onSubmit={handleSubmit} noValidate>

                <p className="contact-form-card__title">
                  Book a discovery call
                </p>
                <p className="contact-form-card__subtitle">
                  Free. 30 minutes. No commitment.
                </p>

                {errors.submit && (
                  <div className="contact-form-card__error-banner">
                    {errors.submit}
                  </div>
                )}

                <div className="contact-form-card__field">
                  <label>Your name</label>
                  <input
                    type="text"
                    placeholder="First and last name"
                    value={formData.name}
                    onChange={setField('name')}
                    className={errors.name ? 'field-error' : ''}
                  />
                  {errors.name && <span className="field-error-msg">{errors.name}</span>}
                </div>

                <div className="contact-form-card__field">
                  <label>Organization <span className="contact-form-card__optional">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="Company, NGO, hospital, practice"
                    value={formData.company}
                    onChange={setField('company')}
                  />
                </div>

                <div className="contact-form-card__field">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={setField('email')}
                    className={errors.email ? 'field-error' : ''}
                  />
                  {errors.email && <span className="field-error-msg">{errors.email}</span>}
                </div>

                <div className="contact-form-card__field">
                  <label>Phone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phone}
                    onChange={setField('phone')}
                    className={errors.phone ? 'field-error' : ''}
                  />
                  {errors.phone && <span className="field-error-msg">{errors.phone}</span>}
                </div>

                <div className="contact-form-card__field">
                  <label>What do you want to see clearly that you cannot see today?</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Which regions are underperforming this quarter, without waiting for the monthly manual report."
                    value={formData.goal}
                    onChange={setField('goal')}
                    className={errors.goal ? 'field-error' : ''}
                  />
                  {errors.goal && <span className="field-error-msg">{errors.goal}</span>}
                </div>

                <div className="contact-form-card__field">
                  <label>Where does the relevant data live today?</label>
                  <select
                    value={formData.dataLocation}
                    onChange={setField('dataLocation')}
                    className={errors.dataLocation ? 'field-error' : ''}
                  >
                    <option value="">Select one</option>
                    <option value="spreadsheets">Excel / Google Sheets</option>
                    <option value="business-system">A business system (CRM, ERP, accounting)</option>
                    <option value="database">A database (SQL, Access)</option>
                    <option value="multiple">Multiple systems that do not talk to each other</option>
                    <option value="unsure">Not sure, need help figuring this out</option>
                  </select>
                  {errors.dataLocation && (
                    <span className="field-error-msg">{errors.dataLocation}</span>
                  )}
                </div>

                <div className="contact-form-card__field">
                  <label>What state is it in?</label>
                  <select
                    value={formData.dataState}
                    onChange={setField('dataState')}
                    className={errors.dataState ? 'field-error' : ''}
                  >
                    <option value="">Select one</option>
                    <option value="clean">Clean and consistent</option>
                    <option value="mostly-fine">Mostly fine, some gaps</option>
                    <option value="messy">Messy, needs work</option>
                    <option value="unsure">Not sure</option>
                  </select>
                  {errors.dataState && (
                    <span className="field-error-msg">{errors.dataState}</span>
                  )}
                </div>

                <div className="contact-form-card__field">
                  <label>Is there an existing report this would replace?</label>
                  <select
                    value={formData.existingReport}
                    onChange={setField('existingReport')}
                    className={errors.existingReport ? 'field-error' : ''}
                  >
                    <option value="">Select one</option>
                    <option value="excel-report">Yes, an Excel report</option>
                    <option value="dashboard">Yes, a dashboard</option>
                    <option value="first">No, this would be the first one</option>
                  </select>
                  {errors.existingReport && (
                    <span className="field-error-msg">{errors.existingReport}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="contact-form-card__submit contact-form-card__submit--teal"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Request my discovery call →'}
                </button>

                <p className="contact-form-card__note">
                  No budget question here: quotes follow the discovery call, not
                  the other way around. Your details are not shared with anyone
                  outside CareerDataSolutions.
                </p>

              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
