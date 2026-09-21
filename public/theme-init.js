/*
  Resolves the theme before the first paint.

  This has to run before the stylesheets so the page never renders light and
  then flips. It is loaded from the head of index.html as a plain <script
  src>, NOT inline: vercel.json sets script-src 'self' with no inline
  allowance, and that is not being loosened for a theme flash.

  Precedence:
    1. an explicit choice the visitor made with the footer toggle
    2. the operating system setting
    3. light

  localStorage is the only thing this site stores, it holds one key, and it
  is written only when the visitor clicks the toggle (see
  src/components/ThemeToggle.jsx). Reading it can throw outright in a
  locked-down browser, so the read is wrapped and a failure simply falls
  through to the system setting.
*/
(function () {
  var stored = null;

  try {
    stored = window.localStorage.getItem('cds-theme');
  } catch {
    /* Storage blocked or unavailable. Fall through to the system setting
       rather than failing; a visitor in a locked-down browser still gets a
       theme, they just cannot pin it. */
  }

  var theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

  document.documentElement.dataset.theme = theme;
})();
