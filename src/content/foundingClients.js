// ─────────────────────────────────────────────────────────────
// Founding-clients offer: config, copy, and the expiry rule.
//
// The offer is a real, time-boxed statement, so it has to stop being
// true on its own rather than sitting on the site forever. Everything
// that decides whether it still holds lives here, as data — no page
// hardcodes the dates or the numbers.
//
// Rendered by components/FoundingClientsCallout.jsx on exactly two
// surfaces: the homepage (between the "One company, two services" strip
// and the "What we do" cards) and the About page (above the stat block).
// Deliberately NOT on either packages page or in any FAQ: there it reads
// as an excuse attached to a price, rather than a position stated up front.
//
// ── When the offer lapses ──
//
// The callout stops rendering entirely — it does not degrade to older
// copy. That is on purpose: a stale founding-client claim is worse than
// no claim. When either trigger below hits, the upgraded copy is a
// MANUAL edit (see the launch report, Section 6, "what to do when the
// trigger hits"). Nothing in this file writes it for you.
//
// ── Note on the prerender ──
//
// Routes are prerendered to static HTML at build time (scripts/prerender.js),
// so the expiry is evaluated at BUILD time for the HTML a crawler or a
// first-paint visitor sees. Once the window closes, the callout disappears
// from the live site on the next deploy, not at midnight on the day itself.
// Bumping completedEngagements likewise needs a redeploy to take effect.
// ─────────────────────────────────────────────────────────────

export const foundingClientsConfig = {
  /* Day the offer opened. ISO yyyy-mm-dd, read as UTC midnight.
     Currently the day this was built; change it to the actual launch day
     if the offer should be anchored there instead. */
  startDate: '2026-07-26',

  /* How long the offer stands, in days from startDate. 75 is the mid-point
     of the 60–90 day range in the report. */
  windowDays: 75,

  /* How many finished engagements it takes before "founding" stops being
     honest. 6 is the mid-point of the report's 5–8 range. */
  engagementCap: 6,

  /* Incremented by hand as engagements complete. The callout disappears
     once this reaches engagementCap. */
  completedEngagements: 0,

  /* The founding rate, as a percentage off every published price. Read by
     data/pricing.js and by nothing else: no card, page or API route works
     out a discount of its own, so the number below is the only place it
     can be changed and the only place it can be wrong. */
  discountPercent: 10,

  /* Days past the end of the window during which the SERVER still charges
     the founding rate.

     The pages are prerendered, so a card shows whatever was true at BUILD
     time (see the prerender note above), while api/order.js decides at
     REQUEST time. Without a grace period the day the window closes, every
     visitor on the already-built HTML would read the founding price and be
     charged the list price — the one failure here that takes money someone
     did not agree to. The grace makes the server the more generous of the
     two for a week, which is the safe direction to be wrong in, and a week
     is long enough to notice and redeploy.

     It does not need to cover engagementCap: bumping completedEngagements
     is an edit to this file, so the build and the server change together. */
  graceDays: 7,
};

/* The visible copy, kept beside the config it is governed by so a future
   edit to one is made looking at the other. */
export const foundingClientsCopy = {
  title: 'Founding Clients',
  /* The percentage is interpolated rather than typed out, because it is also
     the number the prices on every card are actually reduced by. Written by
     hand it could say 10% while the cards said something else. */
  body:
    'We’re onboarding our first CareerDataSolutions clients now. Founding clients ' +
    `get ${foundingClientsConfig.discountPercent}% off every package and priority ` +
    'turnaround, in exchange for a testimonial and permission to feature the ' +
    'work as a case study.',
};

/** Last instant the offer is still true, as a Date. */
export function foundingClientsEndDate(config = foundingClientsConfig) {
  const start = new Date(`${config.startDate}T00:00:00Z`);
  return new Date(start.getTime() + config.windowDays * 24 * 60 * 60 * 1000);
}

/**
 * Whether the offer still stands. Both conditions must hold: inside the
 * window AND under the engagement cap. `now` is injectable so the rule can
 * be checked for a future date without waiting for it.
 */
export function isFoundingClientsActive(now = new Date(), config = foundingClientsConfig) {
  return (
    now < foundingClientsEndDate(config) &&
    config.completedEngagements < config.engagementCap
  );
}

/**
 * Whether the SERVER should still charge the founding rate — the same rule as
 * above plus `graceDays`, for the reason given beside that setting.
 *
 * Only api/_lib/promo.js should call this. Anything that renders a price calls
 * isFoundingClientsActive() instead, so the grace never shows up as an offer
 * that is still being advertised after it ended: it only ever means the
 * customer pays the lower of the two prices.
 */
export function isFoundingRateHonoured(now = new Date(), config = foundingClientsConfig) {
  const graceEnds = new Date(
    foundingClientsEndDate(config).getTime() + config.graceDays * 24 * 60 * 60 * 1000
  );
  return now < graceEnds && config.completedEngagements < config.engagementCap;
}
