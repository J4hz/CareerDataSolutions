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

// ─────────────────────────────────────────────────────────────
// Registered business details, for the LocalBusiness JSON-LD on the
// homepage (src/seo/schema.js).
//
// TODO(kabiru): FILL THESE IN. Until legalName, telephone and
// serviceAreaOnly are all set, schema.js emits NO LocalBusiness node at
// all — deliberately. Structured data is a machine-readable claim about a
// real registered business, and a placeholder phone number or a guessed
// address is a false one. An absent LocalBusiness costs a little; a wrong
// one is what gets a Business Profile suspended.
//
//   legalName        The name as it appears on the business registration,
//                    if it differs from the trading name (SITE_NAME).
//                    Set it equal to SITE_NAME if they are the same.
//   telephone        Full international format, e.g. "+254791910398".
//                    Must be a number that actually answers.
//   serviceAreaOnly  true  → no public storefront. streetAddress and
//                            postalCode stay null and the node is emitted
//                            with areaServed only, which is the correct
//                            shape for a business clients do not visit.
//                    false → there is an address clients can come to, so
//                            streetAddress and postalCode must be filled.
//
// addressLocality / addressCountry are already asserted by the Organization
// node and are safe: the site says "Nairobi, Kenya" in the footer.
// ─────────────────────────────────────────────────────────────
export const BUSINESS = {
  legalName:       null,
  telephone:       null,
  serviceAreaOnly: null,

  streetAddress:   null,
  postalCode:      null,
  addressLocality: "Nairobi",
  addressRegion:   "Nairobi County",
  addressCountry:  "KE",
};

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
export const NOTIFY_FROM  = CONTACT_EMAIL;
