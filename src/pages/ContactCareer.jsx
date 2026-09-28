import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { WHATSAPP_URL, CONTACT_EMAIL } from '../config';
import '../styles/contact.css';

/* Loaded on submit, never before: see the note at the top of
   components/BookingCalendar.jsx. */
const BookingCalendar = lazy(() => import('../components/BookingCalendar'));

/* Readable labels for the two selects, used to compose the Cal.com notes
   field so the booking carries the answers rather than raw option values. */
const LABELS = {
  targetMarket: {
    'kenya': 'Kenya',
    'uk':    'United Kingdom',
    'us':    'United States',
    'uae':   'UAE / Gulf',
    'other': 'Other international',
  },
  experienceLevel: {
    '0-1':  '0-1 years (Graduate)',
    '1-3':  '1-3 years (Junior)',
    '3-7':  '3-7 years (Mid-level)',
    '7-10': '7-10 years (Senior)',
    '10+':  '10+ years (Executive)',
  },
};

// Mirrors MAX_CV_BYTES in api/_lib/sanitize.js. The server enforces this for
// real — this copy exists only so the user gets told before a 4MB upload.
const MAX_CV_MB = 3;
const MAX_CV_BYTES = MAX_CV_MB * 1024 * 1024;

export default function ContactCareer() {
  const [formData, setFormData] = useState({
    name:            '',
    email:           '',
    phone:           '',
    targetRole:      '',
    targetMarket:    '',
    experienceLevel: '',
    careerGoals:     '',
    message:         '',
  });
  const [cvFile,     setCvFile]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  /* 'form' | 'booking' | 'booked' — see the same machine in ContactData.jsx. */
  const [stage,      setStage]      = useState('form');
  const [errors,     setErrors]     = useState({});
  const fileInputRef                = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev,
        cv: 'Please upload a PDF or Word document' }));
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setErrors(prev => ({ ...prev,
        cv: `File must be under ${MAX_CV_MB}MB` }));
      return;
    }
    setCvFile(file);
    setErrors(prev => ({ ...prev, cv: null }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())            e.name = 'Name is required';
    if (!formData.email.trim())           e.email = 'Email is required';
    if (!formData.phone.trim())           e.phone = 'Phone number is required';
    if (!formData.targetRole.trim())      e.targetRole = 'Target role is required';
    if (!formData.targetMarket)           e.targetMarket = 'Please select a market';
    if (!formData.experienceLevel)        e.experienceLevel = 'Please select your level';
    if (!formData.careerGoals.trim())     e.careerGoals = 'Please tell us your career goals';
    if (!formData.message.trim())         e.message = 'This field is required';
    if (!cvFile)                          e.cv = 'Please upload your CV';
    return e;
  };

  const firstName = formData.name.trim().split(' ')[0] || 'there';

  /* Prefilled into the Cal.com booking form. The CV itself is not sent to
     Cal.com -- it goes to the team with the notification email, and putting
     a candidate's document into a third party's booking notes would be
     both useless there and a needless disclosure. */
  const prefill = useMemo(() => {
    const lines = [
      formData.targetRole && `Target role: ${formData.targetRole}`,
      LABELS.targetMarket[formData.targetMarket] &&
        `Market: ${LABELS.targetMarket[formData.targetMarket]}`,
      LABELS.experienceLevel[formData.experienceLevel] &&
        `Experience: ${LABELS.experienceLevel[formData.experienceLevel]}`,
      formData.careerGoals && `Career goals: ${formData.careerGoals}`,
      formData.message && `Also mentioned: ${formData.message}`,
      cvFile && `CV sent: ${cvFile.name}`,
    ].filter(Boolean);

    return {
      name: formData.name,
      email: formData.email,
      notes: lines.join('\n'),
    };
  }, [formData, cvFile]);

  const handleBooked = useCallback(() => setStage('booked'), []);
  const handleEdit   = useCallback(() => setStage('form'), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(cvFile);
      });

      const res = await fetch('/api/notify-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cvBase64:  base64,
          cvName:    cvFile.name,
          cvType:    cvFile.type,
        }),
      });

      // The response was previously ignored, so a rejected upload still showed
      // the success screen and the CV was never sent. Now the server's own
      // validation message is what the user sees.
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrors({ submit: body.error || 'Something went wrong. Please try again or email us directly.' });
        return;
      }

      setStage('booking');
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

        {/* The data/career switcher was removed: this page is reached from the
            career booking CTA, so the visitor has already chosen their track,
            and the "Career Services" tab said the same thing as the eyebrow
            directly below it. /data/contact dropped it for the same reason
            when it became a real intake page, so the .contact-switcher* rules
            in contact.css are now unused by either track. */}

        {/* Two column grid */}
        <div className="contact-page__inner">

          {/* LEFT COLUMN */}
          <div className="contact-page__left">

            <div className="contact-eyebrow contact-eyebrow--gold">
              Career Services
            </div>

            <h1 className="contact-page__h1">
              Let's work on your career.
            </h1>

            {/* The free step delivers the CALL, not a written analysis. A
                written assessment is the paid deliverable, so promising one
                for free gives away the product and removes the reason to
                book. Findings are walked through live instead. */}
            <p className="contact-page__sub">
              Send your CV and tell us where you want to go, then pick
              a time that suits you. We will have read it before the
              call, where we walk you through what is holding it back.
            </p>

            <div className="contact-expect">
              {[
                "Upload your current CV, even if you think it needs work.",
                "Tell us your target role, market, and experience level.",
                "You pick a time for the call, and we read your CV before it.",
              ].map((text, i) => (
                <div key={i} className="contact-expect__item">
                  <div className="contact-expect__num contact-expect__num--gold">
                    {i + 1}
                  </div>
                  <p className="contact-expect__text">{text}</p>
                </div>
              ))}
            </div>

            {/* The "what happens after you submit" card that used to sit here
                now lives in the welcome email instead — see the confirmation
                send in api/notify-career.js. It answers a question the visitor
                only has once they have submitted, so the email is where it
                actually gets read. */}

            {/* Direct channels at the foot of the copy column, the way the
                order summary carries its help block. When the columns stack on
                mobile, the whole copy column (this included) sits above the
                form, matching /career/order. */}
            <div className="contact-alts">
              {/* WhatsApp */}
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

              {/* Email */}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="contact-alt-card"
              >
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

            {stage === 'booking' && (
              <div className="contact-booking">
                <h2 className="contact-booking__title">
                  Thanks, {firstName}. Pick a time for your 15-minute call below.
                </h2>
                <p className="contact-booking__sub">
                  We have your CV and will have read it before the call.
                </p>
                <Suspense
                  fallback={
                    <div className="booking-cal__skeleton" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  }
                >
                  <BookingCalendar
                    track="career"
                    prefill={prefill}
                    onBooked={handleBooked}
                    onEdit={handleEdit}
                  />
                </Suspense>
              </div>
            )}

            {stage === 'booked' && (
              <div className="contact-career-success">
                <div className="contact-career-success__icon">✓</div>
                <h2 className="contact-career-success__title">
                  You're booked.
                </h2>
                <p className="contact-career-success__body">
                  Your discovery call is confirmed. Cal.com has sent you a
                  calendar invite with the time and the video link. We will
                  have read your CV before we speak.
                </p>
                <p className="contact-career-success__email">
                  Sent to: {formData.email}
                </p>
              </div>
            )}

            {stage === 'form' && (

              <form
                className="contact-form-card"
                onSubmit={handleSubmit}
                noValidate>

                <p className="contact-form-card__title">
                  Send us your CV
                </p>
                <p className="contact-form-card__subtitle">
                  Free review. Honest feedback. No spam.
                </p>

                {errors.submit && (
                  <div className="contact-form-card__error-banner">
                    {errors.submit}
                  </div>
                )}

                {/* Name */}
                <div className="contact-form-card__field">
                  <label>Your name</label>
                  <input
                    type="text"
                    placeholder="First and last name"
                    value={formData.name}
                    onChange={e => setFormData(p => ({
                      ...p, name: e.target.value }))}
                    className={errors.name ? 'field-error' : ''}
                  />
                  {errors.name &&
                    <span className="field-error-msg">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="contact-form-card__field">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={e => setFormData(p => ({
                      ...p, email: e.target.value }))}
                    className={errors.email ? 'field-error' : ''}
                  />
                  {errors.email &&
                    <span className="field-error-msg">{errors.email}</span>}
                </div>

                {/* Phone */}
                <div className="contact-form-card__field">
                  <label>Phone number</label>
                  <input
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phone}
                    onChange={e => setFormData(p => ({
                      ...p, phone: e.target.value }))}
                    className={errors.phone ? 'field-error' : ''}
                  />
                  {errors.phone &&
                    <span className="field-error-msg">{errors.phone}</span>}
                </div>

                {/* Target role */}
                <div className="contact-form-card__field">
                  <label>What role are you targeting?</label>
                  <input
                    type="text"
                    placeholder="e.g. Finance Manager, Nurse UK, Marketing Director"
                    value={formData.targetRole}
                    onChange={e => setFormData(p => ({
                      ...p, targetRole: e.target.value }))}
                    className={errors.targetRole ? 'field-error' : ''}
                  />
                  {errors.targetRole &&
                    <span className="field-error-msg">
                      {errors.targetRole}
                    </span>}
                </div>

                {/* Target market */}
                <div className="contact-form-card__field">
                  <label>Which market?</label>
                  <select
                    value={formData.targetMarket}
                    onChange={e => setFormData(p => ({
                      ...p, targetMarket: e.target.value }))}
                    className={errors.targetMarket ? 'field-error' : ''}
                  >
                    <option value="">Select a market</option>
                    <option value="kenya">Kenya</option>
                    <option value="uk">United Kingdom</option>
                    <option value="us">United States</option>
                    <option value="uae">UAE / Gulf</option>
                    <option value="other">Other international</option>
                  </select>
                  {errors.targetMarket &&
                    <span className="field-error-msg">
                      {errors.targetMarket}
                    </span>}
                </div>

                {/* Experience level */}
                <div className="contact-form-card__field">
                  <label>Years of experience</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={e => setFormData(p => ({
                      ...p, experienceLevel: e.target.value }))}
                    className={errors.experienceLevel ? 'field-error':''}
                  >
                    <option value="">Select level</option>
                    <option value="0-1">0–1 years (Graduate)</option>
                    <option value="1-3">1–3 years (Junior)</option>
                    <option value="3-7">3–7 years (Mid-level)</option>
                    <option value="7-10">7–10 years (Senior)</option>
                    <option value="10+">10+ years (Executive)</option>
                  </select>
                  {errors.experienceLevel &&
                    <span className="field-error-msg">
                      {errors.experienceLevel}
                    </span>}
                </div>

                {/* Career goals */}
                <div className="contact-form-card__field">
                  <label>What are your career goals?</label>
                  <textarea
                    rows={3}
                    placeholder="Where do you want your career to be in the next few years?"
                    value={formData.careerGoals}
                    onChange={e => setFormData(p => ({
                      ...p, careerGoals: e.target.value }))}
                    className={errors.careerGoals ? 'field-error' : ''}
                  />
                  {errors.careerGoals &&
                    <span className="field-error-msg">
                      {errors.careerGoals}
                    </span>}
                </div>

                {/* CV Upload */}
                <div className="contact-form-card__field">
                  <label>Upload your CV</label>
                  <div
                    className={[
                      'cv-dropzone',
                      cvFile          ? 'cv-dropzone--has-file' : '',
                      errors.cv       ? 'cv-dropzone--error'    : '',
                    ].join(' ')}
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    {cvFile ? (
                      <div className="cv-dropzone__file">
                        <span className="cv-dropzone__filename">
                          {cvFile.name}
                        </span>
                        <span className="cv-dropzone__size">
                          {(cvFile.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          className="cv-dropzone__remove"
                          onClick={e => {
                            e.stopPropagation();
                            setCvFile(null);
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
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={e => handleFileSelect(e.target.files[0])}
                  />
                  {errors.cv &&
                    <span className="field-error-msg">{errors.cv}</span>}
                </div>

                {/* Notes */}
                <div className="contact-form-card__field">
                  <label>Anything else we should know?</label>
                  <textarea
                    rows={3}
                    placeholder="Current situation, urgency, specific concerns..."
                    value={formData.message}
                    onChange={e => setFormData(p => ({
                      ...p, message: e.target.value }))}
                    className={errors.message ? 'field-error' : ''}
                  />
                  {errors.message &&
                    <span className="field-error-msg">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  className="contact-form-card__submit contact-form-card__submit--gold"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send CV for review →'}
                </button>

                <p className="contact-form-card__note">
                  We read every CV before the call. Your CV is not
                  shared with anyone outside CareerDataSolutions.
                </p>

              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
