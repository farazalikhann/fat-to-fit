import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Serves from the custom domain root (https://fatfit.club/), configured via
// public/CNAME. Previously hosted at the GitHub Pages project-page subpath
// (https://farazalikhann.github.io/fat-to-fit/), which needed base set to
// that subpath - now that a custom domain serves from root, base is '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
