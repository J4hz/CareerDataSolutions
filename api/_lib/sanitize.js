// ─────────────────────────────────────────────────────────────
// Shared input handling for the /api functions.
//
// Every endpoint here takes untrusted input from a public form or a
// third-party webhook and drops it into an HTML email. The mail client
// renders that HTML — so an unescaped submission is a live injection
// vector into the founder's inbox, not a cosmetic bug. Everything that
// crosses into an email body goes through cleanText() or escapeHtml().
//
// Vercel ignores files under a directory beginning with "_", so this is
// a shared module and not itself a route.
// ─────────────────────────────────────────────────────────────

/** HTML-escape a string for safe interpolation into an email body. */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// C0/C1 control characters. \n and \r are excluded so multiline text can keep
// its line breaks; cleanText and cleanHeader handle those separately.
const CONTROL_CHARS = /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;
const ALL_CONTROL_CHARS = /[\x00-\x1F\x7F-\x9F]/g;

/**
 * Normalize a free-text field, then escape it.
 *
 * Trims, caps the length (an unbounded textarea is an easy way to mail-bomb
 * an inbox), strips control characters, and converts any remaining newlines
 * to <br> so multi-line answers still read correctly in the email.
 */
export function cleanText(value, { maxLength = 500, multiline = false } = {}) {
  if (value === null || value === undefined) return '';

  const text = String(value).trim().slice(0, maxLength).replace(CONTROL_CHARS, '');

  if (!multiline) return escapeHtml(text.replace(/[\r\n]+/g, ' '));

  return escapeHtml(text).replace(/\r\n|\r|\n/g, '<br />');
}

/**
 * Clean a value for use in a mail *header* (the subject line).
 *
 * A bare CR/LF in a header value is a header-injection primitive — it lets a
 * submitter append their own Bcc: or Reply-To:. Newlines are collapsed to
 * spaces rather than escaped, because there is no escaping in header syntax.
 */
export function cleanHeader(value, maxLength = 120) {
  return String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(ALL_CONTROL_CHARS, '')
    .trim()
    .slice(0, maxLength);
}

/** Shape check for an email address. Deliberately permissive — the point is to
 *  reject obvious junk and anything with a newline in it, not to re-derive
 *  RFC 5322. */
export function isValidEmail(value) {
  const email = String(value ?? '').trim();
  return email.length <= 254 && /^[^\s@,;:<>"]+@[^\s@,;:<>"]+\.[^\s@,;:<>"]{2,}$/.test(email);
}

// ── CV upload validation ─────────────────────────────────────

/** Raw (pre-base64) size ceiling. Sits below Vercel's ~4.5MB request body
 *  limit once base64 inflates the payload by ~33%, and far above any real CV. */
export const MAX_CV_BYTES = 3 * 1024 * 1024;

/** Accepted types. Each MIME maps to the extensions allowed to claim it, and to
 *  the leading bytes the decoded file must actually start with — the client
 *  controls both the filename and the declared MIME type, so neither is
 *  evidence of anything on its own. */
const ACCEPTED = [
  {
    mime: 'application/pdf',
    extensions: ['.pdf'],
    magic: [[0x25, 0x50, 0x44, 0x46]], // "%PDF"
  },
  {
    mime: 'application/msword',
    extensions: ['.doc'],
    magic: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]], // OLE2 compound file
  },
  {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    // A .docx is a zip container. Normal, empty and spanned archive markers
    // are all legitimate leading bytes.
    magic: [
      [0x50, 0x4b, 0x03, 0x04],
      [0x50, 0x4b, 0x05, 0x06],
      [0x50, 0x4b, 0x07, 0x08],
    ],
  },
];

export const ACCEPTED_MIME_TYPES = ACCEPTED.map((t) => t.mime);

/**
 * Reduce an arbitrary client-supplied filename to something safe to put in an
 * email subject, an attachment name and a log line.
 *
 * Drops any directory component (".." and "/" both), keeps only characters that
 * cannot be read as markup or shell syntax, and forces the extension to the one
 * implied by the validated MIME type — so a file cannot present as "cv.pdf.exe"
 * or arrive with no extension at all.
 */
export function sanitizeFilename(name, extension) {
  const base = String(name ?? '')
    .split(/[/\\]/)
    .pop()
    .replace(/\.[^.]*$/, '')            // drop the client's extension; we set our own
    .replace(/[^a-zA-Z0-9 ._-]/g, '')   // markup, quotes, control chars, unicode tricks
    .replace(/\s+/g, ' ')
    .replace(/^[.\s]+/, '')             // no leading dots — no hidden files
    .trim()
    .slice(0, 80);

  return `${base || 'cv'}${extension}`;
}

/**
 * Validate a base64-encoded CV upload.
 *
 * Returns { ok: true, buffer, filename, mime } or { ok: false, error } with a
 * message safe to hand straight back to the browser. Every check here is
 * independent of the client's own validation: the client can be bypassed with a
 * single curl command, so this is the only validation that actually counts.
 */
export function validateCvUpload({ cvBase64, cvName, cvType }) {
  if (!cvBase64 || typeof cvBase64 !== 'string') {
    return { ok: false, error: 'A CV file is required.' };
  }

  const type = ACCEPTED.find((t) => t.mime === cvType);
  if (!type) {
    return { ok: false, error: 'Unsupported file type. Upload a PDF, DOC or DOCX.' };
  }

  const declaredExt = String(cvName ?? '').toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  if (!declaredExt || !type.extensions.includes(declaredExt)) {
    return {
      ok: false,
      error: `File extension does not match its type. Expected ${type.extensions.join(' or ')}.`,
    };
  }

  const buffer = Buffer.from(cvBase64, 'base64');

  // Buffer.from(base64) discards junk rather than throwing, so an empty result
  // is the only signal that the payload was never really base64.
  if (buffer.length === 0) {
    return { ok: false, error: 'The file could not be read. Please try uploading it again.' };
  }

  if (buffer.length > MAX_CV_BYTES) {
    const mb = Math.round(MAX_CV_BYTES / (1024 * 1024));
    return { ok: false, error: `File is too large. Maximum size is ${mb}MB.` };
  }

  const matchesMagic = type.magic.some((signature) =>
    signature.every((byte, i) => buffer[i] === byte)
  );
  if (!matchesMagic) {
    return {
      ok: false,
      error: 'That file is not a valid PDF or Word document. Please re-export it and try again.',
    };
  }

  return {
    ok: true,
    buffer,
    mime: type.mime,
    filename: sanitizeFilename(cvName, type.extensions[0]),
  };
}
