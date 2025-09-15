import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use root for main domain deployment
  build: {
    sourcemap: true // Enable source maps for easier debugging of production errors
  }
})
