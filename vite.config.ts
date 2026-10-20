import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // CloudFront sirve desde la raíz; GitHub Pages especifica --base en su workflow.
  base: '/',
  plugins: [react()],
})
