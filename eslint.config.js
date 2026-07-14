import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // dist-ssr is build output too — linting it reported "errors" in bundled
  // React internals that no one can act on.
  globalIgnores(['dist', 'dist-ssr']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // The Vercel functions and the build scripts run in Node, not the browser.
    // Without this they report `process` and `Buffer` as undefined — which is
    // why `npm run lint` has been red.
    files: ['api/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // The control characters in these regexes are the point: they are what we
    // are stripping out of untrusted input before it reaches an email.
    files: ['api/_lib/sanitize.js'],
    rules: {
      'no-control-regex': 'off',
    },
  },
])
