import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // CloudFront sirve desde la raíz; GitHub Pages especifica --base en su workflow.
  base: '/',
  plugins: [react()],
  // En desarrollo, /api va al backend SyncPass local: mismo origen, sin CORS
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
