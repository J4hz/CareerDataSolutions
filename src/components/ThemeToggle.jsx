import { memo, useCallback, useEffect, useState } from 'react';
import '../styles/theme-toggle.css';

const STORAGE_KEY = 'cds-theme';

/** Reads the theme that is actually applied, rather than what we last set. */
const appliedTheme = () => document.documentElement.dataset.theme;

/** The visitor's explicit choice, or null. Reading can throw outright in a
 *  locked-down browser, which is not a reason to break the button. */
function storedChoice() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

/**
 * The light/dark switch, at the right end of the header's nav row.
 *
 * ── Why the icons swap in CSS, not in JSX ──
 *
 * Every route is prerendered (scripts/prerender.js) and hydrated, so the
 * server markup and the client's first render have to match exactly or
 * React throws #418 — see the long note in components/Seo.jsx. The server
 * has no idea which theme the visitor will get, because that is decided by
 * public/theme-init.js in the browser.
 *
 * So this renders BOTH icons, always, in both passes, and lets CSS pick one
 * off the data-theme attribute. The markup is theme-independent and the
 * hydration pass is identical to the server's by construction, rather than
 * by us being careful.
 *
 * The same constraint governs the ACCESSIBLE NAME, which is why the label
 * below is derived from React state rather than from the attribute. Both
 * aria-pressed and aria-label start from isDark === false in the server pass
 * and in the client's first pass, so the two are identical by construction,
 * and an effect corrects them after hydration. A visitor in dark mode gets
 * the light-mode name for one frame; the ICON is never wrong, because CSS
 * reads the attribute directly and the attribute is set before first paint.
 *
 * The name is phrased as the action the click performs ("Switch to dark
 * mode") rather than as a static object name. That is a change from the
 * footer version, which used a stable "Dark mode" plus aria-pressed on the
 * reasoning that a control should not rename itself mid-session.
 *
 * ── Storage ──
 *
 * One key, "cds-theme", written only when the visitor clicks this button.
 * Nothing is stored before that first click: until then the site simply
 * follows the operating system, including when the system setting changes
 * mid-visit. Clicking is what opts out of that, which is the point of it.
 * This is not a cookie and the site sets none.
 */
const ThemeToggle = memo(function ThemeToggle() {
  // Must be a constant for the first render: see the note above.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(appliedTheme() === 'dark');
  }, []);

  // With no explicit choice on record, keep following the system live. A
  // visitor whose machine flips to dark at sunset should see the site flip
  // too, without a reload.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    const onSystemChange = (event) => {
      if (storedChoice()) return;
      const next = event.matches ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      setIsDark(next === 'dark');
    };

    query.addEventListener('change', onSystemChange);
    return () => query.removeEventListener('change', onSystemChange);
  }, []);

  const toggle = useCallback(() => {
    // Flip from what is on the page, not from React state, so the button is
    // right even if something else moved the attribute.
    const next = appliedTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setIsDark(next === 'dark');

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* Storage blocked. The choice still applies to this page; it just
         will not survive a navigation. Better than failing the click. */
    }
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {/* Both icons ship in both themes; theme-toggle.css shows one. */}
      <svg
        className="theme-toggle__icon theme-toggle__icon--moon"
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1Z" />
      </svg>

      <svg
        className="theme-toggle__icon theme-toggle__icon--sun"
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="3.1" />
        <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.95 3.05l-1.13 1.13M4.18 11.82l-1.13 1.13M12.95 12.95l-1.13-1.13M4.18 4.18 3.05 3.05" />
      </svg>
    </button>
  );
});

export default ThemeToggle;
