// ─────────────────────────────────────────────────────────────
// Single source of truth for every external URL and address.
// Imported by React components AND the Vercel functions in /api,
// so keep this file free of browser- and React-specific code.
// ─────────────────────────────────────────────────────────────

// Canonical origin. No trailing slash — absoluteUrl() adds the path.
export const SITE_URL    = "https://careerdatasolutions.com";
export const SITE_DOMAIN = "careerdatasolutions.com";
export const SITE_NAME   = "CareerDataSolutions";

/** Turn an app path ("/blog/foo") into an absolute URL. */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Contact
export const CONTACT_EMAIL = "kabiru@careerdatasolutions.com";
export const WHATSAPP_URL  = "https://wa.me/254791910398";

// Cal.com — find these at cal.com/[username]/[event-slug]
export const CAL_NAMESPACE = "careerdatasolutions";
export const CAL_LINK      = "careerdatasolutions/discovery-call";
export const CALENDLY_URL  = `https://cal.com/${CAL_LINK}`;

// Assets referenced by absolute URL (email clients and social scrapers
// cannot resolve relative paths, so these must be fully qualified).
export const OG_IMAGE_URL    = absoluteUrl("/og-image.png");
export const EMAIL_LOGO_URL  = absoluteUrl("/logo-email.png");

// Notification email — real values come from Vercel env vars (NOTIFY_EMAIL,
// NOTIFY_FROM). These are only the fallbacks used when the env var is unset.
// Never import RESEND_API_KEY into a React component.
// NOTIFY_FROM must be an address on a domain verified in Resend.
export const NOTIFY_EMAIL = CONTACT_EMAIL;
export const NOTIFY_FROM  = "notifications@careerdatasolutions.com";
