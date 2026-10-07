import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // dist/.vite/manifest.json: lets scripts/prerender.js link each route's
    // own CSS in the static HTML. See pageAssets() there.
    manifest: true,
  },
})
