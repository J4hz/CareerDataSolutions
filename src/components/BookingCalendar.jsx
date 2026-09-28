import { useEffect, useRef, useState } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { calLinkFor, calUrlFor } from '../config';
import '../styles/booking-calendar.css';

/**
 * The inline Cal.com calendar shown after a contact form is submitted.
 *
 * ── Why this file is never imported directly ──
 *
 * Both contact pages reach it through React.lazy(), and only render it once
 * `submitted` is true. Two things follow from that, and both are the point:
 *
 *   • @calcom/embed-react and the embed script it pulls in land in their own
 *     chunk, fetched on submit. A visitor who reads the page and leaves pays
 *     nothing for the calendar, so it cannot touch LCP or initial weight.
 *   • It can never run during the build-time prerender or the hydration pass,
 *     because "submitted" is only ever reached by a click in a real browser.
 *     There is no server markup for this subtree to disagree with, so the
 *     usual embed-versus-SSR hydration problem does not arise at all rather
 *     than being worked around.
 *
 * ── The three states ──
 *
 * loading → the chunk and embed script are on their way; a skeleton holds
 *           the space so the panel does not jump when the iframe lands.
 * ready   → the calendar is interactive.
 * failed  → Cal.com said the link is bad, or the script errored outright.
 *
 * The fallback link out is ALWAYS rendered, in every state, so a visitor
 * whose network blocks the iframe is never stranded.
 *
 * ── Why there is a watchdog as well as a `failed` state ──
 *
 * When the embed script is blocked rather than merely slow -- a strict CSP,
 * an ad blocker, a corporate proxy -- getCalApi() neither resolves nor
 * rejects. It polls for a global that is never going to appear, so nothing
 * throws and the panel would otherwise sit on "Loading the calendar..."
 * forever. Verified against a CSP with cal.com removed: after ten seconds
 * there was still no iframe and no error.
 *
 * So a timer changes the MESSAGE after WATCHDOG_MS. It deliberately does not
 * change `status`, because unmounting the embed would guarantee the failure
 * it is trying to report: a calendar that was only slow would lose its
 * chance to finish. The frame stays mounted, a late `linkReady` still
 * promotes it to ready, and in the meantime the visitor is pointed at the
 * link instead of being told to keep waiting.
 */

/** Long enough for a slow connection to finish, short enough that a blocked
 *  embed does not read as a hung page. */
const WATCHDOG_MS = 10000;

/** Cal.com's own event names. `bookingSuccessful` is the one the brief names
 *  and is marked deprecated upstream in favour of the V2 payload, so both are
 *  subscribed and whichever fires first wins — see `settled` below. */
const BOOKED_EVENTS = ['bookingSuccessful', 'bookingSuccessfulV2'];

export default function BookingCalendar({
  track,
  prefill = {},
  onBooked,
  onEdit,
}) {
  const [status, setStatus] = useState('loading');
  const [stalled, setStalled] = useState(false);
  const rootRef = useRef(null);
  /* Cal.com fires a booking event per subscription, and we hold two. This
     latches so a confirmation cannot be raised twice for one booking. */
  const settled = useRef(false);

  const calLink = calLinkFor(track);
  const calUrl = calUrlFor(track);

  /* The theme the embed should match, read from the same <html data-theme>
     attribute the rest of the site runs on, and kept in step if the visitor
     hits the header toggle while the calendar is open. The iframe is
     cross-origin and cannot see our CSS, so this has to be passed in. */
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'light'
  );

  useEffect(() => {
    if (status !== 'loading') return undefined;
    const timer = setTimeout(() => setStalled(true), WATCHDOG_MS);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(html.dataset.theme || 'light');
    });
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const cal = await getCalApi({ namespace: track });
        if (cancelled) return;

        /* The brand colour is READ OFF THIS COMPONENT'S OWN ELEMENT rather
           than written here as a hex. --accent is set by the track layout
           wrapper, so this picks up gold inside /career/* and teal inside
           /data/* automatically, and a rebrand in theme.css reaches the
           calendar without anyone remembering to update a second copy. */
        const accent =
          getComputedStyle(rootRef.current || document.documentElement)
            .getPropertyValue('--accent')
            .trim() || undefined;

        cal('ui', {
          theme,
          ...(accent
            ? {
                cssVarsPerTheme: {
                  light: { 'cal-brand': accent },
                  dark: { 'cal-brand': accent },
                },
              }
            : {}),
        });

        const onBookingDone = () => {
          if (settled.current) return;
          settled.current = true;
          onBooked?.();
        };

        BOOKED_EVENTS.forEach((action) => {
          cal('on', { action, callback: onBookingDone });
        });

        cal('on', {
          action: 'linkReady',
          callback: () => {
            if (cancelled) return;
            setStatus('ready');
            setStalled(false);
          },
        });
        cal('on', {
          action: 'linkFailed',
          callback: () => !cancelled && setStatus('failed'),
        });
      } catch {
        /* The script itself did not load: blocked by an extension, a strict
           CSP, or an offline network. Nothing to retry against, so hand the
           visitor the link out. */
        if (!cancelled) setStatus('failed');
      }
    })();

    return () => {
      cancelled = true;
    };
    /* `theme` is deliberately absent: re-running this would re-register the
       event handlers. The separate effect below pushes theme changes. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, onBooked]);

  /* Theme changes after mount, pushed without touching the subscriptions. */
  useEffect(() => {
    let cancelled = false;
    getCalApi({ namespace: track })
      .then((cal) => !cancelled && cal('ui', { theme }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [theme, track]);

  return (
    <div className="booking-cal" ref={rootRef}>
      {status !== 'failed' && (
        <div
          className={`booking-cal__frame${
            status === 'ready' ? ' is-ready' : ''
          }`}
        >
          {/* Sits behind the iframe and is covered once it paints, so the
              panel keeps its height from the first frame. aria-hidden
              because the status line below already announces the wait. */}
          {status === 'loading' && (
            <div className="booking-cal__skeleton" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}

          <Cal
            namespace={track}
            calLink={calLink}
            config={{ ...prefill, theme, layout: 'month_view' }}
            className="booking-cal__embed"
          />
        </div>
      )}

      <p className="booking-cal__status" role="status">
        {status === 'failed' &&
          'The calendar could not load here. Use the link below to book in a new tab.'}
        {status === 'loading' &&
          (stalled
            ? 'The calendar is taking longer than it should. You can open it in a new tab instead.'
            : 'Loading the calendar...')}
      </p>

      <div className="booking-cal__actions">
        {/* Always present, not just on failure: an embed can render and
            still be unusable behind a corporate proxy, and by then the
            visitor has no way to tell us. */}
        <a
          className="booking-cal__link"
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the calendar in a new tab
        </a>
        {onEdit && (
          <button type="button" className="booking-cal__back" onClick={onEdit}>
            Edit my details
          </button>
        )}
      </div>
    </div>
  );
}
