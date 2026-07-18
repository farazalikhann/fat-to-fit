import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// NOTE: currently set for GitHub Pages project-page hosting
// (https://farazalikhann.github.io/fat-to-fit/). Once a custom domain is
// configured (public/CNAME updated with a real domain), change this back
// to '/' so assets resolve at the domain root.
export default defineConfig({
  base: '/fat-to-fit/',
  plugins: [react()],
})
