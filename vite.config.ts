import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Base path para GitHub Pages (https://<usuario>.github.io/fullstack2/)
  base: '/fullstack2-proyecto-kt-main/',
  plugins: [react()],
})
